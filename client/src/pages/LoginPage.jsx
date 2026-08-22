import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, User } from 'lucide-react';
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
      toast.success('Welcome back to Musafir!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel: Form (Wireframe Screen 1) */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContainer} onClick={() => navigate('/')}>
          <Globe className={styles.brandIcon} />
          <h1 className={styles.brandName}>Musafir</h1>
        </div>

        <Card className={styles.loginCard}>
          {/* Round Photo / User Placeholder (Screen 1) */}
          <div className={styles.avatarCircleWrap}>
            <div className={styles.avatarCircle}>
              <User size={32} />
              <span className={styles.avatarText}>Photo</span>
            </div>
          </div>

          <h2 className={styles.title}>Login</h2>
          <p className={styles.subtitle}>Enter your details to access your journeys and travel plans.</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Username *"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
            
            <Input
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.submitBtn}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className={styles.footer}>
            <p>Don't have an account? <Link to="/register" className={styles.link}>Registration</Link></p>
          </div>
        </Card>
      </div>

      {/* Right Panel: Hero Image & Quote Overlay */}
      <div className={styles.rightPanel}>
        <div className={styles.quoteOverlay}>
          <p className={styles.quoteLabel}>Musafir Experience</p>
          <h3 className={styles.quoteTitle}>“To travel is to live.”</h3>
          <p className={styles.quoteSubtitle}>Multi-city routes, live budgets, and smart timelines.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
