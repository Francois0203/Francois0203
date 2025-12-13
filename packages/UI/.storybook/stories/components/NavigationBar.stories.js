import React from 'react';
import { NavigationBar } from '../../../src';

export default {
  title: 'Components/Navigation Bar',
  component: NavigationBar,
};

const mockLinks = [
  { label: 'Main 1', to: '/main1' },
  { label: 'Main 2', to: '/main2' },
  { label: 'Main 3', to: '/main3' },
  { label: 'Main 4', to: '/main4' },
  { label: 'Main 5', to: '/main5' },
  { label: 'Main 6', to: '/main6' },
  { label: 'Main 7', to: '/main7' },
];

export const Default = {
  args: {
    links: mockLinks,
    onNavigate: (to) => console.log('Navigate to:', to),
    burgerSize: 25,
  },
};