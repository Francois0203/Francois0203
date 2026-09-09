import Roadmap from '../components/Roadmap';

/**
 * A development-only harness for the Roadmap.
 *
 * The component is measured: it fits a spline through the waypoints it can
 * actually see, so the only way to check the trail is to look at it rendered.
 * Doing that against the live Home page means waiting on nine Firestore reads,
 * which a headless browser will not reliably complete, so the section is
 * unverifiable exactly when you most want to check it.
 *
 * This route renders the same component against fixed data, with no network
 * and no intro, so it paints on first frame and can be screenshotted.
 *
 * Reached at /__preview/roadmap, and only in dev - App.js gates the route on
 * import.meta.env.DEV, so it is not in the production bundle.
 */

const STOPS = [
  {
    id: 'a', kind: 'experience', period: 'During Matric Year',
    title: 'Bean Tree, Krugersdorp', subtitle: 'Waiter',
  },
  {
    id: 'b', kind: 'education', period: 'Completed',
    title: 'Hoërskool Noordheuwel', subtitle: 'National Senior Certificate (Matric)',
  },
  {
    id: 'c', kind: 'experience', period: 'During Matric Year',
    title: 'Western Rackets', subtitle: 'Shop Assistant',
  },
  {
    id: 'd', kind: 'education', period: '2021 - 2023',
    title: 'North-West University, Potchefstroom', subtitle: 'BSc. Computer Science & Statistics',
  },
  {
    id: 'e', kind: 'education', period: '2024',
    title: 'North-West University, Potchefstroom', subtitle: 'BSc. Hons. Computer Science',
  },
  {
    id: 'f', kind: 'experience', period: 'January 2025 - April 2026',
    title: 'Aquatico Scientific', subtitle: 'Full Stack Software Developer',
  },
  {
    id: 'g', kind: 'experience', period: 'May 2026 - Present',
    title: 'Shareforce (Pty) Ltd', subtitle: 'Junior Software Developer',
  },
  {
    id: 'h', kind: 'education', period: '2026 - Present',
    title: 'North-West University, Potchefstroom', subtitle: 'MSc. Computer Science',
  },
];

const RoadmapPreview = () => (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
    <Roadmap stops={STOPS} onSelect={() => {}} />
  </div>
);

export default RoadmapPreview;
