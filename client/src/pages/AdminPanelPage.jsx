import React from 'react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import styles from './AdminPanelPage.module.css';

const AdminPanelPage = () => {
  return (
    <PageShell title="Admin Dashboard">
      <div className={styles.grid}>
        <Card className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statNumber}>1,234</p>
        </Card>
        <Card className={styles.statCard}>
          <h3>Active Trips</h3>
          <p className={styles.statNumber}>456</p>
        </Card>
        <Card className={styles.statCard}>
          <h3>Popular Destinations</h3>
          <p className={styles.statNumber}>89</p>
        </Card>
      </div>
    </PageShell>
  );
};

export default AdminPanelPage;
