import { useContent } from '../context/ContentContext';

const useGitHubProjects = () => {
  const { projects, projectsLoading, projectsError } = useContent();
  return { projects, loading: projectsLoading, error: projectsError };
};

export default useGitHubProjects;
