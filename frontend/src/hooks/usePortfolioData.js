import { useContent } from '../context/ContentContext';

/**
 * The portfolio documents (personal, contact, social, donation, skills,
 * interests, experience, education, certifications).
 *
 * The fetch itself lives in ContentProvider so it happens once per visit instead
 * of once per page mount; this hook is only the read side of it. Shape is
 * unchanged from when it fetched on its own.
 */
const usePortfolioData = () => {
  const { data, loading, error } = useContent();
  return { data, loading, error };
};

export default usePortfolioData;
