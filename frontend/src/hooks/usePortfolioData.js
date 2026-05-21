import { useState, useEffect } from 'react';
import { getPortfolio } from '../firebase/firestore';

const usePortfolioData = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getPortfolio()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export default usePortfolioData;
