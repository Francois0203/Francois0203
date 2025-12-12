import React from 'react';
import { NavigationBar } from '../../../src';

export default {
  title: 'Components/NavigationBar',
  component: NavigationBar,
};

const mockLinks = [
  { label: 'Home', to: '/' },
  { label: 'Hub', to: '/hub' },
  { label: 'Menu', subLinks: [
    { label: 'Testing Sub Link Length', to: '/sub1' },
    { label: 'Sub2', to: '/sub2' },
    { label: 'Sub3', to: '/sub3' },
    { label: 'Sub4', to: '/sub4' },
    { label: 'Sub5', to: '/sub5' },
    { label: 'Sub6', to: '/sub6' },
    { label: 'Sub7', to: '/sub7' },
    { label: 'Sub8', to: '/sub8' },
    { label: 'Sub9', to: '/sub9' },
    { label: 'Sub10', to: '/sub10' },
    { label: 'Sub11', to: '/sub11' },
    { label: 'Sub12', to: '/sub12' },
    { label: 'Sub13', to: '/sub13' },
    { label: 'Sub14', to: '/sub14' },
    { label: 'Sub15', to: '/sub15' },
    { label: 'Sub16', to: '/sub16' },
    { label: 'Sub17', to: '/sub17' },
    { label: 'Sub18', to: '/sub18' },
    { label: 'Sub19', to: '/sub19' },
    { label: 'Sub20', to: '/sub20' },
  ] },
];

export const Default = {
  args: {
    links: mockLinks,
    onNavigate: (to) => console.log('Navigate to:', to),
    burgerSize: 25,
  },
};