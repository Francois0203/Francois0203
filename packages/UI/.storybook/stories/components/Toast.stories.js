import React from 'react';
import { ToastProvider, useToast } from '../../../src';

export default {
  title: 'Components/Toast',
};

function Demo() {
  const { showToast } = useToast();
  return (
    <div style={{ padding: 40 }}>
      <button type="submit" onClick={() => showToast('success', 'Saved', 'Your changes have been saved.')}>Show success toast</button>
      <button type="reset" style={{ marginLeft: 12 }} onClick={() => showToast('error', 'Error', 'Something went wrong.')}>Show error toast</button>
      <button type="button" style={{ marginLeft: 12 }} onClick={() => showToast('warning', 'Warning', 'Something went wrong.')}>Show warning toast</button>
      <button type="button" style={{ marginLeft: 12 }} onClick={() => showToast('info', 'Info', 'Something went wrong.')}>Show info toast</button>
    </div>
  );
}

export const WithProvider = () => (
  <ToastProvider>
    <Demo />
  </ToastProvider>
);