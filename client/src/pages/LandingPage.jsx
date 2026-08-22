import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Plus, Compass, Globe, Star, ArrowRight, Sparkles } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import styles from './LandingPage.module.css';

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania'];

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [cities, setCities] = useState([]);
  const [countriesGrouped, setCountriesGrouped] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, countriesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 50, sortBy: 'popularity' }),
          cityService.getCountries(),
          tripService.getTrips({ limit: 4 })
        ]);
        setCities(citiesData || []);
        setCountriesGrouped(countriesData || []);
        const rawTrips = tripsData?.trips || tripsData?.data?.trips || tripsData || [];
        setPreviousTrips(rawTrips);
      } catch (error) {
        console.error('Failed to fetch landing page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCities = cities.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.country.toLowerCase().includes(searchValue.toLowerCase()) ||
      (c.region && c.region.toLowerCase().includes(searchValue.toLowerCase()));
    
    const matchesRegion = 
      selectedRegion === 'All' || 
      (c.region && c.region.toLowerCase().includes(selectedRegion.toLowerCase()));

    return matchesSearch && matchesRegion;
  });

  const filteredCountries = countriesGrouped.filter(group => {
    const matchesSearch = 
      group.country.toLowerCase().includes(searchValue.toLowerCase()) ||
      group.cities.some(c => c.name.toLowerCase().includes(searchValue.toLowerCase()));

    const matchesRegion = 
      selectedRegion === 'All' || 
      (group.region && group.region.toLowerCase().includes(selectedRegion.toLowerCase()));

    return matchesSearch && matchesRegion;
  });

  return (
    <PageShell title="Home">
      {/* ── Screen 3: Banner Image ── */}
      <div className={styles.bannerContainer}>
        <div className={styles.bannerOverlay}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerTag}><Sparkles size={16} /> Welcome to GlobeTrotter</span>
            <h1 className={styles.bannerTitle}>Empowering Personalized Travel Planning</h1>
            <p className={styles.bannerSubtitle}>
              Discover iconic cities, explore global cultures, and build day-by-day itineraries with live budget tracking.
            </p>
            <Button 
              variant="accent" 
              size="lg" 
              className={styles.bannerCta}
              onClick={() => navigate('/trips/new')}
            >
              <Plus size={18} /> Plan a New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className={styles.filterWrapper}>
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search by city, country (e.g. India, Japan, France), or region..."
          sortOptions={[
            { label: 'Popularity (High to Low)', value: 'popularity' },
            { label: 'Name (A-Z)', value: 'name' },
            { label: 'Cost Index', value: 'costIndex' },
          ]}
        />

        {/* Region Filter Tabs */}
        <div className={styles.regionTabs}>
          {REGIONS.map(reg => (
            <button
              key={reg}
              className={`${styles.regionTab} ${selectedRegion === reg ? styles.activeRegionTab : ''}`}
              onClick={() => setSelectedRegion(reg)}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading global destinations..." />
      ) : (
        <>
          {/* ── Screen 3: Top Regional Selections (Labeled Photos) ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Top Regional Selections</h2>
                <p className={styles.sectionSubtitle}>Trending destination cities with curated itineraries</p>
              </div>
              <span className={styles.resultsBadge}>{filteredCities.length} Cities Found</span>
            </div>
            
            <div className={styles.regionalGrid}>
              {filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <Card 
                    key={city._id} 
                    hoverable 
                    className={styles.cityCard} 
                    onClick={() => navigate(`/search?q=${encodeURIComponent(city.name)}`)}
                  >
                    <div 
                      className={styles.cityImage} 
                      style={{ 
                        backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` 
                      }}
                    >
                      {/* Top Region Label Badge */}
                      <span className={styles.regionBadge}>
                        {city.region || 'World'}
                      </span>

                      {/* Bottom Photo Label Overlay (Wireframe Screen 3) */}
                      <div className={styles.cityLabelOverlay}>
                        <div className={styles.cityTitleRow}>
                          <h3 className={styles.cityName}>{city.name}</h3>
                          <span className={styles.popularityRating}>
                            <Star size={12} fill="gold" color="gold" /> {city.popularity || 90}
                          </span>
                        </div>
                        <p className={styles.cityCountry}>
                          <MapPin size={13} className={styles.pinIcon} /> {city.country}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className={styles.emptyText}>No regional selections matching your search.</p>
              )}
            </div>
          </section>

          {/* ── All Countries & Their Top Cities ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Browse Countries & Top Cities</h2>
                <p className={styles.sectionSubtitle}>Select any country to view and plan trips to its top destination cities</p>
              </div>
              <span className={styles.resultsBadge}>{filteredCountries.length} Countries</span>
            </div>

            <div className={styles.countriesGrid}>
              {filteredCountries.map(group => (
                <Card key={group.country} className={styles.countryCard}>
                  <div 
                    className={styles.countryCover}
                    style={{ backgroundImage: `url(${group.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400'})` }}
                  >
                    <div className={styles.countryCoverOverlay}>
                      <h3 className={styles.countryName}><Globe size={16} /> {group.country}</h3>
                      <span className={styles.countryRegionTag}>{group.region}</span>
                    </div>
                  </div>

                  <div className={styles.countryBody}>
                    <p className={styles.topCitiesHeading}>Top Cities to Visit:</p>
                    <div className={styles.citiesChips}>
                      {group.cities.map(c => (
                        <button 
                          key={c._id} 
                          className={styles.cityChip}
                          onClick={() => navigate(`/search?q=${encodeURIComponent(c.name)}`)}
                        >
                          <MapPin size={12} /> {c.name}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth 
                      className={styles.countryPlanBtn}
                      onClick={() => navigate(`/trips/new`)}
                    >
                      Plan Trip to {group.country} <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Screen 3: Previous Trips ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Previous Trips</h2>
                <p className={styles.sectionSubtitle}>Your recently created travel itineraries</p>
              </div>
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
