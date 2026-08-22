import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div 
      className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
