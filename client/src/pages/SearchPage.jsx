import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Activity, Star, Clock, DollarSign, ArrowRight, Compass } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import activityService from '../services/activityService';
import { COST_INDEX_LABELS } from '../constants';
import styles from './SearchPage.module.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('cities');
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('popularity');
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'cities') {
          const res = await cityService.getCities({ q: searchValue, sortBy, limit: 20 });
          setCities(res?.cities || res?.data?.cities || res || []);
        } else {
          const res = await activityService.getActivities({ q: searchValue, sortBy, limit: 20 });
          setActivities(res?.activities || res?.data?.activities || res || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, searchValue, sortBy]);

  return (
    <PageShell title="Search Destinations & Activities">
      <div className={styles.container}>
        {/* Header & Tabs */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Activity Search Pages / City Search Page</h1>
            <p className={styles.pageSubtitle}>Explore destinations and curated travel activities worldwide</p>
          </div>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'cities' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cities')}
            >
              <MapPin size={16} /> Destination Cities
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'activities' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              <Activity size={16} /> Curated Activities
            </button>
          </div>
        </div>

        {/* FilterBar (Wireframe Screen 8) */}
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder={activeTab === 'cities' ? "Search cities by name, country..." : "Search activities by name, category..."}
          sortValue={sortBy}
          onSort={setSortBy}
          sortOptions={activeTab === 'cities' ? [
            { label: 'Popularity', value: 'popularity' },
            { label: 'Name (A-Z)', value: 'name' },
            { label: 'Cost Index', value: 'costIndex' },
          ] : [
            { label: 'Rating', value: 'rating' },
            { label: 'Name (A-Z)', value: 'name' },
            { label: 'Cost (Low to High)', value: 'cost' },
            { label: 'Duration', value: 'duration' },
          ]}
        />

        {/* ── Screen 8: Stacked Option and its Details Results ── */}
        {loading ? (
          <Loader text="Searching database..." />
        ) : (
          <div className={styles.resultsStack}>
            {activeTab === 'cities' ? (
              cities.length > 0 ? (
                cities.map(city => (
                  <Card key={city._id} hoverable className={styles.optionRowCard}>
                    <div 
                      className={styles.optionImage} 
                      style={{ 
                        backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` 
                      }}
                    />
                    <div className={styles.optionContent}>
                      <div className={styles.optionHeader}>
                        <div>
                          <h3 className={styles.optionTitle}>{city.name}</h3>
                          <p className={styles.optionCountry}><MapPin size={14} /> {city.country} • {city.region || 'World'}</p>
                        </div>
                        <Badge variant="info">
                          Cost: {COST_INDEX_LABELS[city.costIndex] || 'Moderate'}
                        </Badge>
                      </div>

                      <p className={styles.optionDescription}>
                        {city.description || 'Option and its details — Explore top sights, historical monuments, local cuisines, and hotel stays.'}
                      </p>

                      <div className={styles.optionFooter}>
                        <span className={styles.popularityScore}>Popularity: ★ {city.popularity || 85}/100</span>
                        <Button 
                          variant="accent" 
                          size="sm" 
                          onClick={() => navigate(`/trips/new`)}
                        >
                          Plan Trip Here <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className={styles.emptyState}>No cities found matching your search.</div>
              )
            ) : (
              activities.length > 0 ? (
                activities.map(activity => (
                  <Card key={activity._id} hoverable className={styles.optionRowCard}>
                    <div 
                      className={styles.optionImage} 
                      style={{ 
                        backgroundImage: `url(${activity.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400'})` 
                      }}
                    />
                    <div className={styles.optionContent}>
                      <div className={styles.optionHeader}>
                        <div>
                          <h3 className={styles.optionTitle}>{activity.name}</h3>
                          <p className={styles.optionCountry}><Compass size={14} /> {activity.city?.name || 'Local Destination'} • {activity.category?.toUpperCase()}</p>
                        </div>
                        <Badge variant="primary">
                          ₹{activity.estimatedCost || 0}
                        </Badge>
                      </div>

                      <p className={styles.optionDescription}>
                        {activity.description || 'Option and its details — Curated experience including timing, guides, entry requirements, and reviews.'}
                      </p>

                      <div className={styles.optionFooter}>
                        <div className={styles.activityStats}>
                          <span><Clock size={14} /> {activity.duration || 60} mins</span>
                          <span><Star size={14} fill="orange" color="orange" /> {activity.rating || 4.5}/5</span>
                        </div>
                        <Button 
                          variant="accent" 
                          size="sm" 
                          onClick={() => navigate(`/trips/new`)}
                        >
                          Add to Itinerary <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className={styles.emptyState}>No activities found matching your search.</div>
              )
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default SearchPage;
