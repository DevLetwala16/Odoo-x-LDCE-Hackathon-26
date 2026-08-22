import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, Trash2, MapPin } from 'lucide-react';
import styles from './TripCard.module.css';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import { getTripStatus } from '../../utils/tripStatus';

const TripCard = ({ trip, onDelete }) => {
  const status = getTripStatus(trip.startDate, trip.endDate);
  
  const getDestinations = () => {
    if (!trip.stops || trip.stops.length === 0) return 'No destinations yet';
    const cities = trip.stops.map(stop => stop.city?.name).filter(Boolean);
    return cities.join(' • ') || 'Multiple destinations';
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      onDelete(trip._id);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={trip.coverImage || '/default-trip.jpg'} 
          alt={trip.name} 
          className={styles.image} 
          onError={(e) => { e.target.src = '/default-trip.jpg' }}
        />
        <div className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
          {status}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{trip.name}</h3>
        
        <div className={styles.infoRow}>
          <MapPin size={16} className={styles.icon} />
          <span className={styles.infoText}>{getDestinations()}</span>
        </div>
        
        <div className={styles.infoRow}>
          <Calendar size={16} className={styles.icon} />
          <span className={styles.infoText}>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>
        
        <div className={styles.budgetRow}>
          <span className={styles.budgetLabel}>Budget:</span>
          <span className={styles.budgetValue}>{formatCurrency(trip.totalBudget)}</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <Link to={`/trips/${trip._id}`} className={styles.primaryBtn}>
          View Itinerary
        </Link>
        <Link to={`/trips/${trip._id}/calendar`} className={styles.iconBtn} title="Calendar">
          <Calendar size={18} />
        </Link>
        <Link to={`/trips/${trip._id}/edit`} className={styles.iconBtn} title="Edit">
          <Edit size={18} />
        </Link>
        <button onClick={handleDelete} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TripCard;
