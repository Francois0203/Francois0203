import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ContentContext from '../context/ContentContext';
import Field from '../components/Field';
import Nav from '../components/Nav';
import Foot from '../components/Foot';
import { NAVIGATION_PAGES } from '../content/navigation';
import { useTheme } from '../hooks';
import { contentValue } from './fixtures';
import Home from '../pages/Home';
import Bio from '../pages/Bio';
import Projects from '../pages/Projects';
import Connect from '../pages/Connect';
import Intro from '../components/Intro';
import Route from '../components/Route';
import Stack from '../components/Stack';
import Embers from '../components/Embers';

/* Dev-only. One public page against fixtures, with the real shell and no
   intro and no Firestore. `?theme=dark` forces the theme for a screenshot. */

const PAGES = { home: Home, bio: Bio, projects: Projects, connect: Connect };

const PagePreview = () => {
  const { name = 'home' } = useParams();
  const [params] = useSearchParams();
  const forced = params.get('theme');
  const flat = params.get('flat');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (forced === 'dark' || forced === 'light') {
      document.documentElement.setAttribute('data-theme', forced);
    }
    /* A headless window taller than the page turns 100svh into the whole
       capture, so a full page shot needs the hero flattened. */
    document.documentElement.style.setProperty('--hero-h', flat ? '620px' : '');
    document.title = `preview: ${name}`;
  }, [forced, name, flat]);

  /* The opening is a canvas animation, and Chrome's virtual time budget
     freezes requestAnimationFrame, so it can only be reviewed as a still.
     `?t=` picks the millisecond to freeze at. */
  if (name === 'intro') {
    // Inside the provider: the opening reads the copy defaults through it.
    return (
      <ContentContext.Provider value={contentValue}>
        <Intro freezeAt={Number(params.get('t') ?? 1600)} />
      </ContentContext.Provider>
    );
  }

  if (name === 'embers') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--deep)' }}>
        <Embers count={18} mode={params.get('mode') ?? 'rise'} />
      </div>
    );
  }

  /* One component on its own, for the sections that sit too far down the
     page to reach in a single capture. */
  if (name === 'route' || name === 'stack') {
    const { experience, education, skills } = contentValue.data;
    const stops = [
      ...experience.map(e => ({ id: e.id, place: e.company, what: e.role, period: e.period, note: e.description, kind: 'experience' })),
      ...education.map(e => ({ id: e.id, place: e.institution, what: `${e.degree}, ${e.field}`, period: e.period, kind: 'education' })),
    ].reverse();
    const flat = skills.categories.flatMap(c => c.items.map(i => ({ label: i, group: c.name })));

    return (
      <div className={name === 'stack' ? 'on-deep' : undefined} style={{
        padding: '4rem var(--gutter)',
        background: name === 'stack' ? 'var(--deep)' : 'var(--ground)',
        minHeight: '100vh',
      }}>
        {name === 'route' ? <Route stops={stops} /> : <Stack entries={flat} />}
      </div>
    );
  }

  const Page = PAGES[name] ?? Home;

  return (
    <ContentContext.Provider value={contentValue}>
      <Field />
      <Nav links={NAVIGATION_PAGES} theme={forced ?? theme} toggleTheme={toggleTheme} />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Page />
      </main>
      <Foot />
    </ContentContext.Provider>
  );
};

export default PagePreview;
