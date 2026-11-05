// The notification email for a new contact message. Tables and inline styles, so every mail app shows it right.

const SITE = 'https://francois-portfolio.web.app';
const NIGHT = '#151834';
const INK = '#12131c';
const INK_2 = '#474b5e';
const INK_3 = '#7a7f94';
const BLUE = '#5b6cff';
const BLUE_INK = '#2f3bd1';
const STRIPE = ['#5b6cff', '#20c58b', '#ff7a4d', '#a87bff', '#ffc63a'];
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const initials = (name = '') => name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

const stripe = STRIPE.map(c => `<td height="5" style="height:5px;line-height:5px;font-size:0;background:${c};">&nbsp;</td>`).join('');

const buildHtml = ({ name, email, message, when, flags = [] }) => {
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeMessage = esc(message).replace(/\r?\n/g, '<br>');
  const words = String(message).trim().split(/\s+/).filter(Boolean).length;
  const replyHref = email ? `mailto:${safeEmail}?subject=${encodeURIComponent('Re: your message on my portfolio')}` : '';

  const warning = flags.length ? `
        <tr><td style="padding:22px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6dc;border:1px solid #ffe08f;border-radius:12px;">
            <tr><td style="padding:12px 16px;font-family:${FONT};font-size:13px;line-height:1.5;color:#7a5600;">
              <strong style="color:#5c4100;">This looks like spam.</strong> It was kept in case it is real.<br>
              <span style="color:#7a5600;">Why: ${esc(flags.join(', '))}</span>
            </td></tr>
          </table>
        </td></tr>` : '';

  const replyButton = email ? `
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td align="center" bgcolor="${BLUE}" style="border-radius:999px;background:${BLUE};">
              <a href="${replyHref}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Reply to ${safeName.split(' ')[0]} &rarr;</a>
            </td></tr>
          </table>` : `
          <div style="font-family:${FONT};font-size:13px;color:${INK_3};text-align:center;">No email address was given, so this one cannot be answered.</div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>New message from ${safeName}</title>
</head>
<body style="margin:0;padding:0;background:#eceef6;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eceef6;">${safeName}: ${esc(String(message).slice(0, 110))}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceef6;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px -18px rgba(36,42,110,0.35);">

        <tr><td bgcolor="${NIGHT}" style="background:${NIGHT};padding:26px 32px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:${FONT};">
                <div style="font-size:12px;font-weight:600;color:#a9b2ff;">francois-portfolio.web.app</div>
                <div style="margin-top:6px;font-size:22px;line-height:1.25;font-weight:700;color:#ffffff;">You have a new message</div>
              </td>
              <td align="right" valign="top" style="font-family:${FONT};font-size:12px;color:#c8cce6;white-space:nowrap;">Connect form</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0;font-size:0;line-height:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${stripe}</tr></table></td></tr>
${warning}
        <tr><td style="padding:26px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="52" valign="middle">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td width="44" height="44" align="center" valign="middle" bgcolor="#eceefe" style="width:44px;height:44px;border-radius:50%;background:#eceefe;border:2px solid ${BLUE};font-family:${FONT};font-size:15px;font-weight:700;color:${BLUE_INK};">${esc(initials(name))}</td>
                </tr></table>
              </td>
              <td valign="middle" style="font-family:${FONT};padding-left:12px;">
                <div style="font-size:17px;font-weight:700;color:${INK};">${safeName}</div>
                <div style="margin-top:2px;font-size:14px;">${email ? `<a href="mailto:${safeEmail}" style="color:${BLUE_INK};text-decoration:none;">${safeEmail}</a>` : `<span style="color:${INK_3};">no email given</span>`}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;border-radius:14px;border:1px solid #e2e4ee;">
            <tr><td width="4" style="width:4px;background:${BLUE};border-radius:14px 0 0 14px;font-size:0;">&nbsp;</td>
            <td style="padding:18px 20px;font-family:${FONT};font-size:15px;line-height:1.7;color:${INK};">${safeMessage}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:12px 32px 0;font-family:${FONT};font-size:12px;color:${INK_3};">
          ${esc(when)} &nbsp;&middot;&nbsp; ${words} ${words === 1 ? 'word' : 'words'}
        </td></tr>

        <tr><td style="padding:28px 32px 8px;">${replyButton}
        </td></tr>
        <tr><td align="center" style="padding:6px 32px 28px;font-family:${FONT};font-size:13px;color:${INK_3};">
          or <a href="${SITE}/admin" style="color:${INK_2};font-weight:600;">open your inbox in admin</a>
        </td></tr>

        <tr><td style="background:#f6f7fb;border-top:1px solid #e2e4ee;padding:16px 32px;font-family:${FONT};font-size:12px;line-height:1.5;color:${INK_3};">
          Sent automatically when someone uses the Connect page on <a href="${SITE}" style="color:${INK_3};">your portfolio</a>. Replying goes straight to ${email ? safeEmail : 'the sender'}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const buildText = ({ name, email, message, when, flags = [] }) =>
  `You have a new message on your portfolio\n\n` +
  (flags.length ? `This looks like spam (${flags.join(', ')}). It was kept in case it is real.\n\n` : '') +
  `From:     ${name}\n` +
  `Email:    ${email || 'not provided'}\n` +
  `Received: ${when}\n\n` +
  `${message}\n\n` +
  (email ? `Reply to this email to answer ${name}.\n` : '') +
  `Inbox: ${SITE}/admin`;

module.exports = { buildHtml, buildText, esc };
