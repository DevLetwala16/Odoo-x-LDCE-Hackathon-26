import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Check, Plus, ArrowLeft, Search, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import stopService from '../services/stopService';
import FlightTransition from '../components/common/FlightTransition';
import styles from './CreateTripPage.module.css';

const PRESET_COVERS = [
  { label: "Tokyo Neon", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop" },
  { label: "Paris Eiffel", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&auto=format&fit=crop" },
  { label: "New York Skyline", url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1000&auto=format&fit=crop" },
  { label: "Rome Colosseum", url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&auto=format&fit=crop" },
  { label: "Kyoto Bamboo & Temples", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop" },
  { label: "Santorini Sunset", url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&auto=format&fit=crop" },
  { label: "Swiss Alps & Lakes", url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&auto=format&fit=crop" },
  { label: "Bali Jungle & Beaches", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop" },
  { label: "Dubai Modern Marvels", url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&auto=format&fit=crop" },
  { label: "London Thames & Tower", url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1000&auto=format&fit=crop" },
  { label: "Barcelona Gaudí", url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1000&auto=format&fit=crop" },
  { label: "Sydney Opera & Harbour", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1000&auto=format&fit=crop" },
  { label: "Rio Copacabana & Peak", url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1000&auto=format&fit=crop" },
  { label: "Cairo Great Pyramids", url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1000&auto=format&fit=crop" },
  { label: "Tropical Beach Resort", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop" },
  { label: "Scenic Mountain Road", url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&auto=format&fit=crop" },
];

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearchCity = searchParams.get('city') || searchParams.get('q') || searchParams.get('search') || '';

  const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };
  const todayStr = getTodayStr();

  const [loading, setLoading] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [cities, setCities] = useState([]);
  const [placeSearchQuery, setPlaceSearchQuery] = useState(initialSearchCity);
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [touched, setTouched] = useState({ startDate: false, endDate: false });

  const [formData, setFormData] = useState({
    name: initialSearchCity ? `Trip to ${initialSearchCity}` : '',
    selectedPlaceId: '',
    startDate: todayStr,
    endDate: '',
    totalBudget: '',
    description: '',
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await cityService.getCities({ limit: 100, sortBy: 'popularity' });
        const fetchedCities = data?.cities || data || [];
        setCities(fetchedCities);

        if (initialSearchCity && fetchedCities.length > 0) {
          const match = fetchedCities.find(c => 
            c.name.toLowerCase() === initialSearchCity.toLowerCase() ||
            c._id === initialSearchCity ||
            c.name.toLowerCase().includes(initialSearchCity.toLowerCase())
          );
          if (match) {
            setFormData(prev => ({
              ...prev,
              selectedPlaceId: match._id,
              name: prev.name || `Trip to ${match.name}`,
            }));
            if (match.imageUrl) {
              setSelectedCover(match.imageUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching suggested places:', error);
      }
    };
    fetchCities();
  }, [initialSearchCity]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectPlace = (cityId) => {
    const selectedCity = cities.find(c => c._id === cityId);
    setFormData((prev) => ({ 
      ...prev, 
      selectedPlaceId: cityId,
      name: prev.name ? prev.name : `Trip to ${selectedCity?.name || 'Destination'}`
    }));
    if (selectedCity?.imageUrl) {
      setSelectedCover(selectedCity.imageUrl);
      setCustomCoverUrl('');
    }
    toast.success(`Selected ${selectedCity?.name || 'City'} as destination`);
  };

  const activeCover = customCoverUrl.trim() || selectedCover;

  const isStartValid = formData.startDate ? formData.startDate >= todayStr : true;
  const isEndValid = formData.endDate && formData.startDate ? formData.endDate >= formData.startDate : true;
  const isFormValid = formData.name && formData.startDate && formData.endDate && isStartValid && isEndValid;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setTouched({ startDate: true, endDate: true });

    if (!isFormValid) {
      toast.error('Please fix validation errors before continuing');
      return;
    }
    
    setLoading(true);
    try {
      const selectedCityObj = cities.find(c => c._id === formData.selectedPlaceId);
      const payload = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalBudget: Number(formData.totalBudget) || 0,
        description: formData.description,
        coverImage: activeCover || selectedCityObj?.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'
      };
      
      const res = await tripService.createTrip(payload);
      const trip = res?.trip || res?.data?.trip || res;

      if (formData.selectedPlaceId && trip?._id) {
        try {
          await stopService.createStop(trip._id, {
            city: formData.selectedPlaceId,
            title: 'Section 1',
            description: `Exploration in ${selectedCityObj?.name || 'destination'}`,
            arrivalDate: formData.startDate,
            departureDate: formData.endDate,
            order: 0,
            sectionBudget: Number(formData.totalBudget) || 0,
          });
        } catch (stopErr) {
          console.error('Error creating initial stop:', stopErr);
        }
      }
      
      toast.success('Trip created! Preparing itinerary...');
      setIsFlying(true);
      setTimeout(() => {
        navigate(`/trips/${trip._id}/edit`);
      }, 1300);
    } catch (error) {
      toast.error(error.message || 'Failed to create trip');
      setLoading(false);
    }
  };

  const filteredPlaces = cities.filter(c => 
    !placeSearchQuery ||
    c.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
    (c.region && c.region.toLowerCase().includes(placeSearchQuery.toLowerCase()))
  );

  return (
    <PageShell 
      sectionLabel="Trip Planning" 
      title="Plan a new trip"
      subtitle="Create a new adventure by selecting your starting place, dates, and budget."
    >
      <FlightTransition
        isOpen={isFlying}
        title={`Charting Flight to ${cities.find(c => c._id === formData.selectedPlaceId)?.name || 'Destination'}...`}
        subtitle="Securing departure and organizing your itinerary timeline."
        destination={cities.find(c => c._id === formData.selectedPlaceId)?.name || formData.name}
      />

      <div className={styles.container}>
        <Link to="/trips" className={styles.backBtn}>
          <ArrowLeft size={12} /> Back to all trips
        </Link>

        {/* Plan a new trip Form Card */}
        <Card className={styles.formCard}>
          <h2 className={styles.panelTitle}>Plan a new trip</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Trip Title *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., European Summer Expedition"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Select Starting Destination</label>
              <select 
                name="selectedPlaceId" 
                value={formData.selectedPlaceId} 
                onChange={(e) => handleSelectPlace(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Choose a Destination ({cities.length} available) --</option>
                {cities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}, {c.country}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Start Date *</span>
                  {touched.startDate && !isStartValid && <span className={styles.errorText}>Cannot be in the past</span>}
                </label>
                <input
                  type="date"
                  name="startDate"
                  min={todayStr}
                  value={formData.startDate}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, startDate: true }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>End Date *</span>
                  {touched.endDate && !isEndValid && <span className={styles.errorText}>Must be after start date</span>}
                </label>
                <input
                  type="date"
                  name="endDate"
                  min={formData.startDate || todayStr}
                  value={formData.endDate}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, endDate: true }))}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Max Target Budget (₹)</label>
              <input
                type="number"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleChange}
                placeholder="e.g. 50000"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Trip Notes & Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Notes, goals, or vibes for this journey..."
                className={styles.textarea}
                rows="3"
              />
            </div>

            {/* Cover Selector */}
            <div className={styles.formGroup}>
              <div className={styles.coverHeader}>
                <label className={styles.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ImageIcon size={14} /> Select Cover Photo
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {PRESET_COVERS.length} curated covers
                </span>
              </div>

              <div className={styles.coverGrid}>
                {PRESET_COVERS.map((cov) => {
                  const isSelected = !customCoverUrl && selectedCover === cov.url;
                  return (
                    <div
                      key={cov.url}
                      onClick={() => {
                        setSelectedCover(cov.url);
                        setCustomCoverUrl('');
                      }}
                      className={`${styles.coverOption} ${isSelected ? styles.coverOptionActive : ''}`}
                    >
                      <img src={cov.url} alt={cov.label} className={styles.coverImage} />
                      <div className={styles.coverOverlay}>
                        <span className={styles.coverLabel}>{cov.label}</span>
                        {isSelected && (
                          <div className={styles.coverCheck}>
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.customCoverGroup}>
                <label className={styles.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <LinkIcon size={12} /> Or Paste Custom Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or any public image URL"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  className={styles.input}
                />
              </div>

              {activeCover && (
                <div className={styles.previewContainer}>
                  <img src={activeCover} alt="Cover Preview" className={styles.previewImage} />
                  <div className={styles.previewBadge}>
                    <span>Active Cover Preview</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !isFormValid}
              className={styles.submitBtn}
            >
              {loading ? 'Creating Journey...' : 'Continue to Itinerary Builder'}
            </Button>
          </form>
        </Card>

        {/* Suggestions for Places to Visit */}
        <div className={styles.suggestionsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 className={styles.suggestionsTitle} style={{ margin: 0 }}>
              Suggestions for Places to Visit ({cities.length} Global Cities)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-sunken)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '4px 12px', gap: '6px' }}>
              <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Filter destination..." 
                value={placeSearchQuery}
                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--color-text-primary)', width: '140px' }}
              />
              {placeSearchQuery && (
                <button onClick={() => setPlaceSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-text-secondary)' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.suggestionsGrid}>
            {filteredPlaces.map(city => (
              <Card 
                key={city._id} 
                hoverable 
                className={`${styles.suggestionCard} ${formData.selectedPlaceId === city._id ? styles.selectedCard : ''}`}
                onClick={() => handleSelectPlace(city._id)}
              >
                <div 
                  className={styles.suggestionImage}
                  style={{ 
                    backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` 
                  }}
                >
                  {formData.selectedPlaceId === city._id && (
                    <div className={styles.selectedBadge}>
                      <Check size={14} /> Selected
                    </div>
                  )}
                </div>
                <div className={styles.suggestionDetails}>
                  <h4 className={styles.suggestionName}>{city.name}</h4>
                  <p className={styles.suggestionCountry}>{city.country}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Submit Action Button at bottom */}
        <div className={styles.actionRow}>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleSubmit} 
            disabled={loading || !isFormValid}
            className={styles.submitBtn}
          >
            {loading ? 'Creating...' : 'Create Trip & Customize Sections'}
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default CreateTripPage;
