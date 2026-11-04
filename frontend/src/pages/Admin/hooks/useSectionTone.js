import { createContext, useContext } from 'react';

// The colour of the open admin section, so its main buttons can match.
export const SectionTone = createContext('blue');

const useSectionTone = () => useContext(SectionTone);

export default useSectionTone;
