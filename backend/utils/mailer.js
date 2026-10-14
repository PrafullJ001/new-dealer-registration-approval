const nodemailer = require('nodemailer');
const { INVITE_HOURS, RESET_HOURS } = require('../config/constants');

const ROLE_NAME = { ADMIN: 'Admin', APPROVER: 'Approver', CREATOR: 'Creator' };

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function send(to, subject, text, html) {
  const mailer = getTransporter();
  if (!mailer) {
    // no SMTP settings, so print the mail and the link can still be used
    console.log(`\n--- mail (SMTP not configured) ---\nTo: ${to}\nSubject: ${subject}\n${text}\n----------------------------------\n`);
    return;
  }
  await mailer.sendMail({ from: process.env.MAIL_FROM, to, subject, text, html });
}

// one plain, formal layout for every email: short message, one button, fallback link
function layout({ name, lines, button, link, note }) {
  const body = lines.map((l) => `<p style="margin:0 0 12px;">${esc(l)}</p>`).join('');
  const href = esc(link);
  return `<!doctype html>
<html>
<body style="margin:0;background:#f2f4f7;font-family:Arial,Helvetica,sans-serif;color:#1b2432;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #d5dae1;">
        <tr><td style="background:#14253f;color:#ffffff;padding:16px 24px;font-size:17px;font-weight:bold;">Dealer Onboarding Portal</td></tr>
        <tr><td style="padding:28px 24px 8px;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 12px;">Hello ${esc(name)},</p>
          ${body}
          <p style="margin:22px 0;"><a href="${href}" style="background:#1a5fb4;color:#ffffff;text-decoration:none;padding:12px 26px;display:inline-block;font-weight:bold;">${esc(button)}</a></p>
          <p style="margin:0 0 16px;color:#5d6b7a;font-size:13px;">${esc(note)}</p>
        </td></tr>
        <tr><td style="padding:14px 24px 22px;border-top:1px solid #e5e8ec;color:#5d6b7a;font-size:12px;line-height:1.5;">
          If the button does not work, copy this link into your browser:<br>
          <a href="${href}" style="color:#1a5fb4;word-break:break-all;">${href}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function sendInvite(user, link) {
  const role = ROLE_NAME[user.role];
  const note = `This link works once and expires in ${INVITE_HOURS} hours.`;
  const text =
    `Hello ${user.name},\n\n` +
    `An administrator has created an account for you on the Dealer Onboarding Portal. Your role: ${role}.\n` +
    `Set your password to activate it:\n${link}\n\n${note}\n`;
  const html = layout({
    name: user.name,
    lines: [
      'An administrator has created an account for you on the Dealer Onboarding Portal.',
      `Your role: ${role}. Set your password to activate the account.`,
    ],
    button: 'Set your password',
    link,
    note,
  });
  return send(user.email, 'Your Dealer Onboarding Portal account', text, html);
}

function sendReset(user, link) {
  const note = `This link works once and expires in ${RESET_HOURS} hour. If you did not request this, you can ignore this email.`;
  const text =
    `Hello ${user.name},\n\n` +
    `We received a request to reset your password.\n` +
    `Choose a new password here:\n${link}\n\n${note}\n`;
  const html = layout({
    name: user.name,
    lines: ['We received a request to reset your password.'],
    button: 'Reset password',
    link,
    note,
  });
  return send(user.email, 'Reset your password', text, html);
}

module.exports = { send, sendInvite, sendReset };