import React, { useState } from 'react';
import { Search, MapPin, Activity } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './SearchPage.module.css';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('cities');
  const [searchValue, setSearchValue] = useState('');
  
  // Mock data for display
  const mockCities = [
    { _id: '1', name: 'Paris', country: 'France', costIndex: '$$$', rating: 4.8 },
    { _id: '2', name: 'Tokyo', country: 'Japan', costIndex: '$$$$', rating: 4.9 },
    { _id: '3', name: 'Bali', country: 'Indonesia', costIndex: '$$', rating: 4.7 }
  ];

  const mockActivities = [
    { _id: '1', name: 'Eiffel Tower Tour', city: 'Paris', price: 45, category: 'Sightseeing' },
    { _id: '2', name: 'Sushi Making Class', city: 'Tokyo', price: 80, category: 'Food' },
    { _id: '3', name: 'Scuba Diving', city: 'Bali', price: 65, category: 'Adventure' }
  ];

  return (
    <PageShell title="Explore">
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'cities' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('cities')}
        >
          <MapPin size={18} /> Cities
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'activities' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Activity size={18} /> Activities
        </button>
      </div>

      <FilterBar 
        searchValue={searchValue}
        onSearch={setSearchValue}
        placeholder={`Search ${activeTab}...`}
        filterOptions={activeTab === 'cities' ? [
          { label: 'Budget ($)', value: '$' },
          { label: 'Moderate ($$)', value: '$$' },
          { label: 'Luxury ($$$)', value: '$$$' }
        ] : [
          { label: 'Sightseeing', value: 'sightseeing' },
          { label: 'Food', value: 'food' },
          { label: 'Adventure', value: 'adventure' }
        ]}
      />

      <div className={styles.resultsGrid}>
        {activeTab === 'cities' ? (
          mockCities.map(city => (
            <Card key={city._id} hoverable className={styles.resultCard}>
              <div className={styles.cardImage} style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <MapPin size={32} className={styles.placeholderIcon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{city.name}</h3>
                <p className={styles.cardSubtitle}>{city.country}</p>
                <div className={styles.cardMeta}>
                  <span>Cost: {city.costIndex}</span>
                  <span>★ {city.rating}</span>
                </div>
                <Button variant="outline" size="sm" fullWidth className={styles.actionBtn}>
                  Explore Activities
                </Button>
              </div>
            </Card>
          ))
        ) : (
          mockActivities.map(activity => (
            <Card key={activity._id} hoverable className={styles.resultCard}>
              <div className={styles.cardImage} style={{ backgroundColor: 'var(--color-accent)' }}>
                <Activity size={32} className={styles.placeholderIcon} style={{ color: 'white' }} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{activity.name}</h3>
                <p className={styles.cardSubtitle}>{activity.city} • {activity.category}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.price}>${activity.price}</span>
                </div>
                <Button variant="outline" size="sm" fullWidth className={styles.actionBtn}>
                  Add to Trip
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageShell>
  );
};

export default SearchPage;
