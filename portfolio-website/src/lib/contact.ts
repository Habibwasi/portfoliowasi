import { z } from "zod";
import { contactLimits, honeypotField, type ContactFieldErrors } from "./contact-fields";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(contactLimits.name, `Please keep your name under ${contactLimits.name} characters.`),
  email: z
    .string()
    .trim()
    .max(contactLimits.email, "That email address is too long.")
    .pipe(z.email("Please enter a valid email address.")),
  message: z
    .string()
    .trim()
    .min(contactLimits.messageMin, `Please write at least ${contactLimits.messageMin} characters.`)
    .max(contactLimits.message, `Please keep the message under ${contactLimits.message} characters.`),
});

export type ContactMessage = z.infer<typeof contactSchema>;

export function parseContact(
  body: unknown,
): { ok: true; data: ContactMessage } | { ok: false; fieldErrors: ContactFieldErrors } {
  const result = contactSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, fieldErrors: z.flattenError(result.error).fieldErrors };
}

export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>)[honeypotField];
  return typeof value === "string" && value.trim() !== "";
}

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/** The email Habib receives. Every field is escaped; the subject stays on one line. */
export function buildEmail({ name, email, message }: ContactMessage) {
  const oneLineName = name.replace(/\s+/g, " ");
  return {
    subject: `Portfolio message from ${oneLineName}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: [
      "<h2>New message from the portfolio</h2>",
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      `<p>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>`,
    ].join("\n"),
  };
}
