import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, GripVertical, Trash2, MapPin, Edit2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import tripService from '../services/tripService';
import styles from './ItineraryBuilderPage.module.css';

const ItineraryBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState([]);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const data = await tripService.getTripById(id);
        setTrip(data);
        // Mocking stops
        setStops(data.stops || [
          { _id: 's1', city: { name: 'Paris', country: 'France' }, startDate: data.startDate, endDate: data.endDate, order: 0, activities: [] }
        ]);
      } catch (error) {
        toast.error('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  const moveUp = (index) => {
    if (index === 0) return;
    const newStops = [...stops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    setStops(newStops);
  };

  const moveDown = (index) => {
    if (index === stops.length - 1) return;
    const newStops = [...stops];
    [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
    setStops(newStops);
  };

  if (loading) return <PageShell><Loader text="Loading itinerary builder..." /></PageShell>;
  if (!trip) return <PageShell><div className={styles.error}>Trip not found</div></PageShell>;

  return (
    <PageShell title={`Builder: ${trip.name}`}>
      <div className={styles.headerActions}>
        <Button variant="outline" onClick={() => setIsAddStopModalOpen(true)}>
          <Plus size={16} /> Add Stop
        </Button>
        <Button variant="accent" onClick={() => navigate(`/trips/${trip._id}`)}>
          Save & View Full Itinerary
        </Button>
      </div>

      <div className={styles.builderArea}>
        <div className={styles.timeline}>
          {stops.map((stop, index) => (
            <Card key={stop._id} className={styles.stopCard}>
              <div className={styles.stopHeader}>
                <div className={styles.dragHandle}>
                  <GripVertical size={20} />
                </div>
                <div className={styles.stopInfo}>
                  <h3 className={styles.cityName}><MapPin size={18} className={styles.cityIcon} /> {stop.city?.name || 'Unknown City'}</h3>
                  <p className={styles.stopDates}>
                    {stop.startDate ? new Date(stop.startDate).toLocaleDateString() : 'TBD'} - 
                    {stop.endDate ? new Date(stop.endDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div className={styles.stopActions}>
                  <button onClick={() => moveUp(index)} disabled={index === 0} className={styles.actionBtn}>&uarr;</button>
                  <button onClick={() => moveDown(index)} disabled={index === stops.length - 1} className={styles.actionBtn}>&darr;</button>
                  <button className={styles.actionBtn}><Edit2 size={16} /></button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`}><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className={styles.activitiesArea}>
                <h4 className={styles.activitiesTitle}>Activities</h4>
                {stop.activities && stop.activities.length > 0 ? (
                  <ul className={styles.activityList}>
                    {stop.activities.map(act => (
                      <li key={act._id} className={styles.activityItem}>{act.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyActivities}>No activities planned yet.</p>
                )}
                <Button variant="outline" size="sm" className={styles.addActivityBtn}>
                  + Add Activity
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isAddStopModalOpen} onClose={() => setIsAddStopModalOpen(false)} title="Add a New Stop">
        <div className={styles.modalContent}>
          <p>Search and select a city to add to your itinerary.</p>
          <Button variant="primary" onClick={() => setIsAddStopModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </PageShell>
  );
};

export default ItineraryBuilderPage;
