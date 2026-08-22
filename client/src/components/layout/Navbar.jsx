import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Menu, X, User, LogOut, ShieldAlert, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../context/CurrencyContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { currency, setCurrency, availableCurrencies = ['INR', 'USD', 'EUR'] } = useCurrency ? useCurrency() : { currency: 'INR', setCurrency: () => {}, availableCurrencies: ['INR', 'USD', 'EUR'] };
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHeroTransparent = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/search' },
    { name: 'Trips', path: '/trips' },
    { name: 'Calendar', path: '/calendar' },
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
            <div className={styles.authLinks}>
              {/* Currency Switcher — pill button */}
              {availableCurrencies && availableCurrencies.length > 0 && (
                <button
                  className={`${styles.currencyPill} ${isHeroTransparent ? styles.currencyPillTransparent : ''}`}
                  onClick={() => {
                    const idx = availableCurrencies.indexOf(currency);
                    setCurrency(availableCurrencies[(idx + 1) % availableCurrencies.length]);
                  }}
                  title="Click to switch currency"
                >
                  <span className={styles.currencySymbol}>
                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}
                  </span>
                  <span className={styles.currencyCode}>{currency}</span>
                </button>
              )}

              <div className={styles.userMenu}>
                <div 
                  className={styles.avatarContainer} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  <ChevronDown size={14} className={styles.dropdownIcon} />
                </div>
                
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user.firstName} {user.lastName}</span>
                      <span className={styles.dropdownRole}>{user.role}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <User size={16} /> Profile & Analytics
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <ShieldAlert size={16} /> Admin Portal
                      </Link>
                    )}
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
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
