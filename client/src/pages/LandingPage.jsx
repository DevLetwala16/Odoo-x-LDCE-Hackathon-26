import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Plus, Compass } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [cities, setCities] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 6, sortBy: 'popularity' }),
          tripService.getTrips({ limit: 4 })
        ]);
        setCities(citiesData?.cities || citiesData || []);
        const rawTrips = tripsData?.trips || tripsData || [];
        setPreviousTrips(rawTrips);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.country.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <PageShell title="Home">
      {/* ── Screen 3: Banner Image ── */}
      <div className={styles.bannerContainer}>
        <div className={styles.bannerOverlay}>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerTitle}>GlobeTrotter</h1>
            <p className={styles.bannerSubtitle}>Empowering Personalized Travel Planning</p>
            <Button 
              variant="accent" 
              size="lg" 
              className={styles.bannerCta}
              onClick={() => navigate('/trips/new')}
            >
              Plan a Trip
            </Button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className={styles.filterWrapper}>
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search places, regional selections..."
          sortOptions={[
            { label: 'Popularity', value: 'popularity' },
            { label: 'Name (A-Z)', value: 'name' },
            { label: 'Cost Index', value: 'costIndex' },
          ]}
        />
      </div>

      {loading ? (
        <Loader text="Loading destinations..." />
      ) : (
        <>
          {/* ── Top Regional Selections (Wireframe Screen 3) ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Regional Selections</h2>
            </div>
            
            <div className={styles.regionalGrid}>
              {filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <Card key={city._id} hoverable className={styles.cityCard} onClick={() => navigate(`/search?city=${city._id}`)}>
                    <div 
                      className={styles.cityImage} 
                      style={{ 
                        backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` 
                      }}
                    >
                      <div className={styles.cityOverlay}>
                        <h3 className={styles.cityName}>{city.name}</h3>
                        <p className={styles.cityCountry}>{city.country}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className={styles.emptyText}>No regional selections matching your search.</p>
              )}
            </div>
          </section>

          {/* ── Previous Trips (Wireframe Screen 3) ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Previous Trips</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/trips/new')}>
                <Plus size={16} /> Plan a Trip
              </Button>
            </div>
            
            <div className={styles.previousTripsGrid}>
              {previousTrips.length > 0 ? (
                previousTrips.map(trip => (
                  <Card key={trip._id} hoverable className={styles.tripCard} onClick={() => navigate(`/trips/${trip._id}`)}>
                    <div 
                      className={styles.tripCover} 
                      style={{ 
                        backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=500'})` 
                      }}
                    />
                    <div className={styles.tripInfo}>
                      <h3 className={styles.tripName}>{trip.name}</h3>
                      <div className={styles.tripMeta}>
                        <Calendar size={14} /> 
                        <span>
                          {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={styles.tripBudget}>Budget: ₹{trip.totalBudget || 0}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className={styles.emptyCard}>
                  <p>No previous trips found. Start creating your first personalized itinerary!</p>
                  <Button variant="accent" size="sm" onClick={() => navigate('/trips/new')}>
                    + Plan a Trip
                  </Button>
                </Card>
              )}
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
};

export default LandingPage;
