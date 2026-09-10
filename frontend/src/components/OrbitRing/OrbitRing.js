import {
  SiPython, SiReact, SiDjango, SiDocker, SiKubernetes,
  SiPostgresql, SiAmazonwebservices, SiGit,
} from 'react-icons/si';
import styles from './OrbitRing.module.css';

/**
 * The portrait, with his stack in orbit around it.
 *
 * The hero used to be a photograph and three lines of type. This puts the work
 * itself into the first thing a visitor sees: eight marks circling the portrait,
 * each popping in with an overshoot, the whole ring turning slowly, and the
 * ring stopping when you point at it so you can actually look at one.
 *
 * ── How it stays cheap ───────────────────────────────────────────────────────
 * One rotation on the ring, and one counter-rotation per satellite so the icons
 * stay upright instead of tumbling. That is nine composited transforms, no
 * layout, no paint. The alternative - animating each satellite around a circle
 * with its own keyframes - would be eight independent animations computing
 * sin/cos positions, and it would drift out of phase.
 *
 * Positioning is `rotate(angle) translateY(-radius)`: the satellite is rotated
 * about the centre and then pushed outward along its own new axis, which places
 * it on the circle without any trigonometry in CSS or JS.
 *
 * ── Why these eight ─────────────────────────────────────────────────────────
 * The flagships from both halves of the work, alternating warm and cool so the
 * ring reads as the palette's split rather than as a row of logos: Python and
 * PostgreSQL for the data, React and Docker for the engineering, and so on.
 */

const SATELLITES = [
  { Icon: SiPython, label: 'Python', tone: 'cool' },
  { Icon: SiReact, label: 'React', tone: 'warm' },
  { Icon: SiPostgresql, label: 'PostgreSQL', tone: 'cool' },
  { Icon: SiDocker, label: 'Docker', tone: 'warm' },
  { Icon: SiDjango, label: 'Django', tone: 'warm' },
  { Icon: SiKubernetes, label: 'Kubernetes', tone: 'cool' },
  { Icon: SiAmazonwebservices, label: 'AWS', tone: 'warm' },
  { Icon: SiGit, label: 'Git', tone: 'cool' },
];

const OrbitRing = ({ photoUrl, name }) => (
  <div className={styles.orbit}>
    {/* Two faint guide circles, so the satellites read as being on a path
        rather than floating at random distances. */}
    <span className={styles.track} aria-hidden="true" />
    <span className={styles.trackInner} aria-hidden="true" />

    {photoUrl && (
      <div className={styles.portrait}>
        <img src={photoUrl} alt={name ?? 'Portrait'} className={styles.portraitImg} />
      </div>
    )}

    {/* aria-hidden in full: this is the same information the capability grid
        further down the page states in text, and a screen reader does not need
        eight unlabelled logos read to it twice. */}
    <div className={styles.ring} aria-hidden="true">
      {SATELLITES.map(({ Icon, label, tone }, i) => (
        <span
          key={label}
          className={styles.sat}
          data-tone={tone}
          style={{ '--angle': `${(360 / SATELLITES.length) * i}deg`, '--i': i }}
        >
          <span className={styles.satInner}>
            <Icon />
          </span>
        </span>
      ))}
    </div>
  </div>
);

export default OrbitRing;
