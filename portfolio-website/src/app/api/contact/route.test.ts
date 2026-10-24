// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const allow = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock("@/lib/rate-limit", () => ({ allowContact: allow }));

const { POST } = await import("./route");

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "We have a graduate role on our platform team." };

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7, 10.0.0.1", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  send.mockResolvedValue({ data: { id: "1" }, error: null });
  allow.mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/contact", () => {
  it("sends the message to Habib with replyTo set to the sender", async () => {
    const response = await post(valid);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    const email = send.mock.calls[0][0];
    expect(email.to).toBe("habibwasi9@gmail.com");
    expect(email.replyTo).toBe("ada@example.com");
    expect(email.html).toContain("We have a graduate role");
  });

  it("returns field errors for invalid input and sends nothing", async () => {
    const response = await post({ ...valid, email: "nope" });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors.email).toBeDefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("quietly drops a filled honeypot", async () => {
    const response = await post({ ...valid, website: "https://spam.example" });
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("limits by the client IP", async () => {
    allow.mockResolvedValue(false);
    const response = await post(valid);
    expect(response.status).toBe(429);
    expect(allow).toHaveBeenCalledWith("203.0.113.7");
    expect(send).not.toHaveBeenCalled();
  });

  it("reports a Resend failure instead of claiming success", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await post(valid)).status).toBe(502);
  });

  it("says when email isn't configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await post(valid)).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
});
