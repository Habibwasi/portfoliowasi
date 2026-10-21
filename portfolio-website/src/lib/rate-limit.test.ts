// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();

vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit;
    },
    { slidingWindow: () => ({}) },
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
