import { Resend } from "resend";
import { site } from "@/content/site";
import { buildEmail, isHoneypotFilled, parseContact } from "@/lib/contact";
import { allowContact } from "@/lib/rate-limit";

/** The first address in x-forwarded-for is the client; Vercel sets this header itself. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request couldn't be read." }, { status: 400 });
  }

  // Bots fill the hidden field. Answer as if it worked so they don't retry.
  if (isHoneypotFilled(body)) return Response.json({ ok: true });

  const parsed = parseContact(body);
  if (!parsed.ok) {
    return Response.json({ error: "Please check the highlighted fields.", fieldErrors: parsed.fieldErrors }, { status: 400 });
  }

  if (!(await allowContact(clientIp(request)))) {
    return Response.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return Response.json({ error: "The form is offline right now." }, { status: 503 });
  }

  const { subject, html, text } = buildEmail(parsed.data);
  const { error } = await new Resend(apiKey).emails.send({
    // While the sender is onboarding@resend.dev, Resend only delivers to the account owner, which is Habib.
    from: "Portfolio contact <onboarding@resend.dev>",
    to: site.email,
    replyTo: parsed.data.email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Resend failed:", error);
    return Response.json({ error: "The message couldn't be sent." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
