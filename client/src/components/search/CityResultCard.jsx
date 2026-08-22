import React from 'react';
import { MapPin, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';
import styles from './CityResultCard.module.css';

const COST_INDEX_LABELS = {
  1: 'Very Budget',
  2: 'Budget',
  3: 'Moderate',
  4: 'Expensive',
  5: 'Luxury'
};

const CityResultCard = ({ city, onSelect, actionLabel = 'Explore' }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={city.photoUrl || '/default-city.jpg'} 
          alt={city.name} 
          className={styles.image}
          onError={(e) => { e.target.src = '/default-city.jpg' }}
        />
        {city.popularityScore > 80 && (
          <div className={styles.popularBadge}>Popular</div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{city.name}</h3>
          <span className={styles.location}>
            {city.region ? `${city.region}, ` : ''}{city.country}
          </span>
        </div>
        
        <div className={styles.meta}>
          <div className={styles.metaItem} title="Cost Index">
            <DollarSign size={16} />
            <span>{COST_INDEX_LABELS[city.costIndex] || 'Unknown'} ({city.costIndex}/5)</span>
          </div>
          {city.popularityScore && (
            <div className={styles.metaItem} title="Popularity">
              <TrendingUp size={16} />
              <span>{city.popularityScore}/100</span>
            </div>
          )}
        </div>
        
        {city.description && (
          <p className={styles.description}>{city.description}</p>
        )}
      </div>
      
      <button onClick={() => onSelect(city)} className={styles.actionBtn}>
        <span>{actionLabel}</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default CityResultCard;
