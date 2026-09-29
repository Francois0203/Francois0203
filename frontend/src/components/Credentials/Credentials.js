import { useState } from 'react';
import useReveal from '../../hooks/useReveal';
import styles from './Credentials.module.css';

/*
 * Certifications as a path of badges. An earned badge shows its real image and
 * links to its verification; anything not yet earned is drawn as an outline
 * with its exam code, so nothing on the page claims a badge that is not held.
 */

const STATUSES = ['earned', 'booked', 'studying', 'planned'];

export const toCredential = (c = {}) => {
  const given = String(c.status || '').toLowerCase().trim();
  const status = STATUSES.includes(given)
    ? given
    : (c.badgeUrl || c.start || c.issued) ? 'earned' : 'planned';

  return {
    id: c.id,
    name: c.credential || c.name || c.title || '',
    code: c.code || '',
    level: c.level || '',
    issuer: c.issuer || c.organisation || '',
    status,
    badgeUrl: status === 'earned' ? (c.badgeUrl || '') : '',
    verifyUrl: status === 'earned' ? (c.verifyUrl || '') : '',
    issued: c.start || c.issued || c.period || '',
    expires: c.end || c.expires || '',
    examDate: c.examDate || '',
    note: c.description || '',
    order: c.order ?? 9999,
  };
};

// An exam code is what puts a certification on the badge path.
export const onPath = (c) => Boolean(String(c?.code ?? '').trim());

const when = (c, t) => {
  if (c.status === 'earned') return [c.issued, c.expires && `${t.expiresLabel} ${c.expires}`].filter(Boolean).join(', ');
  if (c.status === 'booked') return c.examDate;
  return '';
};

const Outline = ({ code, level }) => (
  <svg className={styles.outline} viewBox="0 0 120 132" aria-hidden="true">
    <path d="M60 4 L112 34 L112 98 L60 128 L8 98 L8 34 Z" />
    {code && <text x="60" y={level ? 62 : 70} textAnchor="middle" className={styles.code}>{code}</text>}
    {level && <text x="60" y="80" textAnchor="middle" className={styles.level}>{level}</text>}
  </svg>
);

// A URL that is not an image falls back to the outline instead of a broken icon.
const Badge = ({ c }) => {
  const [failed, setFailed] = useState(false);
  const image = c.badgeUrl && !failed;
  return (
    <div className={styles.badge} data-image={image ? '' : undefined}>
      {image
        ? (
          <img
            src={c.badgeUrl}
            alt={`${c.name} badge`}
            width="340"
            height="340"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )
        : <Outline code={c.code} level={c.level} />}
    </div>
  );
};

const Credentials = ({ items = [], labels = {}, detailed = false }) => {
  const [ref, shown] = useReveal({ threshold: 0.08 });
  const list = items.map(toCredential).filter(c => c.name).sort((a, b) => a.order - b.order);
  if (!list.length) return null;

  const statusLabel = {
    earned: labels.statusEarned,
    booked: labels.statusBooked,
    studying: labels.statusStudying,
    planned: labels.statusPlanned,
  };

  return (
    <ol
      ref={ref}
      className={styles.path}
      data-shown={shown ? '' : undefined}
      data-detailed={detailed ? '' : undefined}
      style={{ '--step': '80ms' }}
    >
      {list.map((c, i) => {
        const date = when(c, labels);
        return (
          <li key={c.id ?? c.name} className={styles.stop} data-status={c.status} data-rise style={{ '--i': i, '--rise': '12px' }}>
            <Badge c={c} />

            <p className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              {statusLabel[c.status]}
              {date && <span className={styles.date}>{date}</span>}
            </p>

            <h3 className={styles.name}>{c.name}</h3>
            <p className={styles.meta}>{[c.issuer, c.code].filter(Boolean).join(' / ')}</p>

            {detailed && c.note && <p className={styles.note}>{c.note}</p>}

            {c.verifyUrl && (
              <a className={styles.verify} href={c.verifyUrl} target="_blank" rel="noreferrer">
                {labels.verifyLabel}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Credentials;
