import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Phone, Edit2, Save, X } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    additionalInfo: user?.additionalInfo || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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

  return (
    <PageShell title="My Profile">
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <Card className={styles.avatarCard}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.firstName ? user.firstName.charAt(0) : <User size={48} />}
                </div>
              )}
            </div>
            <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
            <p className={styles.userUsername}>@{user.username}</p>
            
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <Mail size={16} /> <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className={styles.infoItem}>
                  <Phone size={16} /> <span>{user.phone}</span>
                </div>
              )}
              {(user.city || user.country) && (
                <div className={styles.infoItem}>
                  <MapPin size={16} /> <span>{user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className={styles.mainContent}>
          <Card className={styles.detailsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Personal Information</h3>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} /> Edit Profile
                </Button>
              ) : (
                <div className={styles.editActions}>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X size={14} /> Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave} isLoading={loading}>
                    <Save size={14} /> Save
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.row}>
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
                <div className={styles.row}>
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.row}>
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>About Me</label>
                  <textarea 
                    name="additionalInfo" 
                    value={formData.additionalInfo} 
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="4"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className={styles.viewInfo}>
                <div className={styles.infoGroup}>
                  <p className={styles.infoLabel}>About Me</p>
                  <p className={styles.infoValue}>{user.additionalInfo || 'No information provided.'}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
