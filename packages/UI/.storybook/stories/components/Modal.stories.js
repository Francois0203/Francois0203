import React, { useState } from 'react';
import { Modal } from '../../../src';

export default {
  title: 'Components/Modal',
  component: Modal,
};

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open Modal</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Test Modal">
        <p>This is modal content.</p>
      </Modal>
    </div>
  );
};