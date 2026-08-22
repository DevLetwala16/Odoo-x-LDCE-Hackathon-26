import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    avatar: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully! Welcome to GlobeTrotter.');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <Globe className={styles.brandIcon} onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Sign up to start designing your dream multi-city itineraries.</p>
        </div>

        {/* Top Photo Upload Circle */}
        <div className={styles.photoUploadWrapper}>
          <div className={styles.photoCircle}>
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className={styles.avatarPreview} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <Camera size={24} />
                <span className={styles.photoText}>Photo</span>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <Input 
              label="First Name *" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="Jane"
              required 
            />
            <Input 
              label="Last Name *" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Doe"
              required 
            />
          </div>
          
          <div className={styles.row}>
            <Input 
              label="Username *" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="janedoe"
              required 
            />
            <Input 
              label="Password *" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Min. 6 characters"
              required 
            />
          </div>

          <div className={styles.row}>
            <Input 
              label="Email Address *" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="jane@example.com"
              required 
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1 (555) 000-0000"
            />
          </div>
          
          <div className={styles.row}>
            <Input 
              label="City" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="New York"
            />
            <Input 
              label="Country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              placeholder="United States"
            />
          </div>

          <Input 
            label="Avatar Photo URL (Optional)" 
            name="avatar" 
            value={formData.avatar} 
            onChange={handleChange} 
            placeholder="https://images.unsplash.com/..."
          />
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Additional Information (Optional)</label>
            <textarea 
              name="additionalInfo" 
              className={styles.textarea} 
              value={formData.additionalInfo} 
              onChange={handleChange} 
              placeholder="Tell us about your travel interests, preferences..."
              rows="3"
            ></textarea>
          </div>
          
          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>Already have an account? <Link to="/login" className={styles.link}>Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
