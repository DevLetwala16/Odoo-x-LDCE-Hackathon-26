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
    email: '',
    phone: '',
    city: '',
    country: '',
    username: '',
    password: '',
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
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Auto-generate username from email if not given
    const usernameToUse = formData.username || formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
    const passwordToUse = formData.password || 'password123';

    if (passwordToUse.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register({
        ...formData,
        username: usernameToUse,
        password: passwordToUse,
      });
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
          <h1 className={styles.title}>Registration</h1>
          <p className={styles.subtitle}>Sign up to start designing your dream multi-city itineraries.</p>
        </div>

        {/* Top Photo Upload Circle (Screen 2) */}
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
        
        {/* Form Fields arranged strictly according to Screen 2 Schema */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Row 1: First Name | Last Name */}
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

          {/* Row 2: Email Address | Phone Number */}
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
          
          {/* Row 3: City | Country */}
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

          {/* Row 4: Account Credentials (Username & Password) */}
          <div className={styles.row}>
            <Input 
              label="Username (Login ID)" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="janedoe (auto-generated if empty)" 
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
          
          {/* Textarea: Additional Information */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Additional Information ...</label>
            <textarea 
              name="additionalInfo" 
              className={styles.textarea} 
              value={formData.additionalInfo} 
              onChange={handleChange} 
              placeholder="Tell us about your travel interests, preferences, dream destinations..."
              rows="3"
            ></textarea>
          </div>
          
          {/* Centered Registration Button */}
          <div className={styles.btnWrap}>
            <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Registering...' : 'Registration'}
            </Button>
          </div>
        </form>
        
        <div className={styles.footer}>
          <p>Already have an account? <Link to="/login" className={styles.link}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
