import React from 'react';
import { Tooltip } from '../../../src';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
};

export const Default = () => (
  <div style={{ padding: 120 }}>
    <Tooltip heading="Helpful tip" content={<div>This is a tooltip example.</div>}>
      <button type="button">Hover or focus me</button>
    </Tooltip>
  </div>
);