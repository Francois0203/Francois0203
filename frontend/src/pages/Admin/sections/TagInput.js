import React, { useEffect, useRef, useState } from 'react';
import { SortableList } from './Sortable';
import styles from './TagInput.module.css';

// Splits typed or pasted text on commas and new lines.
const split = (text) => String(text).split(/[,\n]/).map(s => s.trim()).filter(Boolean);
const same = (a, b) => a.toLowerCase() === b.toLowerCase();

// One field for any short list: type and press Enter or a comma, paste a list, drag to
// reorder, click a tag to rename it, × to remove.
const TagInput = ({ id, value = [], onChange, placeholder = 'Type and press Enter', hint = true }) => {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [flash, setFlash] = useState(null);
  const entryRef = useRef(null);
  // Where the pointer went down, so a click that was really the end of a drag does not open the editor.
  const pressAt = useRef(null);

  useEffect(() => {
    if (flash === null) return undefined;
    const timer = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(timer);
  }, [flash]);

  const add = (text) => {
    const next = [...value];
    let dupe = null;
    split(text).forEach(name => {
      const at = next.findIndex(v => same(v, name));
      if (at >= 0) dupe = at;
      else next.push(name);
    });
    if (next.length !== value.length) onChange(next);
    if (dupe !== null) setFlash(dupe);
  };

  const commitDraft = () => {
    if (!draft.trim()) return;
    add(draft);
    setDraft('');
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const startEdit = (i) => {
    setEditing(i);
    setEditText(value[i]);
  };

  const commitEdit = () => {
    const name = editText.trim();
    const i = editing;
    setEditing(null);
    if (i === null || !name || name === value[i]) return;
    const clash = value.findIndex((v, idx) => idx !== i && same(v, name));
    if (clash >= 0) { setFlash(clash); return; }
    onChange(value.map((v, idx) => (idx === i ? name : v)));
  };

  const onEntryKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      // Pull the last tag back into the box to fix it, rather than deleting it outright.
      e.preventDefault();
      setDraft(value[value.length - 1]);
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData('text');
    if (!/[,\n]/.test(text)) return;
    e.preventDefault();
    add(`${draft},${text}`);
    setDraft('');
  };

  return (
    <div>
      <div className={styles.box} onClick={e => { if (e.target === e.currentTarget) entryRef.current?.focus(); }}>
        <SortableList
          items={value}
          getId={(v) => `tag:${v}`}
          onReorder={onChange}
          layout="wrap"
          className={styles.tags}
          itemClassName={styles.slot}
        >
          {(name, i, handle) => (editing === i ? (
            <input
              className={styles.edit}
              value={editText}
              autoFocus
              onFocus={e => e.target.select()}
              aria-label={`Rename ${name}`}
              size={Math.max(4, editText.length)}
              onChange={e => setEditText(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                if (e.key === 'Escape') setEditing(null);
              }}
            />
          ) : (
            <span className={styles.tag} data-flash={flash === i ? '' : undefined}>
              <span
                {...handle}
                className={styles.name}
                title="Click to rename, drag to move"
                aria-label={`${name}. Press Enter to rename, Space to move`}
                onPointerDown={e => { pressAt.current = { x: e.clientX, y: e.clientY }; handle.onPointerDown?.(e); }}
                onClick={e => {
                  const p = pressAt.current;
                  if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 4) return;
                  startEdit(i);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); startEdit(i); return; }
                  handle.onKeyDown?.(e);
                }}
              >
                {name}
              </span>
              <button type="button" className={styles.remove} onClick={() => remove(i)} aria-label={`Remove ${name}`}>×</button>
            </span>
          ))}
        </SortableList>

        <input
          id={id}
          ref={entryRef}
          className={styles.entry}
          value={draft}
          placeholder={value.length ? 'Add another' : placeholder}
          onChange={e => {
            const text = e.target.value;
            if (/[,\n]/.test(text)) { add(text); setDraft(''); } else setDraft(text);
          }}
          onKeyDown={onEntryKey}
          onPaste={onPaste}
          onBlur={commitDraft}
        />
      </div>
      {hint && (
        <p className={styles.hint}>
          Click a tag to rename it. Enter or comma adds, a pasted list adds several, drag to reorder.
        </p>
      )}
    </div>
  );
};

export default TagInput;
