import React from 'react';
import { Globe } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandWrapper}>
          <Globe size={16} className={styles.brandIcon} />
          <span className={styles.brandName}>GlobeTrotter</span>
        </div>
        <p className={styles.copyright}>© 2026 GlobeTrotter. All rights reserved. Built for Odoo x LDCE Hackathon.</p>
      </div>
    </footer>
  );
};

export default Footer;
