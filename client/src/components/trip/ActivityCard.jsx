import React from 'react';
import { Clock, Star, DollarSign, X, Plus } from 'lucide-react';
import styles from './ActivityCard.module.css';
import { formatCurrency } from '../../utils/formatters';

const ActivityCard = ({ activity, onSelect, onRemove, selected = false, compact = false }) => {
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''} ${selected ? styles.selected : ''}`}>
      <div className={styles.imageContainer}>
        <img 
          src={activity.image || '/default-activity.jpg'} 
          alt={activity.name} 
          className={styles.image}
          onError={(e) => { e.target.src = '/default-activity.jpg' }}
        />
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{activity.name}</h4>
          <span className={styles.categoryBadge}>{activity.category}</span>
        </div>
        
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Clock size={14} /> {activity.duration || 60} min
          </span>
          <span className={styles.metaItem}>
            <Star size={14} className={styles.starIcon} /> {activity.rating || 'N/A'}
          </span>
          <span className={styles.metaItem}>
            <DollarSign size={14} /> {formatCurrency(activity.estimatedCost)}
          </span>
        </div>
        
        {!compact && activity.description && (
          <p className={styles.description}>{activity.description}</p>
        )}
      </div>

      <div className={styles.actions}>
        {onRemove ? (
          <button onClick={() => onRemove(activity._id)} className={styles.removeBtn} title="Remove">
            <X size={16} />
          </button>
        ) : onSelect ? (
          <button 
            onClick={() => onSelect(activity)} 
            className={selected ? styles.selectedBtn : styles.addBtn}
          >
            {selected ? 'Selected' : <><Plus size={16} /> Add</>}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ActivityCard;
