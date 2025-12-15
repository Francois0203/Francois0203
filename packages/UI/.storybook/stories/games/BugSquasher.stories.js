import React from 'react';
import { BugSquasher } from '../../../src';

export default {
  title: 'Games/BugSquasher',
  component: BugSquasher,
};

// Component that throws during render to demonstrate the fallback UI
const Thrower = () => {
  throw new Error('Simulated render error from Thrower component');
};

export const Default = () => (
  <BugSquasher>
    <Thrower />
  </BugSquasher>
);