const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');
const { buildHtml, buildText } = require('./email');
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
      flags: data.flagged ? (Array.isArray(data.flags) && data.flags.length ? data.flags : ['marked by the spam screen']) : [],
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
        subject: `${data.flagged ? '[Likely spam] ' : ''}New message from ${payload.name}`,
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

// Google's front end appends the real address to X-Forwarded-For, so only the last entry is trustworthy.
const clientIp = (req) => {
  const hops = String(req?.headers?.['x-forwarded-for'] ?? '').split(',').map(h => h.trim()).filter(Boolean);
  return hops[hops.length - 1] || req?.ip || 'unknown';
};

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Link spam is dropped with a quiet success; anything that only looks like spam is saved but flagged, so no real enquiry is lost.
const LINK = /(https?:\/\/|www\.|\[url|<a\s|\b[a-z0-9-]+\.(ru|cn|xyz|top|click|link|shop|online|site|info|biz)\b)/gi;
const HTML = /<\/?(a|p|div|span|img|script|iframe|b|i|u|strong|em|br|font|center)\b[^>]*>|\[\/?url/i;
const SPAM_WORDS = /\b(crypto|bitcoin|btc|forex|casino|betting|viagra|cialis|porn|escort|seo|backlinks?|guest post|lead generation|first page of google|rank(?:ing)? your (?:site|website)|increase your (?:website )?traffic|web ?design (?:services?|agency)|digital marketing (?:services?|agency)|investment opportunity|make money|click here|telegram|unsubscribe|dear (?:sir|madam))\b/gi;
const NON_LATIN = /[\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/g;

const screen = ({ name = '', body = '', extra = [] }) => {
  const all = [body, ...extra].filter(Boolean).join(' ');
  const links = (all.match(LINK) || []).length;
  if (links > 2 || HTML.test(all) || /(https?:\/\/|www\.)/i.test(name)) return { drop: true, flags: [] };

  const flags = [];
  const words = [...new Set((all.match(SPAM_WORDS) || []).map((w) => w.toLowerCase()))];
  if (words.length) flags.push(`spam words: ${words.slice(0, 4).join(', ')}`);
  if (links === 2) flags.push('two links');
  if (/[^\s@]+@[^\s@]+\.[^\s@]+|\d{6,}/.test(name)) flags.push('contact details in the name');
  const letters = all.replace(/[^\p{L}]/gu, '');
  if (letters.length >= 20 && letters.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.6) flags.push('mostly capitals');
  if (/(.)\1{5,}/u.test(all)) flags.push('repeated characters');
  if (letters.length >= 10 && (all.match(NON_LATIN) || []).length / letters.length > 0.3) flags.push('unexpected alphabet');
  return { drop: false, flags };
};
const flagFields = (flags) => (flags.length ? { flagged: true, flags } : { flagged: false });

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
    const check = screen({ name, body: message });
    if (check.drop) {
      logger.info('Contact form: dropped link spam');
      return { ok: true };
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
        ...flagFields(check.flags),
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
