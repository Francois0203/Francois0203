import { useEffect, useMemo } from 'react';
import usePortfolioData from './usePortfolioData';
import useSiteCopy from './useSiteCopy';
import useAsyncAction from './useAsyncAction';
import { resolveGroup } from '../content/copy/resolve';
import { BIO_FIELDS } from '../content/copy/bio';
import { CREDENTIALS_FIELDS } from '../content/copy/credentials';
import { githubAvatar } from '../content/avatar';
import { toast } from '../components/Toast';

const itemLabel = (x) => (typeof x === 'string' ? x : x?.name ?? x?.title ?? String(x));

const flattenSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills.categories)) return skills.categories.flatMap(c => (c.items ?? []).map(i => ({ label: itemLabel(i), group: c.name })));
  if (Array.isArray(skills.items)) return skills.items.map(i => ({ label: itemLabel(i), group: null }));
  return Object.entries(skills).filter(([, v]) => Array.isArray(v)).flatMap(([n, arr]) => arr.map(i => ({ label: itemLabel(i), group: n })));
};

const save = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// Builds the CV PDF from the site's data and downloads it. Use with a Button's status.
const useCvDownload = () => {
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(BIO_FIELDS, overrides.bio);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);
  const skills = useMemo(() => flattenSkills(data?.skills), [data]);

  // Warm the 1.3 MB PDF engine after the intro (it froze the opening), and not at all on weak machines.
  useEffect(() => {
    if (!data || document.documentElement.dataset.tier === 'low') return undefined;
    let handle = 0;
    let timer = 0;
    const warm = () => { import('../cv'); };
    const schedule = () => {
      if ('requestIdleCallback' in window) handle = requestIdleCallback(warm, { timeout: 8000 });
      else timer = setTimeout(warm, 4000);
    };
    const playing = document.documentElement.dataset.intro === 'playing';
    if (playing) window.addEventListener('intro:done', schedule, { once: true });
    else schedule();
    return () => {
      window.removeEventListener('intro:done', schedule);
      if (handle) cancelIdleCallback(handle);
      clearTimeout(timer);
    };
  }, [data]);

  const action = useAsyncAction(async () => {
    const missing = (data?.failed ?? []).filter(k => k !== 'photos');
    if (!data || missing.length) {
      toast.error(`${t.cvIncomplete}${missing.length ? ` (${missing.join(', ')})` : ''}`);
      throw new Error('incomplete');
    }
    const personal = data.personal ?? {};
    const social = data.social ?? [];
    const raw = data.interests;
    try {
      const { renderCv } = await import('../cv');
      const blob = await renderCv({
        name: personal.name ?? '',
        photo: personal.photoUrl || githubAvatar(social),
        personal,
        contact: data.contact ?? {},
        social,
        experience: data.experience ?? [],
        education: data.education ?? [],
        certifications: data.certifications ?? [],
        skills,
        skillGroups: data.skills?.categories ?? [],
        interests: (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean),
        languages: (personal.languages ?? []).map(itemLabel).filter(Boolean),
        summary: personal.summary ?? '',
        t,
        badges,
      });
      save(blob, `${personal.name || 'CV'} CV.pdf`);
      toast.success(t.cvReady);
    } catch (err) {
      console.error(err);
      toast.error(t.cvFailed);
      throw err;
    }
  });

  return { ...action, ready: !loading && Boolean(data), label: t.printLabel };
};

export default useCvDownload;
