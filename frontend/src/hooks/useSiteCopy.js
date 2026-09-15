import { useContent } from '../context/ContentContext';

/**
 * The editable copy overrides, loaded once by ContentProvider.
 * `copy(group)` returns a group already resolved against the in-code
 * defaults; `overrides` stays exposed for callers that resolve their own.
 */
const useSiteCopy = () => {
  const { overrides, copyLoading, copy } = useContent();
  return { overrides, loading: copyLoading, copy };
};

export default useSiteCopy;
