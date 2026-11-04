import { useState, useEffect, useMemo, useRef } from 'react';
import { MdRefresh, MdSearch, MdClose } from 'react-icons/md';
import { subscribeCopy, updateCopy } from '../../../../firebase/admin';
import { useToast, SearchableDropdown } from '../../../../components';
import { COPY_SCHEMA, COPY_AREAS } from '../../../../content/copy';
import { setCopyOverrides } from '../../../../content/copy/store';
import { FormSkeleton } from '../../parts/Skeletons';
import useAsyncAction from '../../../../hooks/useAsyncAction';
import useUnsaved from '../../hooks/useUnsaved';
import SaveBar from '../../parts/SaveBar';
import formStyles from '../../AdminForms.module.css';
import styles from './SiteCopySection.module.css';

const buildDraft = (saved = {}) => {
  const d = {};
  for (const group of COPY_SCHEMA) {
    d[group.key] = {};
    for (const f of group.fields) {
      const ov = saved?.[group.key]?.[f.key];
      d[group.key][f.key] = (typeof ov === 'string' && ov !== '') ? ov : f.default;
    }
  }
  return d;
};

const buildOverrides = (draft) => {
  const doc = {};
  for (const group of COPY_SCHEMA) {
    const g = {};
    for (const f of group.fields) {
      const val = draft[group.key]?.[f.key] ?? '';
      if (val.trim() !== '' && val !== f.default) g[f.key] = val;
    }
    if (Object.keys(g).length) doc[group.key] = g;
  }
  return doc;
};

// "Story - lede" becomes the part "Story" and the field name "lede".
const splitLabel = (label) => {
  const at = label.indexOf(' - ');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  return at > 0 ? [label.slice(0, at), cap(label.slice(at + 3))] : ['General', label];
};

// Fields of one group, gathered into parts by the start of their label.
const partsOf = (group, fields = group.fields) => {
  const parts = [];
  fields.forEach((f) => {
    const [part, name] = splitLabel(f.label);
    let p = parts.find(x => x.name === part);
    if (!p) parts.push(p = { name: part, fields: [] });
    p.fields.push({ ...f, name });
  });
  return parts;
};

const OPTIONS = COPY_SCHEMA.map(g => ({ value: g.key, label: `${g.area}: ${g.label}` }));

const Field = ({ group, f, value, onChange, onReset }) => {
  const id = `copy-${group.key}-${f.key}`;
  const modified = value !== f.default;
  return (
    <div className={styles.field} data-modified={modified ? '' : undefined}>
      <div className={styles.fieldHead}>
        <label htmlFor={id}>{f.name}</label>
        {modified && (
          <button type="button" className={styles.reset} onClick={onReset} title="Back to the original wording">
            <MdRefresh aria-hidden="true" /> Reset
          </button>
        )}
      </div>
      {f.type === 'textarea'
        ? <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={f.rows ?? 3} />
        : <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
};

const SiteCopySection = () => {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState(COPY_SCHEMA[0].key);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(() => buildDraft({}));
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const mainRef = useRef(null);
  useUnsaved(dirty);

  useEffect(() => {
    return subscribeCopy(
      (data) => { if (!dirtyRef.current) setDraft(buildDraft(data)); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load site copy'); },
    );
  }, [toast]);

  const set = (groupKey, fieldKey, value) => {
    dirtyRef.current = true;
    setDirty(true);
    setDraft(prev => ({ ...prev, [groupKey]: { ...prev[groupKey], [fieldKey]: value } }));
  };

  const save = useAsyncAction(async () => {
    try {
      const next = buildOverrides(draft);
      await updateCopy(next);
      setCopyOverrides(next);
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Site copy updated');
    } catch (err) {
      toast.error('Failed to save site copy');
      throw err;
    }
  });

  // How many fields in each group differ from the original wording.
  const edited = useMemo(() => Object.fromEntries(COPY_SCHEMA.map(g => [
    g.key, g.fields.filter(f => (draft[g.key]?.[f.key] ?? '') !== f.default).length,
  ])), [draft]);

  // Searching looks through every group's labels and current wording.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return COPY_SCHEMA.map(g => ({
      group: g,
      fields: g.fields.filter(f => `${f.label} ${draft[g.key]?.[f.key] ?? ''}`.toLowerCase().includes(q)),
    })).filter(r => r.fields.length);
  }, [query, draft]);

  // A new area or search starts the fields from the top.
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [activeGroup, query]);

  const group = COPY_SCHEMA.find(g => g.key === activeGroup) ?? COPY_SCHEMA[0];

  if (!loaded) return <FormSkeleton />;

  const renderParts = (g, fields, prefix = '') => partsOf(g, fields).map(part => (
    <section key={`${g.key}-${part.name}`} className={styles.part} data-tone={g.tone}>
      <h3 className={styles.partTitle}>{prefix}{part.name}</h3>
      <div className={styles.partFields}>
        {part.fields.map(f => (
          <Field
            key={f.key}
            group={g}
            f={f}
            value={draft[g.key]?.[f.key] ?? ''}
            onChange={v => set(g.key, f.key, v)}
            onReset={() => set(g.key, f.key, f.default)}
          />
        ))}
      </div>
    </section>
  ));

  return (
    <div className={styles.layout}>
      <aside className={styles.side} data-lenis-prevent>
        <label className={styles.search}>
          <MdSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Search all wording"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search all wording"
          />
          {query && (
            <button type="button" className={styles.clear} onClick={() => setQuery('')} aria-label="Clear search">
              <MdClose aria-hidden="true" />
            </button>
          )}
        </label>

        <div className={styles.picker}>
          <SearchableDropdown
            options={OPTIONS}
            value={OPTIONS.find(o => o.value === activeGroup)}
            onChange={o => { if (o) { setActiveGroup(o.value); setQuery(''); } }}
            isClearable={false}
          />
        </div>

        <nav className={styles.list} aria-label="Areas of the site">
          {COPY_AREAS.map(area => (
            <div key={area} className={styles.area}>
              <p className={styles.areaLabel}>{area}</p>
              {COPY_SCHEMA.filter(g => g.area === area).map(g => (
                <button
                  key={g.key}
                  type="button"
                  className={styles.item}
                  data-tone={g.tone}
                  aria-current={!results && g.key === activeGroup ? 'true' : undefined}
                  onClick={() => { setActiveGroup(g.key); setQuery(''); }}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{g.label}</span>
                    <span className={styles.itemHint}>{g.hint}</span>
                  </span>
                  {edited[g.key] > 0 && <span className={styles.badge} title={`${edited[g.key]} changed`}>{edited[g.key]}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div ref={mainRef} className={styles.main} data-lenis-prevent>
        {results ? (
          <>
            <header className={styles.head}>
              <h2>{results.reduce((n, r) => n + r.fields.length, 0)} matches</h2>
              <p className={formStyles.hint}>Everything that mentions "{query.trim()}", in every area.</p>
            </header>
            {results.length === 0
              ? <p className={styles.empty}>Nothing matches. Try another word.</p>
              : results.map(r => renderParts(r.group, r.fields, `${r.group.label}: `))}
          </>
        ) : (
          <div key={group.key} className={styles.swap}>
            <header className={styles.head} data-tone={group.tone}>
              <h2>{group.label}</h2>
              <p className={formStyles.hint}>{group.hint}. Edit any wording, then save. Reset brings back the original.</p>
            </header>
            {renderParts(group)}
          </div>
        )}

        <SaveBar save={save} dirty={dirty} label="Save site copy" />
      </div>
    </div>
  );
};

export default SiteCopySection;
