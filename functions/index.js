/**
 * Cloud Functions - portfolio contact notifications.
 *
 * Fires whenever a new document is created in the `contacts` collection (i.e.
 * a visitor submits the Connect form) and emails a nicely formatted summary to
 * the site owner. Replying to that email goes straight back to the visitor.
 *
 * Config (set once - see functions/README.md):
 *   SMTP_HOST      param   default smtp.gmail.com
 *   SMTP_PORT      param   default 465
 *   SMTP_USER      param   the mailbox that sends the notification
 *   NOTIFY_TO      param   where notifications are delivered
 *   SMTP_PASSWORD  secret  the SMTP / Gmail app password
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');

const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' });
const SMTP_USER = defineString('SMTP_USER');
const NOTIFY_TO = defineString('NOTIFY_TO', { default: 'francoismeiring0203@gmail.com' });
const SMTP_PASSWORD = defineSecret('SMTP_PASSWORD');

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatWhen = (createdAt) => {
  const d = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date();
  try {
    return d.toLocaleString('en-ZA', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Africa/Johannesburg',
    });
  } catch {
    return d.toISOString();
  }
};

// A self-contained, email-client-friendly (table + inline styles) HTML message.
const buildHtml = ({ name, email, message, when }) => {
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeMessage = esc(message).replace(/\r?\n/g, '<br>');
  const emailCell = email
    ? `<a href="mailto:${safeEmail}" style="color:#c05621;text-decoration:none;font-weight:600;">${safeEmail}</a>`
    : '<span style="color:#94a3b8;">not provided</span>';

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">New message from ${safeName} via your portfolio.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#c05621;padding:22px 28px;">
          <div style="color:#ffffff;font-size:18px;font-weight:700;">New message from your portfolio</div>
          <div style="color:#ffe8d6;font-size:13px;margin-top:2px;">Someone reached out through your Connect page</div>
        </td></tr>
        <tr><td style="padding:26px 28px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3f3f46;">
            <tr>
              <td style="padding:6px 0;width:110px;color:#71717a;">From</td>
              <td style="padding:6px 0;font-weight:600;color:#18181b;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;">Email</td>
              <td style="padding:6px 0;">${emailCell}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;vertical-align:top;">Received</td>
              <td style="padding:6px 0;color:#3f3f46;">${esc(when)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 28px 26px;">
          <div style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Message</div>
          <div style="background:#fafafa;border:1px solid #ececed;border-left:3px solid #c05621;border-radius:8px;padding:16px 18px;color:#27272a;font-size:15px;line-height:1.7;white-space:normal;">${safeMessage}</div>
        </td></tr>
        <tr><td style="padding:0 28px 26px;">
          <div style="color:#71717a;font-size:13px;line-height:1.6;">
            Just hit <strong>Reply</strong> to respond to ${safeName} directly${email ? ` at ${safeEmail}` : ''}.
          </div>
        </td></tr>
        <tr><td style="background:#fafafa;border-top:1px solid #ececed;padding:14px 28px;color:#a1a1aa;font-size:12px;">
          Automated notification from your portfolio contact form.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const buildText = ({ name, email, message, when }) =>
  `New message from your portfolio\n\n` +
  `From:     ${name}\n` +
  `Email:    ${email || 'not provided'}\n` +
  `Received: ${when}\n\n` +
  `Message:\n${message}\n\n` +
  `Reply to this email to respond${email ? ` to ${email}` : ''}.`;

exports.onContactMessage = onDocumentCreated(
  {
    document: 'contacts/{id}',
    region: 'europe-west1', // must match the Firestore database location

    secrets: [SMTP_PASSWORD],
    maxInstances: 5,
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) {
      logger.warn('Contact trigger fired with no document data', { id: event.params.id });
      return;
    }

    const payload = {
      name: (data.name || '').trim() || 'Anonymous',
      email: (data.email || '').trim(),
      message: (data.message || '').trim() || '(empty message)',
      when: formatWhen(data.createdAt),
    };

    const port = Number(SMTP_PORT.value()) || 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST.value(),
      port,
      secure: port === 465,
      auth: { user: SMTP_USER.value(), pass: SMTP_PASSWORD.value() },
    });

    try {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${SMTP_USER.value()}>`,
        to: NOTIFY_TO.value(),
        replyTo: payload.email || undefined,
        subject: `New message from ${payload.name}`,
        text: buildText(payload),
        html: buildHtml(payload),
      });
      logger.info('Contact notification sent', { id: event.params.id, from: payload.email });
    } catch (err) {
      // Don't rethrow - a retry storm won't fix bad credentials, and the message
      // is safely stored in Firestore regardless. Surface it loudly in logs.
      logger.error('Failed to send contact notification', {
        id: event.params.id,
        error: err?.message,
      });
    }
  },
);
