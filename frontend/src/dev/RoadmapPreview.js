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

/*
 * Full width, no wrapper. The route pins and pans by `100vw - 100%` of its
 * track, so constraining it here would make the preview lie about where the
 * pan ends.
 *
 * A measurement probe publishes the pan geometry into document.title so a
 * headless --dump-dom can check the arithmetic; see
 * memory/headless-visual-checks.md.
 */
const Probe = () => {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const outer = document.querySelector('[class*="outer"]');
      const track = document.querySelector('ol[class*="track"]');
      const pin = document.querySelector('[class*="pin"]:not([class*="pinIcon"])');
      if (!outer || !track) { document.title = 'probe: not found'; return; }
      const stops = track.children.length;
      const cs = getComputedStyle(track);
      const declared = cs.getPropertyValue('--overflow').trim();
      const first = track.children[0];
      document.title = [
        'pinW=' + (pin && Math.round(pin.getBoundingClientRect().width)),
        'trackW=' + Math.round(track.scrollWidth),
        'realOverflow=' + Math.round(track.scrollWidth - (pin ? pin.getBoundingClientRect().width : 0)),
        'declared=' + declared,
        'stops=' + stops,
        'trackAnim=' + cs.animationName,
        'stopAnim=' + (first && getComputedStyle(first).animationName),
        'stopRange=' + (first && getComputedStyle(first).animationRange),
        'metaRangeInherited=' + (first && getComputedStyle(first.querySelector('[class*=meta]')).animationRange),
      ].join(' | ');
    }, 900);
  }
  return null;
};

const RoadmapPreview = () => (
  <>
    <Probe />
    <Roadmap stops={STOPS} onSelect={() => {}} heading="The journey so far" />
    <div style={{ height: '60vh' }} />
  </>
);

export default RoadmapPreview;
