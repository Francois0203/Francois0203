import { useContent } from '../context/ContentContext';

/**
 * The synced GitHub project list. Loaded once by ContentProvider alongside the
 * portfolio documents, so opening a project and coming back does not refetch.
 */
const useGitHubProjects = () => {
  const { projects, projectsLoading, projectsError } = useContent();
  return { projects, loading: projectsLoading, error: projectsError };
};

export default useGitHubProjects;
