import React from 'react';
import { Clock, Star, DollarSign, Plus, Eye, MapPin } from 'lucide-react';
import styles from './ActivityResultCard.module.css';
import { formatCurrency } from '../../utils/formatters';

const ActivityResultCard = ({ activity, onAdd, onExplore, inTrip = false }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={activity.image || '/default-activity.jpg'} 
          alt={activity.name} 
          className={styles.image}
          onError={(e) => { e.target.src = '/default-activity.jpg' }}
        />
        <div className={styles.categoryBadge}>{activity.category}</div>
      </div>
      
      <div className={styles.content}>
        <h4 className={styles.title}>{activity.name}</h4>
        
        {activity.city && (
          <div className={styles.location}>
            <MapPin size={14} /> {activity.city.name || activity.city}
          </div>
        )}
        
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
      </div>

      <div className={styles.actions}>
        <button onClick={() => onExplore(activity)} className={styles.exploreBtn} title="Explore details">
          <Eye size={18} />
        </button>
        <button 
          onClick={() => !inTrip && onAdd(activity)} 
          className={`${styles.addBtn} ${inTrip ? styles.inTripBtn : ''}`}
          disabled={inTrip}
        >
          {inTrip ? 'Added' : <><Plus size={16} /> Add to Trip</>}
        </button>
      </div>
    </div>
  );
};

export default ActivityResultCard;
