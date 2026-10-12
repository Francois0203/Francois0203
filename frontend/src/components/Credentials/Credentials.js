import { useState } from 'react';
import useReveal from '../../hooks/useReveal';
import Chip from '../Chip';
import Shape from '../Shape';
import styles from './Credentials.module.css';


const STATUSES = ['earned', 'booked', 'studying', 'planned'];

export const toCredential = (c = {}) => {
  const given = String(c.status || '').toLowerCase().trim();
  const status = STATUSES.includes(given)
    ? given
    : (c.badgeUrl || c.start) ? 'earned' : 'planned';

  return {
    id: c.id,
    name: c.credential || '',
    code: c.code || '',
    level: c.level || '',
    issuer: c.issuer || '',
    status,
    badgeUrl: status === 'earned' ? (c.badgeUrl || '') : '',
    verifyUrl: status === 'earned' ? (c.verifyUrl || '') : '',
    issued: c.start || '',
    expires: c.end || '',
    examDate: c.examDate || '',
    note: c.description || '',
    order: c.order ?? 9999,
  };
};

export const onPath = (c) => Boolean(String(c?.code ?? '').trim());

const when = (c, t) => {
  if (c.status === 'earned') return [c.issued, c.expires && `${t.expiresLabel} ${c.expires}`].filter(Boolean).join(', ');
  if (c.status === 'booked') return c.examDate;
  return '';
};

const DOT = { earned: 'live', booked: 'live', studying: 'ink', planned: 'off' };

const shortName = (name) => name.replace(/^AWS Certified\s+/i, '');

const LEVEL = {
  foundational: { kind: 'circle', colour: 'yellow' },
  associate: { kind: 'squircle', colour: 'blue' },
  professional: { kind: 'hexagon', colour: 'pink' },
};

const Outline = ({ code, level }) => {
  const look = LEVEL[String(level).toLowerCase()] ?? { kind: 'star', colour: 'green' };
  return (
    <span className={styles.outline} aria-hidden="true">
      <Shape kind={look.kind} colour={look.colour} className={styles.outlineShape} />
      {code && <span className={styles.code}>{code.split('-')[0]}</span>}
    </span>
  );
};

const Badge = ({ c }) => {
  const [failed, setFailed] = useState(false);
  const image = c.badgeUrl && !failed;
  return (
    <div className={styles.badge} data-image={image ? '' : undefined}>
      {image
        ? <img src={c.badgeUrl} alt={`${c.name} badge`} width="160" height="160" loading="lazy" onError={() => setFailed(true)} />
        : <Outline code={c.code} level={c.level} />}
    </div>
  );
};

const Credentials = ({ items = [], labels = {}, detailed = false }) => {
  const [ref, shown] = useReveal({ threshold: 0.15 });
  const list = items.map(toCredential).filter(c => c.name).sort((a, b) => a.order - b.order);
  if (!list.length) return null;

  const statusLabel = {
    earned: labels.statusEarned,
    booked: labels.statusBooked,
    studying: labels.statusStudying,
    planned: labels.statusPlanned,
  };

  // The track fills to the last stop that is earned or being worked on.
  let reach = -1;
  list.forEach((c, i) => { if (c.status !== 'planned') reach = i; });
  const fill = list.length > 1 ? Math.max(0, reach) / (list.length - 1) : 0;

  return (
    <ol
      ref={ref}
      className={styles.path}
      data-shown={shown ? '' : undefined}
      data-detailed={detailed ? '' : undefined}
      style={{ '--step': '90ms', '--fill': fill, '--n': list.length }}
    >
      <span className={styles.track} aria-hidden="true"><span className={styles.trackFill} /></span>

      {list.map((c, i) => {
        const date = when(c, labels);
        return (
          <li key={c.id ?? c.name} className={styles.stop} data-status={c.status} data-rise style={{ '--i': i }}>
            <span className={styles.level}>{c.level || ' '}</span>
            <Badge c={c} />
            <Chip dot={DOT[c.status]} className={styles.status}>{statusLabel[c.status]}</Chip>
            <h3 className={styles.name}>{shortName(c.name)}</h3>
            <p className={styles.meta}>{c.code}{date ? ` / ${date}` : ''}</p>
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
