import React, { useState } from 'react';
import { GripVertical, Trash2, Plus, Calendar, MapPin, DollarSign } from 'lucide-react';
import styles from './SectionCard.module.css';
import ActivityCard from './ActivityCard';
import { formatCurrency, formatDateRange } from '../../utils/formatters';

const SectionCard = ({ stop, index, onUpdate, onDelete, onAddActivity, onRemoveActivity, cities = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: stop.title || `Section ${index + 1}`,
    city: stop.city?._id || '',
    arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate).toISOString().split('T')[0] : '',
    departureDate: stop.departureDate ? new Date(stop.departureDate).toISOString().split('T')[0] : '',
    budget: stop.budget || 0,
    description: stop.description || ''
  });

  const handleSave = () => {
    onUpdate(stop._id, editData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const getCityName = () => {
    if (stop.city?.name) return stop.city.name;
    const city = cities.find(c => c._id === stop.city);
    return city ? city.name : 'Unknown City';
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.dragHandle}>
          <GripVertical size={20} />
        </div>
        
        {isEditing ? (
          <div className={styles.editForm}>
            <input 
              name="title"
              value={editData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="Section Title"
            />
            <select 
              name="city"
              value={editData.city}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select a City</option>
              {cities.map(city => (
                <option key={city._id} value={city._id}>{city.name}</option>
              ))}
            </select>
            <div className={styles.dateInputs}>
              <input 
                type="date"
                name="arrivalDate"
                value={editData.arrivalDate}
                onChange={handleChange}
                className={styles.input}
              />
              <span>to</span>
              <input 
                type="date"
                name="departureDate"
                value={editData.departureDate}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <input 
              type="number"
              name="budget"
              value={editData.budget}
              onChange={handleChange}
              className={styles.input}
              placeholder="Budget"
            />
            <div className={styles.editActions}>
              <button onClick={handleSave} className={styles.saveBtn}>Save</button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className={styles.info}>
            <div className={styles.titleRow}>
              <h4 className={styles.title}>{stop.title || `Section ${index + 1}`}</h4>
              <button onClick={() => setIsEditing(true)} className={styles.editLink}>Edit</button>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}><MapPin size={14} /> {getCityName()}</span>
              <span className={styles.metaItem}><Calendar size={14} /> {formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
              <span className={styles.metaItem}><DollarSign size={14} /> {formatCurrency(stop.budget)}</span>
            </div>
            {stop.description && <p className={styles.description}>{stop.description}</p>}
          </div>
        )}

        <button onClick={() => onDelete(stop._id)} className={styles.deleteBtn}>
          <Trash2 size={18} />
        </button>
      </div>

      <div className={styles.activitiesSection}>
        <div className={styles.activitiesHeader}>
          <h5>Activities ({stop.activities?.length || 0})</h5>
          <button onClick={() => onAddActivity(stop._id)} className={styles.addActivityBtn}>
            <Plus size={16} /> Add Activity
          </button>
        </div>
        
        {stop.activities && stop.activities.length > 0 ? (
          <div className={styles.activitiesList}>
            {stop.activities.map(act => (
              <ActivityCard 
                key={act._id} 
                activity={act} 
                compact={true} 
                onRemove={() => onRemoveActivity(stop._id, act._id)} 
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyActivities}>No activities added yet.</p>
        )}
      </div>
    </div>
  );
};

export default SectionCard;
