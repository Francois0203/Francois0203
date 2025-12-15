import React, { useState } from 'react';
import { Settings } from '../../../src';

export default {
  title: 'Components/Settings',
  component: Settings,
};

export const Default = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Settings
          theme={theme}
          toggleTheme={toggleTheme}
          cogSize={44}
        />
      </div>
    </div>
  );
};