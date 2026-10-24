import { describe, expect, it } from "vitest";
import { buildEmail, escapeHtml, parseContact } from "./contact";

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "We have a graduate role on our platform team." };

describe("parseContact", () => {
  it("accepts a valid message and trims it", () => {
    const result = parseContact({ ...valid, name: "  Ada Lovelace  " });
    expect(result).toEqual({ ok: true, data: valid });
  });

  it.each([
    ["name", { name: "" }],
    ["name", { name: "x".repeat(101) }],
    ["email", { email: "not-an-email" }],
    ["message", { message: "Hi" }],
    ["message", { message: "x".repeat(5001) }],
  ])("rejects a bad %s with a message for that field", (field, override) => {
    const result = parseContact({ ...valid, ...override });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors[field as keyof typeof result.fieldErrors]?.[0]).toBeTruthy();
  });

  it("rejects a body that isn't an object", () => {
    expect(parseContact("hello").ok).toBe(false);
    expect(parseContact(null).ok).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes markup", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });
});

describe("buildEmail", () => {
  it("escapes every field in the HTML body", () => {
    const { html } = buildEmail({ ...valid, name: "<b>Ada</b>", message: "<script>x</script>\nline two" });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Ada</b>");
    expect(html).toContain("&lt;script&gt;x&lt;/script&gt;<br>line two");
  });

  it("keeps line breaks out of the subject", () => {
    const { subject } = buildEmail({ ...valid, name: "Ada\r\nBcc: someone@example.com" });
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain("Ada");
  });

  it("includes a plain-text version", () => {
    expect(buildEmail(valid).text).toContain(valid.message);
  });
});
