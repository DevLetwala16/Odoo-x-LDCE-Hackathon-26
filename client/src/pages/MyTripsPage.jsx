import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Plus } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import tripService from '../services/tripService';
import styles from './MyTripsPage.module.css';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await tripService.getTrips({});
        setTrips(data || []);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const getStatus = (trip) => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    if (today < start) return 'upcoming';
    if (today >= start && today <= end) return 'ongoing';
    return 'completed';
  };

  const filteredTrips = trips.filter(trip => {
    const matchesTab = getStatus(trip) === activeTab;
    const matchesSearch = trip.name.toLowerCase().includes(searchValue.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <PageShell title="My Trips">
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
        
        <Button variant="accent" onClick={() => navigate('/trips/new')}>
          <Plus size={16} /> New Trip
        </Button>
      </div>

      <FilterBar 
        searchValue={searchValue}
        onSearch={setSearchValue}
        placeholder="Search your trips..."
        sortOptions={[
          { label: 'Date (Nearest First)', value: 'date_asc' },
          { label: 'Date (Furthest First)', value: 'date_desc' },
          { label: 'Name (A-Z)', value: 'name_asc' }
        ]}
      />

      {loading ? (
        <Loader text="Loading your trips..." />
      ) : filteredTrips.length > 0 ? (
        <div className={styles.grid}>
          {filteredTrips.map(trip => (
            <Card key={trip._id} hoverable className={styles.tripCard} onClick={() => navigate(`/trips/${trip._id}`)}>
              <div 
                className={styles.tripCover} 
                style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'})` }}
              >
                <Badge variant={activeTab === 'completed' ? 'success' : activeTab === 'ongoing' ? 'accent' : 'primary'} className={styles.statusBadge}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Badge>
              </div>
              <div className={styles.tripContent}>
                <h3 className={styles.tripName}>{trip.name}</h3>
                
                <div className={styles.tripDetails}>
                  <div className={styles.detailItem}>
                    <Calendar size={14} />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <DollarSign size={14} />
                    <span>${trip.totalBudget || 0} budget</span>
                  </div>
                </div>
                
                <p className={styles.tripDescription}>
                  {trip.description ? (trip.description.length > 60 ? trip.description.substring(0, 60) + '...' : trip.description) : 'No description provided.'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <MapPin size={48} />
          </div>
          <h3>No {activeTab} trips found</h3>
          <p>You don't have any {activeTab} trips matching your criteria.</p>
          <Button variant="primary" onClick={() => navigate('/trips/new')} className={styles.emptyBtn}>
            Plan a New Trip
          </Button>
        </div>
      )}
    </PageShell>
  );
};

export default MyTripsPage;
