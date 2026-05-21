import { useState, useEffect } from 'react';
import { getGitHubProjects } from '../firebase/github';

const useGitHubProjects = () => {
  const [projects, setProjects] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getGitHubProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
};

export default useGitHubProjects;
