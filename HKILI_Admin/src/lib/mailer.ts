import nodemailer from 'nodemailer'

/**
 * SMTP mailer for OTP / transactional emails.
 *
 * Required env (Vercel):
 *   SMTP_HOST  e.g. smtp.gmail.com  (Gmail: create an "App password")
 *   SMTP_PORT  465 (SSL) or 587 (STARTTLS) — defaults to 465
 *   SMTP_USER  the mailbox / username
 *   SMTP_PASS  the password / app password
 *   EMAIL_FROM optional display sender, defaults to SMTP_USER
 *
 * When these are not set, isEmailConfigured() is false and the auth flows
 * fall back to no-OTP mode (register works without verification) so the app
 * never hard-breaks on a missing mail server.
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const port = Number(process.env.SMTP_PORT || 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Unaï" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

export function otpEmailHtml(code: string, purpose: 'register' | 'reset'): string {
  const title = purpose === 'register' ? 'Verify your email' : 'Reset your password'
  const line =
    purpose === 'register'
      ? 'Use this code to finish creating your Unaï account:'
      : 'Use this code to reset your Unaï password:'
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:420px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(160deg,#00E676,#16a04a 45%,#073620);border-radius:16px;padding:28px;color:#fff;text-align:center">
      <div style="font-size:40px">📚✨</div>
      <h1 style="font-size:20px;margin:12px 0 6px">${title}</h1>
      <p style="margin:0 0 18px;opacity:.9">${line}</p>
      <div style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);border-radius:12px;padding:14px;font-size:32px;letter-spacing:10px;font-weight:800">${code}</div>
      <p style="margin:16px 0 0;font-size:12px;opacity:.8">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  </div>`
}
