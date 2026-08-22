import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import sharingService from '../services/sharingService';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import styles from './SharedTripPage.module.css';

const SharedTripPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await sharingService.viewPublicTrip(slug);
        if (response.success) {
          setTrip(response.data.trip);
          setStops(response.data.stops);
        }
      } catch (error) {
        toast.error('Could not load shared trip. It may be private or deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [slug]);

  const handleCopyToAccount = async () => {
    if (!user) {
      toast('Please login to copy this trip to your account', { icon: '🔐' });
      navigate('/login');
      return;
    }
    
    setCopying(true);
    try {
      const response = await sharingService.copyPublicTrip(slug);
      if (response.success) {
        toast.success('Trip copied successfully!');
        navigate(`/trips/${response.newTripId}`);
      }
    } catch (error) {
      toast.error('Failed to copy trip to your account');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading shared itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className={styles.errorContainer}>
        <Navbar />
        <div className={styles.errorContent}>
          <h2>Trip Not Found</h2>
          <p>This link might be invalid or the trip is no longer public.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className={styles.hero}
        style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200'})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.badge}>Shared Itinerary</span>
          <h1 className={styles.title}>{trip.name}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar size={18} />
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span className={styles.metaItem}>
              <MapPin size={18} />
              {stops.length} Destinations
            </span>
          </div>
          <div className={styles.actions}>
            <Button 
              variant="accent" 
              size="lg" 
              onClick={handleCopyToAccount}
              disabled={copying}
            >
              {copying ? <Loader2 className={styles.spinner} size={18} /> : <Copy size={18} />}
              {user ? 'Copy to My Account' : 'Login to Copy Trip'}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2>Trip Itinerary</h2>
          <div className={styles.budgetBadge}>
            Est. Budget: {formatAmount(trip.totalBudget)}
          </div>
        </div>

        <div className={styles.timeline}>
          {stops.map((stop, index) => (
            <Card key={stop._id} className={styles.stopCard}>
              <div className={styles.stopHeader}>
                <div className={styles.stopHeaderLeft}>
                  <div className={styles.stopNumber}>{index + 1}</div>
                  <div>
                    <h3 className={styles.cityName}>{stop.city?.name || 'Unknown City'}</h3>
                    <p className={styles.countryName}>{stop.city?.country}</p>
                  </div>
                </div>
                <div className={styles.stopDates}>
                  {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className={styles.daysList}>
                {stop.days.map((day, dIdx) => (
                  <div key={dIdx} className={styles.dayBlock}>
                    <h4 className={styles.dayLabel}>
                      {day.dayLabel} <span>({new Date(day.date).toLocaleDateString()})</span>
                    </h4>
                    
                    {day.activities.length > 0 ? (
                      <div className={styles.activityList}>
                        {day.activities.map(act => (
                          <div key={act._id} className={styles.activityItem}>
                            <div className={styles.activityTime}>
                              <Clock size={14} />
                              {act.scheduledTime || 'Flexible'}
                            </div>
                            <div className={styles.activityInfo}>
                              <p className={styles.activityName}>{act.name}</p>
                              {act.category && <span className={styles.categoryBadge}>{act.category}</span>}
                            </div>
                            <div className={styles.activityCost}>
                              {formatAmount(act.cost)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noActivities}>No activities planned for this day.</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SharedTripPage;
