import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Menu, X, User, LogOut, Shield, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHeroTransparent = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Journeys', path: '/trips' },
    { name: 'Explore', path: '/search' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <header className={`${styles.navbar} ${isHeroTransparent ? styles.transparentNavbar : ''}`}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to="/" className={`${styles.brand} ${isHeroTransparent ? styles.transparentBrand : ''}`}>
          <Globe className={styles.brandIcon} size={20} />
          <span className={styles.brandText}>GlobeTrotter</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''} ${isHeroTransparent ? styles.transparentNavLink : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <Link to="/profile" className={`${styles.profileBtn} ${isHeroTransparent ? styles.transparentProfileBtn : ''}`}>
                <User size={14} style={{ color: isHeroTransparent ? '#FDE047' : 'var(--color-accent)' }} />
                <span>{user.firstName || user.name || 'Profile'}</span>
              </Link>
              <button
                className={`${styles.planTripCta} ${isHeroTransparent ? styles.transparentCta : ''}`}
                onClick={() => navigate('/trips/new')}
              >
                Plan Trip <Plus size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.userMenu}>
              <Link to="/login" className={`${styles.signInLink} ${isHeroTransparent ? styles.transparentSignIn : ''}`}>
                Sign In
              </Link>
              <button
                className={`${styles.planTripCta} ${isHeroTransparent ? styles.transparentCta : ''}`}
                onClick={() => navigate('/login')}
              >
                Get Started <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`${styles.mobileToggle} ${isHeroTransparent ? styles.transparentMobileToggle : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/profile"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Profile & Dashboard
            </Link>
            {user ? (
              <button onClick={handleLogout} className={styles.mobileNavLink} style={{ color: 'var(--color-warning)', textAlign: 'left' }}>
                Sign Out
              </button>
            ) : (
              <Link to="/login" className={styles.mobileNavLink} style={{ color: 'var(--color-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
