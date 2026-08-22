import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';
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
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.registerCard}>
        <div className={styles.header}>
          <Globe size={40} className={styles.brandIcon} />
          <h1 className={styles.title}>Join GlobeTrotter</h1>
          <p className={styles.subtitle}>Create an account to start planning your journeys</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <Input 
              label="First Name *" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="e.g. Alex"
              required 
            />
            <Input 
              label="Last Name *" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="e.g. Smith"
              required 
            />
          </div>
          
          <div className={styles.row}>
            <Input 
              label="Username *" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="e.g. alexsmith"
              required 
            />
            <Input 
              label="Email *" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="alex@example.com"
              required 
            />
          </div>
          
          <Input 
            label="Password *" 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Minimum 6 characters"
            required 
          />
          
          <div className={styles.row}>
            <Input 
              label="Phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1234567890"
            />
            <Input 
              label="Avatar URL" 
              name="avatar" 
              value={formData.avatar} 
              onChange={handleChange} 
              placeholder="https://..."
            />
          </div>
          
          <div className={styles.row}>
            <Input 
              label="City" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="e.g. Paris"
            />
            <Input 
              label="Country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              placeholder="e.g. France"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Additional Info</label>
            <textarea 
              name="additionalInfo" 
              className={styles.textarea} 
              value={formData.additionalInfo} 
              onChange={handleChange} 
              placeholder="Travel preferences, dietary requirements, interests..."
              rows="3"
            ></textarea>
          </div>
          
          <Button type="submit" variant="accent" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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
