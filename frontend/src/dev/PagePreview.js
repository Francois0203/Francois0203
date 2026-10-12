import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ContentContext from '../context/ContentContext';
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
import Stack from '../components/Stack';
import RecordSection from '../pages/Admin/sections/RecordSection';


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
    document.documentElement.style.setProperty('--hero-h', flat ? '620px' : '');
    document.documentElement.style.setProperty('--screen-h', flat ? '900px' : '');
    document.title = `preview: ${name}`;

    if (!params.get('probe')) return undefined;
    const timer = setTimeout(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('body *')]
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > vw + 1 || r.left < -1);
        })
        .slice(0, 12)
        .filter(el => !el.closest('[data-scrolls], [aria-hidden="true"]'))
        .map(el => `${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).split(' ')[0]}:${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}`);
      document.title = `vw=${vw} sw=${document.documentElement.scrollWidth} ${wide.join(' | ')}`;
      if (window.parent !== window) window.parent.document.title = document.title;
    }, 2500);
    return () => clearTimeout(timer);
  }, [forced, name, flat, params]);

  if (name === 'phone') {
    const w = Number(params.get('w') ?? 375);
    const src = params.get('src') ?? 'home';
    return (
      <iframe
        title="phone"
        src={`/__preview/${src}?probe=${params.get('probe') ?? 1}&flat=1`}
        style={{ width: w, height: 3000, border: 0, display: 'block' }}
      />
    );
  }

  if (name === 'intro') {
    // Inside the provider: the opening reads the copy defaults through it.
    return (
      <ContentContext.Provider value={contentValue}>
        <Intro freezeAt={Number(params.get('t') ?? 1900)} />
      </ContentContext.Provider>
    );
  }

  if (name === 'sortable') {
    const rows = contentValue.data.experience.concat(contentValue.data.education.map(e => ({ ...e, role: e.degree, company: e.institution })));
    let current = rows.map((r, i) => ({ ...r, id: r.id, order: i }));
    const subscribe = (cb) => { cb(current); return () => {}; };
    const onReorder = async (ids) => {
      current = ids.map((id, i) => ({ ...current.find(r => r.id === id), order: i }));
      document.title = `saved: ${ids.join(',')}`;
    };
    return (
      <div style={{ padding: '3rem', maxWidth: 760 }}>
        <RecordSection
          title="Experience"
          fields={[]}
          subscribe={subscribe}
          onCreate={async () => {}}
          onUpdate={async () => {}}
          onDelete={async () => {}}
          onReorder={onReorder}
          renderSummary={r => <><strong>{r.role}</strong><span>{r.company}</span></>}
        />
      </div>
    );
  }

  if (name === 'stack') {
    const { skills } = contentValue.data;
    const flat = skills.categories.flatMap(c => c.items.map(i => ({ label: i, group: c.name })));
    return (
      <div style={{ padding: '4rem var(--gutter)', minHeight: '100vh' }}>
        <Stack entries={flat} />
      </div>
    );
  }

  const Page = PAGES[name] ?? Home;

  return (
    <ContentContext.Provider value={contentValue}>
      <div style={{ overflowX: 'clip' }}>
      <Nav links={NAVIGATION_PAGES} theme={forced ?? theme} toggleTheme={toggleTheme} />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Page />
      </main>
      <Foot />
      </div>
    </ContentContext.Provider>
  );
};

export default PagePreview;
