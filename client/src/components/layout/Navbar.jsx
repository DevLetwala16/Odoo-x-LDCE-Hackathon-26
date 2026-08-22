import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Menu, X, User, LogOut, Home, Map, Search, Users, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'My Trips', path: '/trips', icon: <Map size={18} /> },
    { name: 'Search', path: '/search', icon: <Search size={18} /> },
    { name: 'Community', path: '/community', icon: <Users size={18} /> },
    { name: 'Analytics', path: '/admin', icon: <BarChart3 size={18} /> },
  ];

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username || 'User');
  const initial = user?.firstName?.[0] || user?.username?.[0] || 'U';

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <Globe className={styles.brandIcon} />
          <span className={styles.brandText}>GlobeTrotter</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className={styles.userMenu}>
          {user ? (
            <div className={styles.profileDropdown}>
              <button
                className={styles.profileBtn}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className={styles.avatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className={styles.avatarImg} />
                  ) : (
                    initial.toUpperCase()
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{displayName}</p>
                    <p className={styles.userEmail}>{user.email}</p>
                    <span className={styles.userRoleBadge}>{user.role?.toUpperCase()}</span>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/admin" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>
                    <BarChart3 size={16} /> Personal Admin & Analytics
                  </Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
