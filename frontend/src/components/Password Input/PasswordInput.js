import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './PasswordInput.module.css';

// \u2500\u2500\u2500 COMPONENT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Password field with show/hide eye-toggle. Forwards all native input props.
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
      {label && <label htmlFor={id}>{label}</label>}
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
