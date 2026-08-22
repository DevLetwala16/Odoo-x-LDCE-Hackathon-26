import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './BudgetAlert.module.css';
import { formatCurrency } from '../../utils/formatters';

const BudgetAlert = ({ overBudget, totalBudget, totalEstimated }) => {
  if (!totalBudget) return null;

  const difference = Math.abs(totalBudget - totalEstimated);

  if (overBudget || totalEstimated > totalBudget) {
    return (
      <div className={`${styles.alert} ${styles.warning}`}>
        <AlertTriangle size={20} className={styles.icon} />
        <div className={styles.content}>
          <h4 className={styles.title}>Over Budget Warning</h4>
          <p className={styles.message}>
            You are {formatCurrency(difference)} over your allocated budget!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.alert} ${styles.success}`}>
      <CheckCircle size={20} className={styles.icon} />
      <div className={styles.content}>
        <h4 className={styles.title}>On Track</h4>
        <p className={styles.message}>
          You are comfortably {formatCurrency(difference)} under budget.
        </p>
      </div>
    </div>
  );
};

export default BudgetAlert;
