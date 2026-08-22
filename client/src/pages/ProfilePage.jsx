import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Phone, Edit2, Save, X, Calendar, Plus } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import tripService from '../services/tripService';
import { getTripStatus } from '../utils/tripStatus';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    avatar: user?.avatar || '',
    additionalInfo: user?.additionalInfo || ''
  });

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const res = await tripService.getTrips({});
        const tripList = res?.trips || res?.data?.trips || res || [];
        setTrips(tripList);
      } catch (err) {
        console.error('Failed to load user trips:', err);
      }
    };
    fetchUserTrips();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile(formData);
      }
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const preplannedTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) !== 'completed');
  const previousTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'completed');

  const renderTripCard = (trip) => (
    <Card key={trip._id} className={styles.tripCard}>
      <div 
        className={styles.tripImage} 
        style={{ 
          backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` 
        }}
      />
      <div className={styles.tripCardContent}>
        <h4 className={styles.tripTitle}>{trip.name}</h4>
        <p className={styles.tripDates}>
          <Calendar size={12} />
          {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
        </p>
        <p className={styles.tripBudget}>Budget: ₹{trip.totalBudget || 0}</p>
        <Button 
          variant="outline" 
          size="sm" 
          fullWidth 
          onClick={() => navigate(`/trips/${trip._id}`)}
          className={styles.viewBtn}
        >
          View Itinerary
        </Button>
      </div>
    </Card>
  );

  return (
    <PageShell 
      sectionLabel="07 — PROFILE" 
      title="User profile"
      subtitle="Personal account details, travel history, and preplanned itineraries."
    >
      <div className={styles.container}>
        <Card className={styles.profileHeaderCard}>
          <div className={styles.userPhotoCircleWrapper}>
            {user.avatar ? (
              <img src={user.avatar} alt="User Photo" className={styles.userPhoto} />
            ) : (
              <div className={styles.userPhotoCircle}>
                <User size={36} />
              </div>
            )}
          </div>

          <div className={styles.userDetailsContent}>
            {!isEditing ? (
              <>
                <div className={styles.nameRow}>
                  <div>
                    <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                    <p className={styles.userHandle}>@{user.username}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </Button>
                </div>

                <div className={styles.metaInfoGrid}>
                  <div className={styles.metaInfoItem}>
                    <Mail size={14} /> <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className={styles.metaInfoItem}>
                      <Phone size={14} /> <span>{user.phone}</span>
                    </div>
                  )}
                  {(user.city || user.country) && (
                    <div className={styles.metaInfoItem}>
                      <MapPin size={14} /> <span>{user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>
                    </div>
                  )}
                </div>

                <p className={styles.additionalInfoText}>
                  {user.additionalInfo || 'Passionate traveler exploring global destinations, multi-city routes, and local experiences.'}
                </p>
              </>
            ) : (
              <form onSubmit={handleSave} className={styles.editForm}>
                <div className={styles.formRow}>
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className={styles.formRow}>
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Avatar URL" name="avatar" value={formData.avatar} onChange={handleChange} />
                </div>
                <div className={styles.formRow}>
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Additional Information</label>
                  <textarea 
                    name="additionalInfo" 
                    value={formData.additionalInfo} 
                    onChange={handleChange} 
                    className={styles.textarea}
                    rows="3"
                  ></textarea>
                </div>
                <div className={styles.formActions}>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X size={14} /> Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={loading}>
                    <Save size={14} /> {loading ? 'Saving...' : 'Save Details'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Preplanned Trips */}
        <section className={styles.tripsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Preplanned Trips</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/new')}>
              <Plus size={14} /> Plan New Trip
            </Button>
          </div>
          <div className={styles.tripsGrid}>
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map(trip => renderTripCard(trip))
            ) : (
              <p className={styles.emptyText}>No preplanned trips found.</p>
            )}
          </div>
        </section>

        {/* Previous Trips */}
        <section className={styles.tripsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Previous Trips</h3>
          </div>
          <div className={styles.tripsGrid}>
            {previousTrips.length > 0 ? (
              previousTrips.map(trip => renderTripCard(trip))
            ) : (
              <p className={styles.emptyText}>No previous completed trips found.</p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
