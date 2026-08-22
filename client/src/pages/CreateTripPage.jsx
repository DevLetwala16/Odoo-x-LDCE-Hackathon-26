import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import styles from './CreateTripPage.module.css';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [popularCities, setPopularCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    description: '',
    coverImage: '',
    initialStop: null
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cities = await cityService.getCities({ limit: 4, sortBy: 'popularity' });
        setPopularCities(cities || []);
      } catch (error) {
        console.error('Error fetching popular cities:', error);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySelect = (cityId) => {
    setFormData({ ...formData, initialStop: cityId });
    toast.success('Selected as first stop');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
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
        coverImage: formData.coverImage
      };
      
      const newTrip = await tripService.createTrip(payload);
      
      if (formData.initialStop) {
        // Mocking creating initial stop
        // await stopService.createStop(newTrip._id, { cityId: formData.initialStop });
      }
      
      toast.success('Trip created successfully!');
      navigate(`/trips/${newTrip._id}/edit`);
    } catch (error) {
      toast.error(error.message || 'Failed to create trip');
      setLoading(false);
    }
  };

  return (
    <PageShell title="Create a New Trip">
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <Card className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Step 1: Trip Details</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input label="Trip Name *" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Summer in Europe" />
              
              <div className={styles.row}>
                <Input type="date" label="Start Date *" name="startDate" value={formData.startDate} onChange={handleChange} required />
                <Input type="date" label="End Date *" name="endDate" value={formData.endDate} onChange={handleChange} required />
              </div>
              
              <Input type="number" label="Total Budget ($)" name="totalBudget" value={formData.totalBudget} onChange={handleChange} placeholder="e.g. 2000" />
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="3"
                  placeholder="What is the purpose of this trip?"
                ></textarea>
              </div>
              
              <Input label="Cover Image URL" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." />
            </form>
          </Card>
        </div>
        
        <div className={styles.sidebar}>
          <Card className={styles.suggestionsCard}>
            <h2 className={styles.sectionTitle}>Step 2: Starting Point</h2>
            <p className={styles.hint}>Where does your journey begin? Select a popular destination to add as your first stop.</p>
            
            <div className={styles.cityList}>
              {popularCities.map(city => (
                <div key={city._id} className={`${styles.cityItem} ${formData.initialStop === city._id ? styles.selectedCity : ''}`}>
                  <div className={styles.cityInfo}>
                    <p className={styles.cityName}>{city.name}</p>
                    <p className={styles.cityCountry}>{city.country}</p>
                  </div>
                  <Button 
                    variant={formData.initialStop === city._id ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleCitySelect(city._id)}
                  >
                    {formData.initialStop === city._id ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
            
            <Button variant="outline" fullWidth className={styles.addAnotherBtn}>
              <Plus size={16} /> Search more cities
            </Button>
          </Card>
          
          <Button 
            variant="accent" 
            size="lg" 
            fullWidth 
            onClick={handleSubmit} 
            isLoading={loading}
            className={styles.submitBtn}
          >
            Create Trip & Build Itinerary
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default CreateTripPage;
