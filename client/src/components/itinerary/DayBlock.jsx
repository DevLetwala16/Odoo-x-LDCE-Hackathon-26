import React from 'react';
import { Plus, Tag, DollarSign, Trash2 } from 'lucide-react';
import styles from './DayBlock.module.css';
import { formatCurrency } from '../../utils/formatters';
import ActivityCard from '../trip/ActivityCard';

const DayBlock = ({ stop, dayNumber, date, activities = [], expenses = [], onAddExpense, onDeleteExpense }) => {
  return (
    <div className={styles.dayBlock}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>Day {dayNumber} - {stop?.city?.name || stop?.title || 'Unknown'}</h3>
          <span className={styles.date}>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Activities</h4>
          {activities.length > 0 ? (
            <div className={styles.activitiesList}>
              {activities.map((act) => (
                <ActivityCard key={act._id} activity={act} compact={false} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No activities scheduled for this day.</p>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Expenses</h4>
            <button onClick={() => onAddExpense(date)} className={styles.addBtn}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
          
          {expenses.length > 0 ? (
            <div className={styles.expensesList}>
              {expenses.map((expense) => (
                <div key={expense._id} className={styles.expenseItem}>
                  <div className={styles.expenseIcon}>
                    <Tag size={16} />
                  </div>
                  <div className={styles.expenseDetails}>
                    <div className={styles.expenseTitle}>{expense.description || expense.category}</div>
                    <div className={styles.expenseCategory}>{expense.category}</div>
                  </div>
                  <div className={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}
                  </div>
                  <button onClick={() => onDeleteExpense(expense._id)} className={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No expenses recorded for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayBlock;
