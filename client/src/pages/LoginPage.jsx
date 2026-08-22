import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        {/* Top Photo Avatar Circle (Wireframe Screen 1) */}
        <div className={styles.photoCircleWrapper}>
          <div className={styles.photoCircle}>
            <User size={40} className={styles.avatarIcon} />
            <span className={styles.photoLabel}>Photo</span>
          </div>
        </div>

        <h1 className={styles.brandTitle}>GlobeTrotter</h1>
        <p className={styles.subtitle}>Sign in to manage and plan your trips</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
          
          <Button 
            type="submit" 
            variant="accent" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>Don't have an account? <Link to="/register" className={styles.link}>Register here</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
