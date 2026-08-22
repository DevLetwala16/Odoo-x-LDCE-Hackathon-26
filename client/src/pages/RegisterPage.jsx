import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
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
      toast.error('Please fill in all required fields (First & Last Name, Username, Email, Password)');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Welcome to GlobeTrotter.');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.registerCard}>
        {/* Top Photo Upload Circle (Wireframe Screen 2) */}
        <div className={styles.photoUploadWrapper}>
          <div className={styles.photoCircle}>
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className={styles.avatarPreview} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <Camera size={32} className={styles.photoIcon} />
                <span className={styles.photoText}>Photo</span>
              </div>
            )}
          </div>
        </div>

        <h1 className={styles.title}>Registration</h1>
        <p className={styles.subtitle}>Create your GlobeTrotter account</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Row 1: First Name | Last Name */}
          <div className={styles.row}>
            <Input 
              label="First Name *" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="First Name"
              required 
            />
            <Input 
              label="Last Name *" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Last Name"
              required 
            />
          </div>
          
          {/* Username & Password */}
          <div className={styles.row}>
            <Input 
              label="Username *" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Username"
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

          {/* Row 2: Email Address | Phone Number */}
          <div className={styles.row}>
            <Input 
              label="Email Address *" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="email@example.com"
              required 
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+91 9876543210"
            />
          </div>
          
          {/* Row 3: City | Country */}
          <div className={styles.row}>
            <Input 
              label="City" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="Your City"
            />
            <Input 
              label="Country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              placeholder="Your Country"
            />
          </div>

          <Input 
            label="Avatar Photo URL (Optional)" 
            name="avatar" 
            value={formData.avatar} 
            onChange={handleChange} 
            placeholder="https://images.unsplash.com/..."
          />
          
          {/* Row 4: Additional Information ... */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Additional Information ...</label>
            <textarea 
              name="additionalInfo" 
              className={styles.textarea} 
              value={formData.additionalInfo} 
              onChange={handleChange} 
              placeholder="Tell us about your travel interests, preferences..."
              rows="3"
            ></textarea>
          </div>
          
          <Button type="submit" variant="accent" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Registration'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>Already have an account? <Link to="/login" className={styles.link}>Log in</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
