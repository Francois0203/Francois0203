import React, { useState } from 'react';
import { ThemeSwitch } from '../../../src';

export default {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitch,
};

export const Default = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />;
};