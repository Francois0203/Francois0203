import React from 'react';
import { ThemeSwitch, useTheme } from '../../../src';

export default {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitch,
};

export const Default = () => {
  const { theme, toggleTheme } = useTheme();
  return <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />;
};