import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, GripVertical, Trash2, MapPin, Calendar, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
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

  // New Section form state
  const [newSection, setNewSection] = useState({
    cityId: '',
    title: '',
    description: 'All the necessary information about this section. This includes anything like hotel booking, visit or any other activity',
    arrivalDate: '',
    departureDate: '',
    sectionBudget: '',
  });

  // Custom Activity form state
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

      // If trip has no stops, set default dates from trip
      if (fetchedTrip) {
        setNewSection(prev => ({
          ...prev,
          arrivalDate: fetchedTrip.startDate?.split('T')[0] || '',
          departureDate: fetchedTrip.endDate?.split('T')[0] || '',
          title: `Section ${(fetchedTrip.stops?.length || 0) + 1}`,
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
        title: newSection.title || `Section ${(trip.stops?.length || 0) + 1}`,
        description: newSection.description,
        arrivalDate: newSection.arrivalDate,
        departureDate: newSection.departureDate,
        order: trip.stops?.length || 0,
        sectionBudget: Number(newSection.sectionBudget) || 0,
      });
      toast.success('New section added!');
      setIsAddSectionModalOpen(false);
      fetchTripData();
    } catch (error) {
      toast.error(error.message || 'Failed to add section');
    }
  };

  const handleDeleteSection = async (stopId) => {
    if (!window.confirm('Delete this section and its activities?')) return;
    try {
      await stopService.deleteStop(id, stopId);
      toast.success('Section deleted');
      fetchTripData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete section');
    }
  };

  const handleMoveSection = async (index, direction) => {
    const stops = [...(trip.stops || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    // Swap in local array
    const temp = stops[index];
    stops[index] = stops[targetIndex];
    stops[targetIndex] = temp;

    setTrip({ ...trip, stops });

    try {
      await stopService.reorderStops(id, stops.map(s => s._id));
      toast.success('Sections reordered');
    } catch (err) {
      toast.error('Failed to save section order');
      fetchTripData();
    }
  };

  const handleOpenAddActivity = async (stop) => {
    setActiveStopId(stop._id);
    setIsAddActivityModalOpen(true);
    setNewActivity({
      name: '',
      category: 'sightseeing',
      estimatedCost: '',
      duration: 60,
      city: stop.city?._id || stop.city,
    });

    try {
      const cityId = stop.city?._id || stop.city;
      const res = await activityService.getActivities({ city: cityId, limit: 10 });
      setAvailableActivities(res?.activities || res?.data?.activities || res || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleAddActivity = async (activityData) => {
    if (!activeStopId) return;
    try {
      await activityService.addActivityToStop(activeStopId, activityData);
      toast.success('Activity added to section!');
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

  if (loading) return <PageShell title="Build Itinerary Screen"><Loader text="Loading Itinerary Builder..." /></PageShell>;
  if (!trip) return <PageShell title="Build Itinerary Screen"><div className={styles.error}>Trip not found</div></PageShell>;

  const stops = trip.stops || [];

  return (
    <PageShell title="Build Itinerary Screen (Screen 5)">
      <div className={styles.container}>
        {/* Header summary & Save CTA */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.tripTitle}>{trip.name}</h1>
            <p className={styles.tripDates}>
              <Calendar size={15} /> 
              {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
              <span className={styles.dot}>•</span>
              Total Budget: ₹{trip.totalBudget || 0}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate(`/trips/${trip._id}`)}>
            Save & View Itinerary
          </Button>
        </div>

        {/* ── Screen 5: Stacked Sections ── */}
        <div className={styles.sectionsList}>
          {stops.length > 0 ? (
            stops.map((stop, index) => (
              <Card key={stop._id} className={styles.sectionCard}>
                {/* Section Header (Wireframe Screen 5) */}
                <div className={styles.sectionCardHeader}>
                  <div className={styles.sectionTitleBlock}>
                    <GripVertical size={18} className={styles.gripIcon} />
                    <h2 className={styles.sectionNumberTitle}>
                      {stop.title || `Section ${index + 1}`}
                      <span className={styles.cityName}>({stop.city?.name || 'Destination'})</span>
                    </h2>
                  </div>
                  <div className={styles.sectionControlBtns}>
                    <button 
                      onClick={() => handleMoveSection(index, -1)} 
                      disabled={index === 0} 
                      className={styles.orderBtn}
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => handleMoveSection(index, 1)} 
                      disabled={index === stops.length - 1} 
                      className={styles.orderBtn}
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(stop._id)} 
                      className={styles.deleteBtn}
                      title="Delete Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Section Description Text (Wireframe Screen 5) */}
                <p className={styles.sectionDescription}>
                  {stop.description || 'All the necessary information about this section. This includes accommodation details, transit, and local events.'}
                </p>

                {/* Date and Budget bar for Section */}
                <div className={styles.sectionDateBudgetBar}>
                  <span className={styles.dateBadge}>
                    <Calendar size={14} /> 
                    {new Date(stop.arrivalDate).toLocaleDateString()} – {new Date(stop.departureDate).toLocaleDateString()}
                  </span>
                  <span className={styles.budgetBadge}>
                    <DollarSign size={14} /> 
                    Section Budget: ₹{stop.sectionBudget || 0}
                  </span>
                  <span className={styles.activityCountBadge}>
                    {stop.activities?.length || 0} Activities
                  </span>
                </div>

                {/* Scheduled Activities within Section */}
                <div className={styles.activitiesContainer}>
                  <h4 className={styles.activitiesTitle}>Scheduled Activities:</h4>
                  {stop.activities && stop.activities.length > 0 ? (
                    <div className={styles.activitiesGrid}>
                      {stop.activities.map((act) => (
                        <div key={act._id} className={styles.activityCard}>
                          <div className={styles.actMain}>
                            <h5 className={styles.actName}>{act.name}</h5>
                            <span className={styles.actMeta}>{act.category} • ₹{act.estimatedCost || 0}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveActivity(stop._id, act._id)}
                            className={styles.removeActBtn}
                            title="Remove Activity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noActivitiesText}>No activities added to this section yet.</p>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={styles.addActBtn}
                    onClick={() => handleOpenAddActivity(stop)}
                  >
                    <Plus size={14} /> Add Activity to Section
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className={styles.emptyState}>
              <p>No sections added to this itinerary yet.</p>
            </Card>
          )}
        </div>

        {/* ── Prominent "Add another Section" Button (Wireframe Screen 5) ── */}
        <div className={styles.bottomActionArea}>
          <Button 
            variant="accent" 
            size="lg" 
            className={styles.addSectionCta}
            onClick={() => setIsAddSectionModalOpen(true)}
          >
            <Plus size={20} /> Add another Section
          </Button>
        </div>
      </div>

      {/* ── Modal: Add New Section ── */}
      <Modal 
        isOpen={isAddSectionModalOpen} 
        onClose={() => setIsAddSectionModalOpen(false)} 
        title="Add another Section"
      >
        <form onSubmit={handleAddSection} className={styles.modalForm}>
          <Input 
            label="Section Title" 
            value={newSection.title} 
            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} 
            placeholder="e.g. Section 1, Paris Stay"
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Select Destination City *</label>
            <div className={styles.selectWrapper}>
              <MapPin size={18} className={styles.selectIcon} />
              <select 
                value={newSection.cityId} 
                onChange={(e) => setNewSection({ ...newSection, cityId: e.target.value })} 
                className={styles.select}
                required
              >
                <option value="">-- Choose City --</option>
                {cities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}, {c.country}</option>
                ))}
              </select>
            </div>
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
            label="Budget for this Section (₹)" 
            value={newSection.sectionBudget} 
            onChange={(e) => setNewSection({ ...newSection, sectionBudget: e.target.value })} 
            placeholder="e.g. 15000" 
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Section Information / Notes</label>
            <textarea 
              value={newSection.description} 
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })} 
              className={styles.textarea}
              placeholder="All the necessary information about this section. This includes accommodation details, logistics, or special notes."
              rows="4"
            ></textarea>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" type="button" onClick={() => setIsAddSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              Add Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Add Activity to Section ── */}
      <Modal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Add Activity to Section"
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
