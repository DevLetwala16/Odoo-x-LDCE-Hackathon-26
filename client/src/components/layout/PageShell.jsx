import React from 'react';
import Navbar from './Navbar';
import styles from './PageShell.module.css';

const PageShell = ({ children, title }) => {
  return (
    <div className={styles.pageShell}>
      <Navbar />
      <main className={styles.mainContent}>
        {title && (
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{title}</h1>
          </header>
        )}
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageShell;
