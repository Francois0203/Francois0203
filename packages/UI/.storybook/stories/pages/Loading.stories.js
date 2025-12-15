import React from 'react';
import { Loading } from '../../../src';

export default {
  title: 'Pages/Loading',
  component: Loading,
  argTypes: {
    message: { control: 'text' },
  },
};

export const Default = {
  args: {
    message: 'Loading...',
  },
};