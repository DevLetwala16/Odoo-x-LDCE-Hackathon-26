import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Compass, Sparkles, ArrowRight, Search, Plus, Globe } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import { getTripCoverImage } from '../utils/tripCover';
import { useAuth } from '../hooks/useAuth';
import styles from './LandingPage.module.css';

const HERO_COUNTRY_CAROUSEL = [
  {
    country: "India",
    location: "Taj Mahal, Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "Switzerland",
    location: "Zermatt & Swiss Alps",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "Japan",
    location: "Mount Fuji & Kyoto",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "France",
    location: "Paris, City of Lights",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "Indonesia",
    location: "Bali & Nusa Penida",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "Italy",
    location: "Rome & Amalfi Coast",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=2000",
  },
  {
    country: "Greece",
    location: "Santorini & Aegean Isles",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=2000",
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('popularity');
  const [regionFilter, setRegionFilter] = useState('all');
  const [cities, setCities] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // 5-second automatic country-special cover image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_COUNTRY_CAROUSEL.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = HERO_COUNTRY_CAROUSEL[heroIndex];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 12, sortBy: sortValue }),
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

      {/* ── Screen 3: 5-Second Rotating Country Special Banner ── */}
      <section className={styles.hero}>
        {HERO_COUNTRY_CAROUSEL.map((slide, idx) => (
          <div 
            key={idx}
            className={`${styles.heroBg} ${idx === heroIndex ? styles.activeHeroBg : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className={styles.heroOverlay} />

        {/* Floating Country Special Indicator Pill (Bottom-Right) */}
        <div className={styles.heroCountryIndicator}>
          <MapPin size={13} className={styles.countryPinIcon} />
          <span className={styles.countryNameText}>{currentHero.country}</span>
          <span className={styles.countryDivider}>•</span>
          <span className={styles.countryLocationText}>{currentHero.location}</span>
        </div>

        {/* Pagination Dots (Bottom-Left) */}
        <div className={styles.heroDots}>
          {HERO_COUNTRY_CAROUSEL.map((slide, dotIdx) => (
            <button
              key={dotIdx}
              className={`${styles.heroDot} ${dotIdx === heroIndex ? styles.activeHeroDot : ''}`}
              onClick={() => setHeroIndex(dotIdx)}
              title={slide.country}
            />
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badgePill}>
            <Sparkles size={14} style={{ color: '#FDE047' }} />
            <span>{user ? `Welcome back, ${user.firstName || user.name || 'Traveler'}` : 'Next-Gen Travel Planning'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            Design Your Next Epic Journey
          </h1>

          <p className={styles.heroSubtitle}>
            Empower your personalized travel adventures. Curate, design, and organize multi-city trips with smart timelines, daily activities, and live budget analytics.
          </p>

          <div className={styles.heroButtons}>
            <Button
              variant="accent"
              size="lg"
              className={styles.planTripHeroBtn}
              onClick={() => navigate(user ? (searchValue ? `/trips/new?city=${encodeURIComponent(searchValue)}` : '/trips/new') : '/login')}
            >
              {user ? 'Plan a Trip' : 'Get Started'} <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={styles.heroSecondaryBtn}
              onClick={() => navigate('/search')}
            >
              <Compass size={16} /> Explore Destinations
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.pageBodyContainer}>
        {/* ── Screen 3: Filter Controls Toolbar ── */}
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

        {/* ── Screen 3 Section 1: Regional Selections ── */}
        <section className={styles.regionalSection}>
          <div className={styles.sectionHeaderBetween}>
            <div>
              <p className={styles.accentLabel}>Featured Destinations</p>
              <h2 className={styles.sectionTitle}>Regional Selections</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className={styles.viewAllBtn}>
              View all ({cities.length}) <ArrowRight size={14} />
            </Button>
          </div>

          {loading ? (
            <Loader text="Loading regional selections..." />
          ) : (
            <div className={styles.citiesGrid}>
              {filteredCities.slice(0, 8).map((city) => (
                <div
                  key={city._id}
                  className={styles.cityCard}
                  onClick={() => navigate(`/search?city=${city._id}`)}
                >
                  <img
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=500'}
                    alt={city.name}
                    className={styles.cityImage}
                    loading="lazy"
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
              <p className={styles.accentLabel}>Your Travel Adventures</p>
              <h2 className={styles.sectionTitle}>Previous Trips</h2>
            </div>
            {previousTrips.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className={styles.viewAllBtn}>
                All Trips <ArrowRight size={14} />
              </Button>
            )}
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
                    src={getTripCoverImage(t)}
                    alt={t.name}
                    className={styles.recentTripImg}
                    loading="lazy"
                  />
                  <div className={styles.recentTripOverlay} />
                  <div className={styles.recentTripInfo}>
                    <h3 className={styles.recentTripTitle}>{t.name}</h3>
                    <p className={styles.recentTripMeta}>
                      <Calendar size={13} /> {new Date(t.startDate).toLocaleDateString()} • {t.destination || 'Multi-city'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Card className={styles.emptyTripsCard}>
                <Globe size={36} className={styles.emptyIcon} />
                <p>No previous trips found yet. Start planning your first personalized journey!</p>
              </Card>
            )}
          </div>

          {/* Bottom Right '+ Plan a Trip' Button */}
          <div className={styles.planTripBtnRow}>
            <Button
              variant="accent"
              size="lg"
              className={styles.bottomPlanBtn}
              onClick={() => navigate(user ? (searchValue ? `/trips/new?city=${encodeURIComponent(searchValue)}` : '/trips/new') : '/login')}
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
