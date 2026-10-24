/**
 * Field names and limits shared by the contact form (client) and /api/contact (server).
 * Kept apart from contact.ts so the form doesn't ship Zod to the browser.
 */
export const contactLimits = {
  name: 100,
  email: 200,
  messageMin: 10,
  message: 5000,
} as const;

export type ContactField = "name" | "email" | "message";
export type ContactFieldErrors = Partial<Record<ContactField, string[]>>;

/** Name of the hidden field bots fill in and people never see. */
export const honeypotField = "website";
