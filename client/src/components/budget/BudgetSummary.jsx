import React from 'react';
import styles from './BudgetSummary.module.css';
import { formatCurrency } from '../../utils/formatCurrency';

const BudgetSummary = ({ totalBudget = 0, totalEstimated = 0, breakdown = {} }) => {
  const percentage = totalBudget > 0 ? (totalEstimated / totalBudget) * 100 : 0;
  const isOverBudget = totalEstimated > totalBudget;
  const remaining = totalBudget - totalEstimated;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Budget Overview</h3>
      
      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.label}>Total Budget</span>
          <span className={styles.value}>{formatCurrency(totalBudget)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.label}>Total Spent/Estimated</span>
          <span className={`${styles.value} ${isOverBudget ? styles.overValue : ''}`}>
            {formatCurrency(totalEstimated)}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.label}>Remaining</span>
          <span className={`${styles.value} ${isOverBudget ? styles.overValue : styles.goodValue}`}>
            {formatCurrency(Math.abs(remaining))} {isOverBudget ? 'over' : 'left'}
          </span>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span>{percentage.toFixed(1)}% Used</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${isOverBudget ? styles.overBudget : ''}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
