import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return transporter;
}

export function getSmtpFrom(): string {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@admitflow.in";
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.log(`--- EMAIL to ${options.to}: ${options.subject} ---`);
    return;
  }
  await t.sendMail({
    from: `"AdmitFlow" <${getSmtpFrom()}>`,
    ...options,
  });
}
