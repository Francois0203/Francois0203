import { useEffect } from 'react';

// Asks before the tab closes or reloads while a section has edits that are not saved.
const useUnsaved = (dirty) => {
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
};

export default useUnsaved;
