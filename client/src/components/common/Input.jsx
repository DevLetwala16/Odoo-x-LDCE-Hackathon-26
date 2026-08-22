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
  const inputId = id || props.name || undefined;

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
