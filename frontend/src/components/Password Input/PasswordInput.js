import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './PasswordInput.module.css';

/* ── Component ───────────────────────────────────────────────────────────── */
/**
 * PasswordInput
 *
 * A styled password field with a show/hide eye-toggle button.
 *
 * Props (beyond standard <input> props forwarded to the underlying input):
 *   label      {string}   – visible label text (optional)
 *   id         {string}   – links <label> to <input> via htmlFor / id
 *   wrapperClassName {string} – extra class for the outer container
 */
const PasswordInput = ({
  label,
  id,
  wrapperClassName,
  className,
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`${styles.inputPasswordContainer}${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      {label && (
        <label htmlFor={id}>{label}</label>
      )}
      <div className={styles.inputEyeWrapper}>
        <input
          {...inputProps}
          id={id}
          type={visible ? 'text' : 'password'}
          className={className}
        />
        <button
          type="button"
          className={styles.inputPasswordEye}
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
