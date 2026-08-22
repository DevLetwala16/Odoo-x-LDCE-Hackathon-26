import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, GripVertical, Trash2, MapPin, Calendar, DollarSign, ArrowUp, ArrowDown, Check, ArrowRight } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import tripService from '../services/tripService';
import stopService from '../services/stopService';
import cityService from '../services/cityService';
import activityService from '../services/activityService';
import styles from './ItineraryBuilderPage.module.css';

const ItineraryBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [countryFilter, setCountryFilter] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [newSection, setNewSection] = useState({
    cityId: '',
    title: '',
    description: 'All necessary details about this stop, including hotel bookings and exploration goals.',
    arrivalDate: '',
    departureDate: '',
    sectionBudget: '',
  });

  const [newActivity, setNewActivity] = useState({
    name: '',
    category: 'sightseeing',
    estimatedCost: '',
    duration: 60,
    city: '',
  });

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [tripData, citiesData] = await Promise.all([
        tripService.getTripById(id),
        cityService.getCities({ limit: 50 })
      ]);
      const fetchedTrip = tripData?.trip || tripData?.data?.trip || tripData;
      setTrip(fetchedTrip);
      setCities(citiesData?.cities || citiesData || []);

      if (fetchedTrip) {
        setNewSection(prev => ({
          ...prev,
          arrivalDate: fetchedTrip.startDate?.split('T')[0] || '',
          departureDate: fetchedTrip.endDate?.split('T')[0] || '',
          title: `Stop ${(fetchedTrip.stops?.length || 0) + 1}`,
        }));
      }
    } catch (error) {
      toast.error('Failed to load itinerary details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTripData();
  }, [id]);

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSection.cityId || !newSection.arrivalDate || !newSection.departureDate) {
      toast.error('Please select a City, Arrival Date, and Departure Date');
      return;
    }

    try {
      await stopService.createStop(id, {
        city: newSection.cityId,
        title: newSection.title || `Stop ${(trip.stops?.length || 0) + 1}`,
        description: newSection.description,
        arrivalDate: newSection.arrivalDate,
        departureDate: newSection.departureDate,
        order: trip.stops?.length || 0,
        sectionBudget: Number(newSection.sectionBudget) || 0,
      });
      toast.success('New stop added!');
      setIsAddSectionModalOpen(false);
      fetchTripData();
    } catch (error) {
      toast.error(error.message || 'Failed to add stop');
    }
  };

  const handleDeleteSection = async (stopId) => {
    if (!window.confirm('Are you sure you want to remove this stop?')) return;
    try {
      await stopService.deleteStop(stopId);
      toast.success('Stop deleted');
      fetchTripData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete stop');
    }
  };

  const handleMoveSection = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= (trip.stops?.length || 0)) return;

    const reordered = [...trip.stops];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await stopService.reorderStops(id, reordered.map(s => s._id));
      setTrip({ ...trip, stops: reordered });
      toast.success('Stops reordered');
    } catch (error) {
      toast.error('Failed to reorder stops');
      fetchTripData();
    }
  };

  const openActivityModal = async (stop) => {
    const cityId = stop.city?._id || stop.city;
    setActiveStopId(stop._id);
    setNewActivity({
      name: '',
      category: 'sightseeing',
      estimatedCost: '',
      duration: 60,
      city: cityId || '',
    });
    setIsAddActivityModalOpen(true);
    try {
      if (cityId) {
        const cityDetails = await cityService.getCityById(cityId);
        setAvailableActivities(cityDetails?.activities || []);
      } else {
        setAvailableActivities([]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleAddActivity = async (activityData) => {
    if (!activeStopId) return;
    try {
      await activityService.addActivityToStop(activeStopId, activityData);
      toast.success('Activity added to stop!');
      setIsAddActivityModalOpen(false);
      setNewActivity({
        name: '',
        category: 'sightseeing',
        estimatedCost: '',
        duration: 60,
        city: '',
      });
      fetchTripData();
    } catch (error) {
      toast.error(error.message || 'Failed to add activity');
    }
  };

  const handleRemoveActivity = async (stopId, activityId) => {
    try {
      await activityService.removeActivityFromStop(stopId, activityId);
      toast.success('Activity removed');
      fetchTripData();
    } catch (error) {
      toast.error('Failed to remove activity');
    }
  };

  if (loading) return <PageShell sectionLabel="03 — EDIT ITINERARY" title="Loading Builder..."><Loader /></PageShell>;
  if (!trip) return <PageShell sectionLabel="03 — EDIT ITINERARY" title="Trip Not Found"><p>Trip not found.</p></PageShell>;

  const stops = trip.stops || [];

  const uniqueCountries = [...new Set(cities.map(c => c.country).filter(Boolean))].sort();
  const filteredCities = cities.filter(c => {
    const matchesCountry = countryFilter ? c.country === countryFilter : true;
    const matchesSearch = citySearch ? c.name.toLowerCase().includes(citySearch.toLowerCase()) : true;
    return matchesCountry && matchesSearch;
  });

  return (
    <PageShell 
      sectionLabel="03 — EDIT ITINERARY" 
      title={trip.name}
      subtitle="Add stops, arrange city order, set dates, and schedule physical activities."
    >
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div>
            <h2 className={styles.panelTitle}>Journey Timeline & Stops</h2>
            <p className={styles.tripDates}>
              <Calendar size={14} /> 
              {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()} • Total Budget: ₹{trip.totalBudget || 0}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate(`/trips/${trip._id}`)}>
            Save & View Itinerary <ArrowRight size={14} />
          </Button>
        </div>

        <div className={styles.sectionsList}>
          {stops.length > 0 ? (
            stops.map((stop, index) => (
              <Card key={stop._id} className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <div className={styles.sectionTitleBlock}>
                    <GripVertical size={18} className={styles.gripIcon} />
                    <h2 className={styles.sectionNumberTitle}>
                      {stop.title || `Stop ${index + 1}`}
                      <span className={styles.cityName}> ({stop.city?.name || 'Destination'})</span>
                    </h2>
                  </div>
                  <div className={styles.sectionControlBtns}>
                    <button 
                      onClick={() => handleMoveSection(index, -1)} 
                      disabled={index === 0} 
                      className={styles.orderBtn}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleMoveSection(index, 1)} 
                      disabled={index === stops.length - 1} 
                      className={styles.orderBtn}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(stop._id)} 
                      className={styles.deleteBtn}
                      title="Delete Stop"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className={styles.sectionDescription}>
                  {stop.description || 'All necessary details about this stop, including hotel bookings and exploration goals.'}
                </p>

                <div className={styles.sectionMetaBar}>
                  <div className={styles.metaBadge}>
                    <span className={styles.metaLabel}>Date Range:</span>
                    <span className={styles.metaValue}>
                      {new Date(stop.arrivalDate).toLocaleDateString()} to {new Date(stop.departureDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.metaBadge}>
                    <span className={styles.metaLabel}>Section Budget:</span>
                    <span className={styles.metaValue}>₹{stop.sectionBudget || 0}</span>
                  </div>
                </div>

                <div className={styles.activitiesSection}>
                  <h4 className={styles.activitiesHeader}>Scheduled Activities:</h4>
                  {stop.activities && stop.activities.length > 0 ? (
                    <div className={styles.activitiesGrid}>
                      {stop.activities.map(act => (
                        <div key={act._id} className={styles.activityChip}>
                          <div>
                            <p className={styles.activityName}>{act.name}</p>
                            <span className={styles.activityMeta}>{act.category} • ₹{act.estimatedCost || 0}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveActivity(stop._id, act._id)} 
                            className={styles.removeActBtn}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noActivitiesText}>No activities added to this stop yet.</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openActivityModal(stop)}
                    className={styles.addActivityBtn}
                  >
                    <Plus size={14} /> Add Activity
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className={styles.emptyState}>
              <p>No stops added to this itinerary yet.</p>
            </Card>
          )}
        </div>

        <div className={styles.bottomActionArea}>
          <Button 
            variant="accent" 
            size="lg" 
            className={styles.addSectionCta}
            onClick={() => setIsAddSectionModalOpen(true)}
          >
            <Plus size={18} /> Add another Stop / Destination
          </Button>
        </div>
      </div>

      {/* Modal: Add New Section */}
      <Modal 
        isOpen={isAddSectionModalOpen} 
        onClose={() => setIsAddSectionModalOpen(false)} 
        title="Add Stop / Destination"
      >
        <form onSubmit={handleAddSection} className={styles.modalForm}>
          <Input 
            label="Stop Title" 
            value={newSection.title} 
            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} 
            placeholder="e.g. Stop 1, Paris Stay"
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Filter by Country</label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setNewSection({ ...newSection, cityId: '' });
              }}
              className={styles.select}
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className={styles.label} style={{ margin: 0 }}>Select Destination City *</label>
              <input 
                type="text" 
                placeholder="Search city name..." 
                value={citySearch} 
                onChange={(e) => setCitySearch(e.target.value)} 
                className={styles.smallSearchInput}
              />
            </div>
            
            <div className={styles.cityGrid}>
               {filteredCities.slice(0, 6).map(c => (
                 <div 
                   key={c._id} 
                   className={`${styles.cityCard} ${newSection.cityId === c._id ? styles.cityCardActive : ''}`}
                   onClick={() => setNewSection({ ...newSection, cityId: c._id })}
                 >
                   <div className={styles.cityCardName}>{c.name}</div>
                   <div className={styles.cityCardCountry}>{c.country}</div>
                 </div>
               ))}
               {filteredCities.length === 0 && <p className={styles.noCities}>No cities found.</p>}
            </div>
            {filteredCities.length > 6 && <p className={styles.moreCities}>+ {filteredCities.length - 6} more matching cities. Refine your search to see them.</p>}
          </div>

          <div className={styles.modalRow}>
            <Input 
              type="date" 
              label="Arrival Date *" 
              value={newSection.arrivalDate} 
              onChange={(e) => setNewSection({ ...newSection, arrivalDate: e.target.value })} 
              required 
            />
            <Input 
              type="date" 
              label="Departure Date *" 
              value={newSection.departureDate} 
              onChange={(e) => setNewSection({ ...newSection, departureDate: e.target.value })} 
              required 
            />
          </div>

          <Input 
            type="number" 
            label="Budget for this Stop (₹)" 
            value={newSection.sectionBudget} 
            onChange={(e) => setNewSection({ ...newSection, sectionBudget: e.target.value })} 
            placeholder="e.g. 15000" 
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Stop Information & Notes</label>
            <textarea 
              value={newSection.description} 
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })} 
              className={styles.textarea}
              rows="3"
            ></textarea>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsAddSectionModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Add Stop</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Activity to Stop */}
      <Modal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Add Activity to Stop"
      >
        <div className={styles.activityModalBody}>
          {availableActivities.length > 0 && (
            <div className={styles.presetActivities}>
              <h4 className={styles.presetTitle}>Select Recommended Activity:</h4>
              <div className={styles.presetList}>
                {availableActivities.map(act => (
                  <div key={act._id} className={styles.presetItem}>
                    <div>
                      <p className={styles.presetName}>{act.name}</p>
                      <span className={styles.presetMeta}>{act.category} • ₹{act.estimatedCost || 0}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddActivity({ activityId: act._id })}
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h4 className={styles.customTitle}>Or Add Custom Activity:</h4>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAddActivity(newActivity);
            }} 
            className={styles.customActForm}
          >
            <Input 
              label="Activity Name *" 
              value={newActivity.name} 
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })} 
              placeholder="e.g., Scuba Diving, Louvre Museum" 
              required 
            />
            <div className={styles.modalRow}>
              <Input 
                type="number" 
                label="Estimated Cost (₹)" 
                value={newActivity.estimatedCost} 
                onChange={(e) => setNewActivity({ ...newActivity, estimatedCost: Number(e.target.value) })} 
                placeholder="₹1000" 
              />
              <Input 
                type="number" 
                label="Duration (mins)" 
                value={newActivity.duration} 
                onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })} 
                placeholder="60" 
              />
            </div>
            <Button type="submit" variant="primary" fullWidth>Add Custom Activity</Button>
          </form>
        </div>
      </Modal>
    </PageShell>
  );
};

export default ItineraryBuilderPage;
