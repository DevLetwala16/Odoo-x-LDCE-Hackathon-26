import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './PageShell.module.css';

const PageShell = ({ children, title, subtitle, sectionLabel }) => {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.mainContent}>
        {(title || sectionLabel) && (
          <header className={styles.header}>
            {sectionLabel && (
              <div className={styles.sectionLabel}>{sectionLabel}</div>
            )}
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageShell;
