import React from 'react';
import { MemoryMatch } from '../../../src';

export default {
  title: 'Games/MemoryMatch',
  component: MemoryMatch,
};

// Component that throws during render to demonstrate the fallback UI
const Thrower = () => {
  throw new Error('Simulated render error from Thrower component');
};

export const Default = () => (
  <MemoryMatch>
    <Thrower />
  </MemoryMatch>
);