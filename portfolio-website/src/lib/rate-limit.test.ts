// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();

vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit;
    },
    { slidingWindow: () => ({}), fixedWindow: () => ({}) },
  ),
}));

async function load() {
  vi.resetModules();
  return import("./rate-limit");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("allowContact", () => {
  it("allows everything when Upstash isn't configured", async () => {
    vi.stubEnv("KV_REST_API_URL", "");
    const { allowContact } = await load();
    expect(await allowContact("1.2.3.4")).toBe(true);
    expect(limit).not.toHaveBeenCalled();
  });

  it("follows the limiter when configured", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValue({ success: false });
    const { allowContact } = await load();
    expect(await allowContact("1.2.3.4")).toBe(false);
    expect(limit).toHaveBeenCalledWith("1.2.3.4");
  });

  it("fails open when Upstash errors, so the form keeps working", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { allowContact } = await load();
    expect(await allowContact("1.2.3.4")).toBe(true);
  });
});

describe("allowGuide", () => {
  it("allows questions without Upstash outside production, so local dev works", async () => {
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(true);
  });

  it("refuses questions without Upstash in production (fails closed)", async () => {
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
  });

  it("checks the visitor's limit, then the site's daily cap", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValue({ success: true });
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(true);
    expect(limit).toHaveBeenNthCalledWith(1, "1.2.3.4");
    expect(limit).toHaveBeenNthCalledWith(2, "site");
  });

  it("doesn't spend the daily cap on a visitor who is already limited", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValueOnce({ success: false });
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
    expect(limit).toHaveBeenCalledTimes(1);
  });

  it("refuses when the daily cap is reached", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
  });

  it("fails closed when Upstash errors, to protect the model quota", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
  });
});
