import { useContent } from '../context/ContentContext';

/**
 * The editable "site copy" overrides (portfolio/copy), loaded once by
 * ContentProvider and shared by every page.
 *
 * `copy(group)` is the shorter path: it hands back the group's strings already
 * resolved against the in-code defaults, so a page does not have to import its
 * own field list and call resolveGroup itself. `overrides` stays exposed for the
 * pages that still do.
 */
const useSiteCopy = () => {
  const { overrides, copyLoading, copy } = useContent();
  return { overrides, loading: copyLoading, copy };
};

export default useSiteCopy;
