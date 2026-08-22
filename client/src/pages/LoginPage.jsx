import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Compass, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import FlightTransition from '../components/common/FlightTransition';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
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
      setIsFlying(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (error) {
      toast.error(error.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <FlightTransition
        isOpen={isFlying}
        title="Boarding Flight... Welcome Aboard!"
        subtitle="Passport validated. Taking off into your global journeys..."
      />

      {/* Left Panel: Form (Wireframe Screen 1) */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContainer} onClick={() => navigate('/')}>
          <Compass className={styles.brandIcon} />
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
              placeholder="Enter your password"
              required
            />

            <div className={styles.extraRow}>
              <label className={styles.rememberMe}>
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <Link to="/register" className={styles.forgotPass}>Create account</Link>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading || isFlying} className={styles.submitBtn}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Sign Up</Link>
          </p>
        </Card>
      </div>

      {/* Right Panel: Atmospheric Travel Photo */}
      <div className={styles.rightPanel}>
        <div className={styles.rightOverlay} />
        <div className={styles.rightContent}>
          <p className={styles.quoteLabel}>Musafir Experience</p>
          <h2 className={styles.quoteTitle}>“To travel is to live.”</h2>
          <p className={styles.quoteAuthor}>— Multi-city routes, live budgets & smart timelines</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
