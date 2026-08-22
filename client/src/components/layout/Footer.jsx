import React from 'react';
import { Compass } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandWrapper}>
          <Compass size={16} className={styles.brandIcon} />
          <span className={styles.brandName}>Musafir</span>
        </div>
        <p className={styles.copyright}>© 2026 Musafir — Soulful Travel Itineraries & Multi-City Journeys. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
