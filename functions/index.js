const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

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

// The email, built with tables and inline styles so mail apps show it right.
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
      logger.info('Contact notification sent', { id: event.params.id });
    } catch (err) {
      logger.error('Failed to send contact notification', {
        id: event.params.id,
        error: err?.message,
      });
    }
  },
);

// Spam limits for the contact form.
const LIMITS = {
  perSenderShort: { count: 2, ms: 10 * 60 * 1000 },
  perSenderDay: 5,
  perEmailDay: 5,
  everyoneDay: 40,
  minFillMs: 3000,
};
const DAY = 24 * 60 * 60 * 1000;
const KEEP_DAYS = 365;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A one-way scramble, so no address or IP is ever stored as it is.
const scramble = (value) => crypto.createHash('sha256').update(`fm-portfolio:${value}`).digest('hex').slice(0, 40);

/*
 * The caller's address. Google's front end APPENDS the real address to X-Forwarded-For,
 * after anything the caller sent in that header themselves, so only the LAST entry can be
 * trusted. Taking the first let a spammer invent a new "address" per request and walk
 * straight past the per-sender limits.
 */
const clientIp = (req) => {
  const hops = String(req?.headers?.['x-forwarded-for'] ?? '').split(',').map(h => h.trim()).filter(Boolean);
  return hops[hops.length - 1] || req?.ip || 'unknown';
};

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Deletes a few spent rate records each time, so the collection never grows.
const sweepLimits = async () => {
  const old = await db.collection('rateLimits').where('expireAt', '<', Timestamp.now()).limit(25).get();
  if (old.empty) return;
  const batch = db.batch();
  old.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

// The Connect form posts here. It checks for bots and limits, then saves the letter.
exports.sendMessage = onCall(
  {
    region: 'europe-west1',
    maxInstances: 5,
    cors: [/francois-portfolio\.(web\.app|firebaseapp\.com)$/, /^https?:\/\/localhost(:\d+)?$/],
    // Refuse any call without a valid App Check (reCAPTCHA Enterprise) token from this site.
    enforceAppCheck: true,
  },
  async (request) => {
    const d = request.data ?? {};
    const name = text(d.name, 100);
    const email = text(d.email, 254);
    const message = text(d.message, 5000);

    // Bots fill the hidden field or post instantly. They get a quiet fake success.
    if (text(d.company, 200) || Number(d.elapsed) < LIMITS.minFillMs) {
      logger.info('Contact form: dropped a likely bot');
      return { ok: true };
    }
    if (!name || !message || !EMAIL.test(email)) {
      throw new HttpsError('invalid-argument', 'The name, email or message is missing or not valid.');
    }

    const now = Date.now();
    const sender = scramble(clientIp(request.rawRequest));
    const inbox = scramble(email.toLowerCase());
    const fingerprint = scramble(`${email.toLowerCase()}|${message.toLowerCase()}`);
    const day = new Date(now).toISOString().slice(0, 10);
    const refs = {
      sender: db.doc(`rateLimits/s-${sender}`),
      inbox: db.doc(`rateLimits/e-${inbox}`),
      repeat: db.doc(`rateLimits/m-${fingerprint}`),
      everyone: db.doc(`rateLimits/day-${day}`),
    };

    const verdict = await db.runTransaction(async (tx) => {
      const [s, e, m, all] = await Promise.all(Object.values(refs).map(r => tx.get(r)));
      if (m.exists) return 'repeat';
      const sentBy = (s.get('times') ?? []).filter(t => now - t < DAY);
      const recent = sentBy.filter(t => now - t < LIMITS.perSenderShort.ms);
      const sentTo = (e.get('times') ?? []).filter(t => now - t < DAY);
      if (recent.length >= LIMITS.perSenderShort.count || sentBy.length >= LIMITS.perSenderDay || sentTo.length >= LIMITS.perEmailDay) return 'sender';
      if ((all.get('count') ?? 0) >= LIMITS.everyoneDay) return 'everyone';

      const expireAt = Timestamp.fromMillis(now + DAY);
      tx.set(refs.sender, { times: [...sentBy, now], expireAt });
      tx.set(refs.inbox, { times: [...sentTo, now], expireAt });
      tx.set(refs.repeat, { expireAt });
      tx.set(refs.everyone, { count: FieldValue.increment(1), expireAt: Timestamp.fromMillis(now + 2 * DAY) }, { merge: true });
      tx.create(db.collection('contacts').doc(), {
        name, email, message,
        createdAt: FieldValue.serverTimestamp(),
        expireAt: Timestamp.fromMillis(now + KEEP_DAYS * DAY),
      });
      return 'sent';
    });

    sweepLimits().catch(err => logger.warn('Rate limit sweep failed', { error: err?.message }));

    if (verdict === 'repeat') return { ok: true };
    if (verdict !== 'sent') {
      logger.info('Contact form: limit reached', { verdict });
      throw new HttpsError('resource-exhausted', verdict === 'everyone' ? 'everyone' : 'sender');
    }
    return { ok: true };
  },
);
