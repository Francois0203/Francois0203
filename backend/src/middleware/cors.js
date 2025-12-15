const cors = require('cors');

const DEFAULT_ALLOWED = [
  'http://localhost:3000/Francois0203',
  'https://francois0203.github.io/Francois0203/'
];

function buildAllowedOrigins() {
  const env = process.env.ALLOWED_ORIGINS || '';
  const extras = env.split(',').map(s => s.trim()).filter(Boolean);
  return DEFAULT_ALLOWED.concat(extras);
}

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin denied'));
  }
};

module.exports = cors(corsOptions);
