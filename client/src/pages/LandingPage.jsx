import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Compass, Sparkles, ArrowRight, Search, Plus } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import { useAuth } from '../hooks/useAuth';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('popularity');
  const [regionFilter, setRegionFilter] = useState('all');
  const [cities, setCities] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 8, sortBy: sortValue }),
          tripService.getTrips({ limit: 6 })
        ]);
        setCities(citiesData?.cities || citiesData || []);
        setPreviousTrips(tripsData?.trips || tripsData || []);
      } catch (error) {
        console.error('Failed to fetch landing data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sortValue]);

  const handleSearch = (val) => {
    setSearchValue(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const filteredCities = cities.filter(c => {
    if (regionFilter === 'all') return true;
    return c.region?.toLowerCase() === regionFilter.toLowerCase();
  });

  return (
    <div className={styles.landing}>
      <Navbar />

      {/* ── Screen 3: Banner Image Header ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.badgePill}>
            <Sparkles size={14} style={{ color: '#FCD34D' }} />
            <span>{user ? `Welcome back, ${user.firstName || user.name || 'Traveler'}` : 'Personalized Travel Planning'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            Banner Image & Travel Hub
          </h1>

          <p className={styles.heroSubtitle}>
            Empower your personalized travel journey. Dream, design, and organize multi-city trips with smart timelines and live budgets.
          </p>

          <div className={styles.heroButtons}>
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate(user ? '/trips/new' : '/login')}
            >
              {user ? 'Plan a Trip' : 'Get Started'} <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={styles.heroSecondaryBtn}
              onClick={() => navigate('/search')}
            >
              <Compass size={16} /> Browse Cities
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.pageBodyContainer}>
        {/* ── Screen 3: Search bar ...... | Group by | Filter | Sort by... ── */}
        <div className={styles.filterBarWrapper}>
          <FilterBar
            searchValue={searchValue}
            onSearch={handleSearch}
            sortValue={sortValue}
            onSort={setSortValue}
            sortOptions={[
              { value: 'popularity', label: 'Sort by: Popularity' },
              { value: 'name', label: 'Sort by: Name (A-Z)' },
              { value: 'costIndex', label: 'Sort by: Budget' },
            ]}
            filterValue={regionFilter}
            onFilter={setRegionFilter}
            filterOptions={[
              { value: 'all', label: 'Filter: All Regions' },
              { value: 'Asia', label: 'Filter: Asia' },
              { value: 'Europe', label: 'Filter: Europe' },
              { value: 'Americas', label: 'Filter: Americas' },
              { value: 'Middle East', label: 'Filter: Middle East' },
            ]}
          />
        </div>

        {/* ── Screen 3 Section 1: Top Regional Selections ── */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeaderBetween}>
            <div>
              <p className={styles.accentLabel}>Curated Destinations</p>
              <h2 className={styles.sectionTitle}>Top Regional Selections</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              View all <ArrowRight size={14} />
            </Button>
          </div>

          {loading ? (
            <Loader text="Loading regional selections..." />
          ) : (
            <div className={styles.citiesGrid}>
              {filteredCities.slice(0, 6).map((city) => (
                <div
                  key={city._id}
                  className={styles.cityCard}
                  onClick={() => navigate(`/search?city=${city._id}`)}
                >
                  <img
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'}
                    alt={city.name}
                    className={styles.cityImage}
                  />
                  <div className={styles.cityOverlay} />
                  <div className={styles.cityTitleOverlay}>
                    <p className={styles.cityCountry}>{city.country}</p>
                    <h3 className={styles.cityName}>{city.name}</h3>
                    <p className={styles.cityLinkText}>
                      Explore activities & itinerary →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Screen 3 Section 2: Previous Trips ── */}
        <section className={styles.recentTripsSection}>
          <div className={styles.sectionHeaderBetween}>
            <div>
              <p className={styles.accentLabel}>Travel Journeys</p>
              <h2 className={styles.sectionTitle}>Previous Trips</h2>
            </div>
          </div>

          <div className={styles.recentTripsGrid}>
            {previousTrips.length > 0 ? (
              previousTrips.map((t) => (
                <div
                  key={t._id}
                  className={styles.recentTripCard}
                  onClick={() => navigate(`/trips/${t._id}`)}
                >
                  <img
                    src={t.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=500'}
                    alt={t.name}
                    className={styles.recentTripImg}
                  />
                  <div className={styles.recentTripOverlay} />
                  <div className={styles.recentTripInfo}>
                    <h3 className={styles.recentTripTitle}>{t.name}</h3>
                    <p className={styles.recentTripMeta}>
                      {new Date(t.startDate).toLocaleDateString()} • {t.destination || 'Multi-city'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Card className={styles.emptyTripsCard}>
                <p>No previous trips found. Create your first journey!</p>
              </Card>
            )}
          </div>

          {/* Bottom Right '+ Plan a Trip' Button (Screen 3 Schema) */}
          <div className={styles.planTripBtnRow}>
            <Button
              variant="accent"
              size="lg"
              className={styles.bottomPlanBtn}
              onClick={() => navigate(user ? '/trips/new' : '/login')}
            >
              <Plus size={18} /> Plan a Trip
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
