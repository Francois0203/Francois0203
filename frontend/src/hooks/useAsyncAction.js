import { useCallback, useEffect, useRef, useState } from 'react';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Runs an async job and tracks idle, loading, success and error for a Button.
const useAsyncAction = (fn, { minLoading = 550, successFor = 1600, errorFor = 1300, rethrow = false } = {}) => {
  const [status, setStatus] = useState('idle');
  const alive = useRef(true);
  const timer = useRef(0);
  const busy = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; clearTimeout(timer.current); };
  }, []);

  const settle = useCallback((next, ms) => {
    if (!alive.current) return;
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (alive.current) setStatus('idle'); }, ms);
  }, []);

  const run = useCallback(async (...args) => {
    if (busy.current) return undefined;
    busy.current = true;
    clearTimeout(timer.current);
    setStatus('loading');
    const started = performance.now();
    try {
      const result = await fnRef.current(...args);
      const left = minLoading - (performance.now() - started);
      if (left > 0) await wait(left);
      if (result === false) settle('error', errorFor);
      else settle('success', successFor);
      return result;
    } catch (err) {
      const left = minLoading - (performance.now() - started);
      if (left > 0) await wait(left);
      settle('error', errorFor);
      if (rethrow) throw err;
      return undefined;
    } finally {
      busy.current = false;
    }
  }, [minLoading, successFor, errorFor, rethrow, settle]);

  // Shake the button without running anything, for example when a form is invalid.
  const fail = useCallback(() => settle('error', errorFor), [settle, errorFor]);
  const reset = useCallback(() => { clearTimeout(timer.current); setStatus('idle'); }, []);

  return { run, status, fail, reset, busy: status === 'loading' };
};

export default useAsyncAction;
