import { useMemo, useSyncExternalStore } from 'react';
import { COPY_SCHEMA } from './index';
import { resolveGroup } from './resolve';

// The admin's wording, usable anywhere and remembered on the device.
const KEY = 'siteCopy';
const FIELDS = Object.fromEntries(COPY_SCHEMA.map(g => [g.key, g.fields]));
const listeners = new Set();

let overrides = (() => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
})();

export const setCopyOverrides = (next = {}) => {
  overrides = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage off, memory still works */ }
  listeners.forEach(fn => fn());
};

export const copyOf = (group) => resolveGroup(FIELDS[group] ?? [], overrides?.[group]);

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const snapshot = () => overrides;

// The words for one group, kept up to date when the admin saves.
export const useCopy = (group) => {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  return useMemo(() => resolveGroup(FIELDS[group] ?? [], current?.[group]), [current, group]);
};
