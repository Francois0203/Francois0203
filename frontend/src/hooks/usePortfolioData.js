import { useContent } from '../context/ContentContext';

const usePortfolioData = () => {
  const { data, loading, error } = useContent();
  return { data, loading, error };
};

export default usePortfolioData;
