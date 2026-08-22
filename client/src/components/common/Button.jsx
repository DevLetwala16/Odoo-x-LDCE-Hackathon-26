import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, accent, outline, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const btnClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  return (
    <button
      type={type}
      className={btnClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
