import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, User, Lock } from 'lucide-react';
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
      <div className={styles.leftPanel}>
        <div className={styles.brandContainer}>
          <Globe size={48} className={styles.brandIcon} />
          <h1 className={styles.brandName}>GlobeTrotter</h1>
        </div>
        <p className={styles.tagline}>Your personal AI travel planner. Plan your dream vacation in seconds.</p>
      </div>
      
      <div className={styles.rightPanel}>
        <Card className={styles.loginCard}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to continue planning your trips</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            
            <Button 
              type="submit" 
              variant="accent" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className={styles.footer}>
            <p>Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
