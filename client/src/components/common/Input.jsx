import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
