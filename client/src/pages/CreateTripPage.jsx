import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Check, Plus, ArrowRight } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import stopService from '../services/stopService';
import styles from './CreateTripPage.module.css';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    selectedPlaceId: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    description: '',
    coverImage: '',
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await cityService.getCities({ limit: 6, sortBy: 'popularity' });
        setCities(data?.cities || data || []);
      } catch (error) {
        console.error('Error fetching suggested places:', error);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectPlace = (cityId) => {
    setFormData((prev) => ({ ...prev, selectedPlaceId: cityId }));
    const selectedCity = cities.find(c => c._id === cityId);
    toast.success(`Selected ${selectedCity?.name || 'City'} as primary destination`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in Trip Name, Start Date, and End Date');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End Date cannot be before Start Date');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalBudget: Number(formData.totalBudget) || 0,
        description: formData.description,
        coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'
      };
      
      const res = await tripService.createTrip(payload);
      const trip = res?.trip || res?.data?.trip || res;

      if (formData.selectedPlaceId && trip?._id) {
        try {
          await stopService.createStop(trip._id, {
            city: formData.selectedPlaceId,
            title: 'Stop 1',
            description: `Exploration in ${cities.find(c => c._id === formData.selectedPlaceId)?.name || 'destination'}`,
            arrivalDate: formData.startDate,
            departureDate: formData.endDate,
            order: 0,
            sectionBudget: Number(formData.totalBudget) || 0,
          });
        } catch (stopErr) {
          console.error('Error creating initial stop:', stopErr);
        }
      }
      
      toast.success('Trip created! Building your itinerary...');
      navigate(`/trips/${trip._id}/edit`);
    } catch (error) {
      toast.error(error.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell 
      sectionLabel="02 — NEW JOURNEY" 
      title="Design a trip"
      subtitle="Set dates, total budget, and choose your starting regional destinations."
    >
      <div className={styles.container}>
        <Card className={styles.formCard}>
          <h2 className={styles.panelTitle}>Trip Details</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input 
              label="Trip Name *" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g., European Summer Expedition" 
              required 
            />

            <div className={styles.inputGroup}>
              <label className={styles.label}>Select Starting Destination</label>
              <select 
                name="selectedPlaceId" 
                value={formData.selectedPlaceId} 
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">-- Choose a Destination --</option>
                {cities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}, {c.country}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.row}>
              <Input 
                type="date" 
                label="Start Date *" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
              <Input 
                type="date" 
                label="End Date *" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <Input 
              type="number" 
              label="Total Budget (₹)" 
              name="totalBudget" 
              value={formData.totalBudget} 
              onChange={handleChange} 
              placeholder="e.g. 75000" 
            />

            <div className={styles.inputGroup}>
              <label className={styles.label}>Trip Notes & Description (Optional)</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className={styles.textarea}
                placeholder="Notes or goals for this journey..."
                rows="2"
              ></textarea>
            </div>
          </form>
        </Card>

        {/* Suggestions Section */}
        <div className={styles.suggestionsSection}>
          <h3 className={styles.suggestionsTitle}>
            Recommended Regional Destinations
          </h3>

          <div className={styles.suggestionsGrid}>
            {cities.map(city => (
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

        <div className={styles.actionRow}>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleSubmit} 
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Creating...' : 'Create Trip & Customize Stops'} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default CreateTripPage;
