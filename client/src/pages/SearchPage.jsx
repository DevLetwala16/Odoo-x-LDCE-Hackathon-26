import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Activity, Star, Clock, DollarSign, ArrowRight, Compass, CloudSun, X, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import activityService from '../services/activityService';
import weatherService from '../services/weatherService';
import tripService from '../services/tripService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { COST_INDEX_LABELS } from '../constants';
import styles from './SearchPage.module.css';

const CITIES_PER_PAGE = 8;
const CATEGORIES = ["all", "sightseeing", "food", "adventure", "culture", "relaxation", "shopping", "nature"];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Header state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('popularity');
  
  // Data state
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const { user } = useAuth();
  
  // Selection state
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesRef = useRef(null);

  // Modal state
  const [showAddToTripModal, setShowAddToTripModal] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [tripItinerary, setTripItinerary] = useState(null);
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('09:00');
  const [isAddingToTrip, setIsAddingToTrip] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const res = await cityService.getCities({ q: searchQuery, sortBy, limit: 100 });
        const fetchedCities = res?.cities || res?.data?.cities || res || [];
        setCities(fetchedCities);
        setCurrentPage(1);

        if (!selectedCity && fetchedCities.length > 0) {
          setSelectedCity(fetchedCities[0]);
        }

        fetchedCities.slice(0, 12).forEach(async (city) => {
          try {
            if (!weatherData[city._id]) {
              const wData = await weatherService.getCityWeather(city.name);
              setWeatherData(prev => ({ ...prev, [city._id]: wData }));
            }
          } catch (e) {
            console.error('Failed to load weather for', city.name);
          }
        });
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [searchQuery, sortBy]);

  useEffect(() => {
    if (!selectedCity) return;
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const params = { cityId: selectedCity._id, limit: 50 };
        if (selectedCategory !== "all") params.category = selectedCategory;
        const res = await activityService.getActivities(params);
        setActivities(res?.activities || res?.data?.activities || res || []);
      } catch (e) {
        console.warn("Failed to load activities:", e);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [selectedCity, selectedCategory]);

  const totalPages = Math.ceil(cities.length / CITIES_PER_PAGE) || 1;
  const paginatedCities = useMemo(() => {
    const start = (currentPage - 1) * CITIES_PER_PAGE;
    return cities.slice(start, start + CITIES_PER_PAGE);
  }, [cities, currentPage]);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setSelectedCategory("all");
    setTimeout(() => {
      activitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openAddToTrip = async (activity) => {
    if (!user) {
      toast.error('Please log in to add activities to your trip');
      navigate('/login');
      return;
    }
    setShowAddToTripModal(activity);
    try {
      const trips = await tripService.getTrips();
      setUserTrips(trips);
      if (trips.length > 0) {
        handleTripChange(trips[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load your trips');
    }
  };

  const handleTripChange = async (tripId) => {
    setSelectedTripId(tripId);
    try {
      const tripData = await tripService.getTripById(tripId);
      setTripItinerary(tripData);
      if (tripData?.stops?.length > 0) {
        setSelectedStopId(tripData.stops[0]._id);
        setActivityDate(tripData.stops[0].startDate?.split('T')[0] || '');
      } else {
        setSelectedStopId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveActivityToStop = async (e) => {
    e.preventDefault();
    if (!selectedStopId) return toast.error('Please select a city stop');
    setIsAddingToTrip(true);
    try {
      await activityService.addActivityToStop(selectedStopId, {
        name: showAddToTripModal.name,
        category: showAddToTripModal.category || 'Exploration',
        description: showAddToTripModal.description,
        estimatedCost: showAddToTripModal.estimatedCost || 0,
        duration: showAddToTripModal.duration || 60,
        date: activityDate,
        time: activityTime
      });
      toast.success('Activity added to your trip!');
      setShowAddToTripModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add activity');
    } finally {
      setIsAddingToTrip(false);
    }
  };

  return (
    <PageShell 
      sectionLabel="Screen 08 — EXPLORE" 
      title="Find destinations & activities"
      subtitle="Discover global regional cities, activities, and cost estimates."
    >
      <div className={styles.container}>
        {/* Search & Sort Controls Header */}
        <section className={styles.searchSection}>
          <div className={styles.searchBoxWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search by city name, country, or region (e.g. Paris, Japan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.clearBtn}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className={styles.filterToolbar}>
            <div className={styles.sortDropdownWrap}>
              <span className={styles.sortLabel}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="popularity">Popularity</option>
                <option value="name">Name (A-Z)</option>
                <option value="costIndex">Cost Index</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cities Section with Pagination */}
        <section className={styles.citiesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Global Destinations</h2>
              <p className={styles.sectionSubtitle}>
                Showing {(currentPage - 1) * CITIES_PER_PAGE + (cities.length > 0 ? 1 : 0)} - {Math.min(currentPage * CITIES_PER_PAGE, cities.length)} of {cities.length} destinations
              </p>
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationBadge}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={styles.paginationBtn}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={styles.paginationBtn}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {loadingCities ? (
            <Loader text="Loading destinations..." />
          ) : cities.length > 0 ? (
            <div className={styles.citiesGrid}>
              {paginatedCities.map((c) => {
                const isSelected = selectedCity?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => handleCityClick(c)}
                    className={`${styles.cityCardWrapper} ${isSelected ? styles.cityCardSelected : ''}`}
                  >
                    <div 
                      className={styles.cityCardBg} 
                      style={{ 
                        backgroundImage: `url(${c.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` 
                      }}
                    />
                    <div className={styles.cityCardOverlay}>
                      <div>
                        <p className={styles.cityCardCountry}>{c.country}</p>
                        <h3 className={styles.cityCardName}>{c.name}</h3>
                        <p className={styles.cityCardPopularity}>Popularity: {c.popularity || 85}/100</p>
                      </div>
                      <div className={styles.cityCardMeta}>
                        <span className={styles.cityCardCost}>{COST_INDEX_LABELS[c.costIndex] || 'Moderate'}</span>
                        {weatherData[c._id] && (
                          <span className={styles.cityCardWeather}>
                            <CloudSun size={12} /> {weatherData[c._id].temperature}°C
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>No cities found matching your search.</div>
          )}
        </section>

        {/* Curated Experiences Section */}
        {selectedCity && (
          <section ref={activitiesRef} className={styles.activitiesSection}>
            <div className={styles.activitiesHeader}>
              <h2 className={styles.activitiesTitle}>Famous Locations in {selectedCity.name}</h2>
              <p className={styles.activitiesSubtitle}>
                {selectedCity.country} • {selectedCity.region || 'World'} • {activities.length} top activities found
              </p>
            </div>
            
            <div className={styles.categoryFilters}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${styles.categoryPill} ${selectedCategory === cat ? styles.categoryPillActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loadingActivities ? (
              <Loader text="Loading activities..." />
            ) : activities.length > 0 ? (
              <div className={styles.activitiesList}>
                {activities.map(a => (
                  <div key={a._id} className={styles.activityRow}>
                    <div className={styles.activityRowLeft}>
                      <div 
                        className={styles.activityRowImg} 
                        style={{ backgroundImage: `url(${a.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400'})` }}
                      />
                      <div className={styles.activityRowContent}>
                        <h4 className={styles.activityRowName}>{a.name}</h4>
                        <p className={styles.activityRowDesc}>{a.description}</p>
                        <div className={styles.activityRowMeta}>
                          <span className={styles.activityRowLocation}><MapPin size={12} /> {selectedCity.name}</span>
                          <span className={styles.activityRowCatBadge}>{a.category}</span>
                          <span className={styles.activityRowDuration}><Clock size={12} /> {a.duration || 60} mins</span>
                          <span className={styles.activityRowRating}><Star size={12} style={{color: 'var(--color-accent)'}} /> {a.rating || 4.5}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.activityRowRight}>
                      <span className={styles.activityRowCost}>
                        {Number(a.estimatedCost || 0) === 0 ? "Free" : `₹${a.estimatedCost}`}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openAddToTrip(a)}
                        className={styles.addToTripBtn}
                      >
                        <Plus size={14} style={{ marginRight: '4px' }} /> Add to Trip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Compass className={styles.emptyIcon} size={48} />
                <p>No activities found in this category for {selectedCity.name}.</p>
                <span>Try selecting "ALL" category or picking another destination.</span>
              </div>
            )}
          </section>
        )}

      </div>

      {/* Modal: Add Activity to Trip */}
      {showAddToTripModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Add to Your Trip</h3>
              <button onClick={() => setShowAddToTripModal(null)} className={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.activityPreview}>
              <p className={styles.activityPreviewName}>{showAddToTripModal.name}</p>
              <p className={styles.activityPreviewMeta}>
                {selectedCity?.name} • {showAddToTripModal.category?.toUpperCase() || 'ACTIVITY'} • {Number(showAddToTripModal.estimatedCost || 0) === 0 ? "Free" : `₹${showAddToTripModal.estimatedCost}`}
              </p>
            </div>

            {userTrips.length === 0 ? (
              <div className={styles.modalEmptyState}>
                <p>You don't have any trips yet. Create one first!</p>
                <Button onClick={() => navigate('/trips/new')} variant="primary">
                  <Plus size={14} /> Create New Trip
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveActivityToStop} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Select Trip</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                    required
                  >
                    {userTrips.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {tripItinerary && tripItinerary.stops?.length > 0 ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>Select City Stop</label>
                      <select
                        value={selectedStopId}
                        onChange={(e) => {
                          const stopId = e.target.value;
                          setSelectedStopId(stopId);
                          const stop = tripItinerary.stops.find((s) => s._id === stopId);
                          if (stop) setActivityDate(stop.startDate?.split('T')[0] || '');
                        }}
                        required
                      >
                        {tripItinerary.stops.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.city?.name || "Unknown City"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Date</label>
                        <input
                          type="date"
                          value={activityDate}
                          onChange={(e) => setActivityDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Time</label>
                        <input
                          type="time"
                          value={activityTime}
                          onChange={(e) => setActivityTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="primary" disabled={isAddingToTrip} className={styles.submitBtn}>
                      {isAddingToTrip ? "Adding..." : "Add Activity to Day"}
                    </Button>
                  </>
                ) : (
                  <div className={styles.modalEmptyState}>
                    <p>This trip has no city stops yet. Add one first.</p>
                    <Button
                      type="button"
                      onClick={() => navigate(`/trips/${selectedTripId}/edit`)}
                    >
                      Open Itinerary Builder
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default SearchPage;
