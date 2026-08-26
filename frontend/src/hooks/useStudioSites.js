import { useMemo } from 'react';
import { useContent } from '../context/ContentContext';
import { hasLiveSite, pickFeatured } from '../firebase/studio';

/**
 * Client sites synced from the studio GitHub org. `sites` is everything with a
 * resolvable live url, `featured` the handful the home page shows.
 */
const useStudioSites = ({ featuredLimit = 3 } = {}) => {
  const { studioSites, studioLoading, studioError } = useContent();

  const sites = useMemo(
    () => (studioSites ?? []).filter(hasLiveSite),
    [studioSites],
  );

  const featured = useMemo(
    () => pickFeatured(studioSites ?? [], featuredLimit),
    [studioSites, featuredLimit],
  );

  return { sites, featured, loading: studioLoading, error: studioError };
};

export default useStudioSites;
