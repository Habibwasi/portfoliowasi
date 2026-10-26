// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
const slidingWindow = vi.fn(() => ({}));
const fixedWindow = vi.fn(() => ({}));

vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit;
    },
    { slidingWindow, fixedWindow },
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

  it("fails open when Upstash doesn't answer in time", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValue({ success: true, reason: "timeout" });
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

  it("allows 10 questions per visitor per 10 minutes and 90 a day across the site", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    limit.mockResolvedValue({ success: true });
    const { allowGuide } = await load();
    await allowGuide("1.2.3.4");
    expect(slidingWindow).toHaveBeenCalledWith(10, "10 m");
    // Groq's free tier allows roughly 100 answers a day (200K tokens), so the guide goes busy first.
    expect(fixedWindow).toHaveBeenCalledWith(90, "1 d");
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

  // An unreachable Upstash doesn't throw: after `timeout` the limiter resolves with success and
  // reason "timeout" (checked against a real unreachable host, 2026-10-26).
  it("fails closed when Upstash doesn't answer in time, though the limiter then reports success", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    limit.mockResolvedValue({ success: true, reason: "timeout" });
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
    expect(limit).toHaveBeenCalledTimes(1);
  });

  it("fails closed when only the daily cap times out", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: true, reason: "timeout" });
    const { allowGuide } = await load();
    expect(await allowGuide("1.2.3.4")).toBe(false);
  });
});
