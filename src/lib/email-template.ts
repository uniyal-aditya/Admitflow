const BASE = "https://admitflowin.vercel.app";

export function emailTemplate(title: string, body: string, url?: string, notices?: { title: string; url: string }[]) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 16px">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:100%">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
            <img src="${BASE}/logo.svg" alt="AdmitFlow" width="40" height="40" style="display:block;margin:0 auto 8px" />
            <h1 style="color:#ffffff;margin:0;font-size:18px;font-weight:600">AdmitFlow</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
            <h2 style="margin:0 0 12px;color:#111827;font-size:18px">${title}</h2>
            <p style="color:#4b5563;line-height:1.7;margin:0 0 16px">${body}</p>
            ${url ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#4f46e5;padding:10px 24px;border-radius:8px"><a href="${url}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:500">View Details</a></td></tr></table>` : ""}
            ${notices && notices.length > 0 ? `
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
            <p style="color:#6b7280;font-size:13px;font-weight:600;margin:0 0 8px">New notices you may have missed:</p>
            ${notices.map((n) => `<p style="margin:0 0 6px"><a href="${n.url}" style="color:#4f46e5;font-size:13px;text-decoration:none">${n.title}</a></p>`).join("")}
            ` : ""}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
            <p style="color:#9ca3af;font-size:12px;margin:0">You received this because email notifications are enabled in your <a href="${BASE}/settings" style="color:#9ca3af">AdmitFlow</a> settings.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
