import { useContent } from '../context/ContentContext';

/**
 * The portfolio documents. The fetch lives in ContentProvider so it happens
 * once per visit rather than once per page mount; this is the read side.
 */
const usePortfolioData = () => {
  const { data, loading, error } = useContent();
  return { data, loading, error };
};

export default usePortfolioData;
