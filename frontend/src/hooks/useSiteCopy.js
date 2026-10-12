import { useContent } from '../context/ContentContext';

const useSiteCopy = () => {
  const { overrides, copyLoading, copy } = useContent();
  return { overrides, loading: copyLoading, copy };
};

export default useSiteCopy;
