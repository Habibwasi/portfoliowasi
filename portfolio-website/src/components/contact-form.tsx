"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { contactLimits, honeypotField, type ContactField, type ContactFieldErrors } from "@/lib/contact-fields";
import { Button } from "./hw";

type Status = { kind: "idle" } | { kind: "pending" } | { kind: "success" } | { kind: "error"; message: string };

type FieldProps = {
  name: ContactField;
  label: string;
  errors?: string[];
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function Field({ name, label, errors, multiline = false, ...inputProps }: FieldProps) {
  const id = `${useId()}-${name}`;
  const errorId = `${id}-error`;
  const error = errors?.[0];
  const shared = {
    id,
    name,
    className: "hw-input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    ...inputProps,
  };

  return (
    <div className="hw-field">
      <label className="hw-field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? <textarea rows={6} {...shared} /> : <input {...shared} />}
      {error && (
        <p id={errorId} className="hw-field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Contact form (1.9): posts to /api/contact and shows pending, success and error states. */
export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const successRef = useRef<HTMLParagraphElement>(null);

  // The form is replaced by the success message, so move focus there for keyboard and screen reader users.
  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus({ kind: "pending" });
    setFieldErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setStatus({ kind: "success" });
        return;
      }
      const body: { error?: string; fieldErrors?: ContactFieldErrors } = await response.json().catch(() => ({}));
      setFieldErrors(body.fieldErrors ?? {});
      setStatus({ kind: "error", message: body.error ?? "The message couldn't be sent." });
    } catch {
      setStatus({ kind: "error", message: "I couldn't reach the server." });
    }
  }

  if (status.kind === "success") {
    return (
      <p ref={successRef} role="status" tabIndex={-1} className="hw-form__status hw-form__status--success">
        Thanks, your message is on its way. I&apos;ll reply by email.
      </p>
    );
  }

  const pending = status.kind === "pending";

  return (
    <form className="hw-form" onSubmit={handleSubmit}>
      <div className="hw-form__row">
        <Field name="name" label="Name" autoComplete="name" required maxLength={contactLimits.name} errors={fieldErrors.name} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          maxLength={contactLimits.email}
          errors={fieldErrors.email}
        />
      </div>
      <Field
        name="message"
        label="Message"
        multiline
        required
        minLength={contactLimits.messageMin}
        maxLength={contactLimits.message}
        errors={fieldErrors.message}
      />
      {/* Honeypot: hidden from people and assistive tech; bots that fill it are dropped by the server. */}
      <div className="hw-form__trap" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name={honeypotField} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {status.kind === "error" && (
        <p role="alert" className="hw-form__status hw-form__status--error">
          {status.message} You can also email me at <a href={`mailto:${email}`}>{email}</a>.
        </p>
      )}
      <div>
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
