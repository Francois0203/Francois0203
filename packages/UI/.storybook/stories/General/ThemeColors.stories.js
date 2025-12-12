import React, { useEffect, useState } from 'react';
import '../../../src/styles/Theme.css';

export default {
  title: 'General/Theme Colors',
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates all theme color variables dynamically from the CSS.',
      },
    },
  },
};

const ColorSwatch = ({ colorVar, label }) => (
  <div style={{ margin: '10px', display: 'inline-block' }}>
    <div
      style={{
        width: '100px',
        height: '100px',
        backgroundColor: `var(${colorVar})`,
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
    <p style={{ fontSize: '12px', textAlign: 'center' }}>{label}</p>
    <p style={{ fontSize: '10px', textAlign: 'center', color: '#666' }}>{colorVar}</p>
  </div>
);

const Template = () => {
  const [colorVars, setColorVars] = useState([]);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const vars = [];
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--') && prop.includes('color')) {
        vars.push(prop);
      }
    }
    setColorVars(vars);
  }, []);

  return (
    <div>
      <h2>All Theme Colors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {colorVars.map((varName) => (
          <ColorSwatch key={varName} colorVar={varName} label={varName.replace('--', '').replace(/-/g, ' ')} />
        ))}
      </div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};