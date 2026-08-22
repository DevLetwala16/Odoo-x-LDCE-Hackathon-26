import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Compass, Sparkles, ArrowRight, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
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
  const [cities, setCities] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 6, sortBy: 'popularity' }),
          tripService.getTrips({ limit: 3 })
        ]);
        setCities(citiesData?.cities || citiesData || []);
        setPreviousTrips(tripsData?.trips || tripsData || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className={styles.landing}>
      <Navbar />

      {/* ── Hero Section (Matching ODOO-LDCE index.tsx) ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.badgePill}>
            <Sparkles size={14} style={{ color: '#FCD34D' }} />
            <span>{user ? `Welcome back, ${user.firstName || user.name}` : 'Personalized Travel Planning'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            Empower Your Personalized Travel Journey.
          </h1>

          <p className={styles.heroSubtitle}>
            Dream, design, and organize multi-city trips with ease. Discover destinations, visualize timelines, and track budgets in one seamless platform.
          </p>

          {/* Hero Floating Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.heroSearchForm}>
            <Search size={20} className={styles.heroSearchIcon} />
            <input
              type="text"
              placeholder="Search city, country or activity (e.g., Tokyo, Paris, Alps)..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.heroSearchInput}
            />
            <Button type="submit" variant="accent" size="sm" className={styles.heroSearchBtn}>
              Explore
            </Button>
          </form>

          <div className={styles.heroButtons}>
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate(user ? '/trips/new' : '/login')}
            >
              {user ? 'Plan Your Trip' : 'Get Started'} <ArrowRight size={16} />
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

      {/* ── User's Recent Trips (If Logged In & Has Trips) ── */}
      {user && previousTrips.length > 0 && (
        <section className={styles.recentTripsSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeaderBetween}>
              <div>
                <p className={styles.accentLabel}>Your Itineraries</p>
                <h2 className={styles.sectionTitle}>Recent Trips</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/trips')}>
                View all trips <ArrowRight size={14} />
              </Button>
            </div>

            <div className={styles.recentTripsGrid}>
              {previousTrips.map((t) => (
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
                      View day-wise itinerary & budget →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Core Features Section (Matching ODOO-LDCE) ── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionInner}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>
                <MapPin size={28} />
              </div>
              <h3 className={styles.featureTitle}>Multi-City Routes</h3>
              <p className={styles.featureText}>
                Seamlessly add stops, set individual city durations, and reorder legs across your global journey.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>
                <Calendar size={28} />
              </div>
              <h3 className={styles.featureTitle}>Smart Timelines</h3>
              <p className={styles.featureText}>
                Visualize your day-by-day plan with scheduled activities, times, and comprehensive month calendars.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>
                <span className={styles.currencySymbol}>₹</span>
              </div>
              <h3 className={styles.featureTitle}>Live Budget Breakdown</h3>
              <p className={styles.featureText}>
                Auto-computed financial visibility into stays, transport, meals, and activities with overbudget alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Regional Destinations (Matching ODOO-LDCE) ── */}
      <section className={styles.destinationsSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeaderBetween}>
            <div>
              <p className={styles.accentLabel}>Inspiration</p>
              <h2 className={styles.sectionTitle}>Top Regional Destinations</h2>
              <p className={styles.sectionSubtitle}>
                Explore world-renowned cities and add them directly to your stops.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/search')}>
              Explore all cities <ArrowRight size={14} />
            </Button>
          </div>

          {loading ? (
            <Loader text="Loading destinations..." />
          ) : (
            <div className={styles.citiesGrid}>
              {cities.slice(0, 6).map((city) => (
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
                      Discover top activities & weather →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer Banner (Matching ODOO-LDCE) ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaTitle}>Ready to see the world?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of travelers who plan their personalized multi-city journeys with GlobeTrotter.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className={styles.ctaBtn}
            onClick={() => navigate(user ? '/trips/new' : '/login')}
          >
            {user ? 'Start New Itinerary' : 'Create an Account'}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
