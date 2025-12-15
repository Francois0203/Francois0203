import React from 'react';
import { QuantumGrid } from '../../../src';

export default {
  title: 'Games/QuantumGrid',
  component: QuantumGrid,
};

// Component that throws during render to demonstrate the fallback UI
const Thrower = () => {
  throw new Error('Simulated render error from Thrower component');
};

export const Default = () => (
  <QuantumGrid>
    <Thrower />
  </QuantumGrid>
);