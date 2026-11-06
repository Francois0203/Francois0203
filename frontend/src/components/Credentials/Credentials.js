import { useRef, useState } from 'react';
import useReveal from '../../hooks/useReveal';
import Chip from '../Chip';
import Draggable from '../Draggable';
import useTilt from '../../hooks/useTilt';
import { useCopy } from '../../content/copy/store';
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
    issuer: c.issuer || '',
    status,
    badgeUrl: status === 'earned' ? (c.badgeUrl || '') : '',
    verifyUrl: status === 'earned' ? (c.verifyUrl || '') : '',
    // The issue date once earned, the exam date while booked.
    date: c.start || '',
    note: c.description || '',
    order: c.order ?? 9999,
  };
};

const when = (c) => (c.status === 'earned' || c.status === 'booked' ? c.date : '');

const DOT = { earned: 'live', booked: 'live', studying: 'ink', planned: 'off' };

const shortName = (name) => name.replace(/^AWS Certified\s+/i, '');

const COLOURS = ['yellow', 'blue', 'pink', 'green', 'orange'];

// A glass hexagon with the exam code on it, for badges not earned yet.
const Outline = ({ code }) => (
  <span className={styles.outline} aria-hidden="true">
    <span className={styles.hex} />
    {code && <span className={styles.code}>{code.split('-')[0]}</span>}
  </span>
);

const Badge = ({ c, i }) => {
  const { dragHint } = useCopy('site');
  const [failed, setFailed] = useState(false);
  const image = c.badgeUrl && !failed;
  return (
    <Draggable className={styles.badge} data-image={image ? '' : undefined} title={dragHint}>
      {image
        ? <img src={c.badgeUrl} alt={`${c.name} badge`} width="160" height="160" loading="lazy" draggable="false" onError={() => setFailed(true)} />
        : <Outline code={c.code} />}
    </Draggable>
  );
};

const Stop = ({ c, i, statusLabel, labels, detailed }) => {
  const ref = useRef(null);
  useTilt(ref, { max: 6 });
  const date = when(c);
  return (
    <li className={styles.stop} data-status={c.status} data-rise style={{ '--i': i }}>
      <div ref={ref} className={`glass ${styles.tile}`} data-tone={COLOURS[i % COLOURS.length]}>
      <Badge c={c} i={i} />
      <Chip dot={DOT[c.status]} className={styles.status}>{statusLabel[c.status]}</Chip>
      <h3 className={styles.name}>{shortName(c.name)}</h3>
      {(c.code || date) && <p className={styles.meta}>{[c.code, date].filter(Boolean).join(' / ')}</p>}
      {detailed && c.note && <p className={styles.note}>{c.note}</p>}
      {c.verifyUrl && (
        <a className={styles.verify} href={c.verifyUrl} target="_blank" rel="noreferrer">
          {labels.verifyLabel}
        </a>
      )}
      </div>
    </li>
  );
};

const Credentials = ({ items = [], labels = {}, detailed = false }) => {
  const [ref, shown] = useReveal();
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
      {list.length > 1 && <span className={styles.track} aria-hidden="true"><span className={styles.trackFill} /></span>}

      {list.map((c, i) => (
        <Stop key={c.id ?? c.name} c={c} i={i} statusLabel={statusLabel} labels={labels} detailed={detailed} />
      ))}
    </ol>
  );
};

export default Credentials;
