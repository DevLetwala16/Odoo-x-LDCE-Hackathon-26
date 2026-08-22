import React from 'react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import styles from './CommunityPage.module.css';

const CommunityPage = () => {
  return (
    <PageShell title="Community">
      <div className={styles.container}>
        <Card className={styles.placeholderCard}>
          <h2>Coming Soon</h2>
          <p>The community feed is currently under development. Stay tuned for updates!</p>
        </Card>
      </div>
    </PageShell>
  );
};

export default CommunityPage;
