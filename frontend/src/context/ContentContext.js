import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPortfolio, getCopy } from '../firebase/firestore';
import { getGitHubProjects } from '../firebase/github';
import { COPY_SCHEMA, resolveGroup } from '../content/copy';

/*
 * One load for the whole public site.
 *
 * Every page used to mount its own fetching hook, so walking Home -> Bio -> Home
 * re-read the nine portfolio documents each time and re-rendered from a blank
 * state on arrival. The reads are identical every time and nothing on the site
 * changes between two clicks, so the trip was pure latency: a second of skeletons
 * for data the browser already had.
 *
 * The three sources are started together and settle independently, so the
 * projects page is not held up waiting for the portfolio documents and vice
 * versa. Each keeps its own loading flag for that reason.
 *
 * The provider is mounted in AppLayout, not at the app root, so /admin (which
 * reads Firestore through its own section components) never pays for this at all.
 * That also means returning from /admin remounts the provider and re-reads, which
 * is what you want after editing something.
 */

const ContentContext = createContext(null);

// Field lists keyed by copy group, so a page can ask for 'home' and get the
// resolved strings without importing its own field list.
const GROUP_FIELDS = Object.fromEntries(COPY_SCHEMA.map(g => [g.key, g.fields]));

export function ContentProvider({ children }) {
  const [portfolio, setPortfolio] = useState({ data: null, loading: true, error: null });
  const [copy,      setCopy]      = useState({ overrides: {}, loading: true });
  const [github,    setGithub]    = useState({ projects: null, loading: true, error: null });

  const reload = useCallback(() => {
    setPortfolio(s => ({ ...s, loading: true }));
    setCopy(s => ({ ...s, loading: true }));
    setGithub(s => ({ ...s, loading: true }));

    getPortfolio()
      .then(data => setPortfolio({ data, loading: false, error: null }))
      .catch(error => setPortfolio({ data: null, loading: false, error }));

    // Copy failing is never fatal: an empty override set resolves to the in-code
    // defaults, which is exactly what the site shipped with.
    getCopy()
      .then(overrides => setCopy({ overrides: overrides ?? {}, loading: false }))
      .catch(() => setCopy({ overrides: {}, loading: false }));

    getGitHubProjects()
      .then(projects => setGithub({ projects, loading: false, error: null }))
      .catch(error => setGithub({ projects: null, loading: false, error }));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Resolved strings for one page, defaults overlaid with any admin edits. Safe
  // to call while the copy document is still in flight: it returns the defaults.
  const copyFor = useCallback(
    (group) => resolveGroup(GROUP_FIELDS[group] ?? [], copy.overrides?.[group]),
    [copy.overrides],
  );

  const value = useMemo(() => ({
    ...portfolio,
    overrides:       copy.overrides,
    copyLoading:     copy.loading,
    copy:            copyFor,
    projects:        github.projects,
    projectsLoading: github.loading,
    projectsError:   github.error,
    reload,
  }), [portfolio, copy.overrides, copy.loading, copyFor, github, reload]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside a ContentProvider');
  return ctx;
}

export default ContentContext;
