import React from 'react';
import { ErrorBoundary } from '../../../src';

export default {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
};

// Component that throws during render to demonstrate the fallback UI
const Thrower = () => {
  throw new Error('Simulated render error from Thrower component');
};

export const Default = () => (
  <ErrorBoundary>
    <Thrower />
  </ErrorBoundary>
);