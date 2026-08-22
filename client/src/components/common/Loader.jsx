import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? styles.fullScreen : styles.container}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loader;
