import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  MapPin,
  Activity as ActivityIcon,
  TrendingUp,
  DollarSign,
  Trash2,
  Shield,
  Globe,
  Clock,
  Calendar,
  Search,
  BarChart3,
  PieChart as PieIcon,
  Compass,
  UserCheck,
  RotateCcw,
  ArrowRight,
  Flame,
  Layers,
  X,
  Edit,
  Plus,
  RefreshCw,
  ShieldOff
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import styles from './AdminPanelPage.module.css';

const CHART_COLORS = ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB', '#E74C3C', '#1ABC9C'];

const COST_RUPEE_SHORT = {
  1: '₹0–2k',
  2: '₹2k–5k',
  3: '₹5k–10k',
  4: '₹10k–20k',
  5: '₹20k+',
};

const COST_RUPEE_FULL = {
  1: 'Budget (₹0 – ₹2,000)',
  2: 'Affordable (₹2,000 – ₹5,000)',
  3: 'Moderate (₹5,000 – ₹10,000)',
  4: 'Expensive (₹10,000 – ₹20,000)',
  5: 'Luxury (₹20,000+)',
};

const MOCK_TRENDS = {
  day: [
    { label: '00:00', cost: 1200 },
    { label: '04:00', cost: 1800 },
    { label: '08:00', cost: 4500 },
    { label: '12:00', cost: 8900 },
    { label: '16:00', cost: 6200 },
    { label: '20:00', cost: 3100 },
  ],
  week: [
    { label: 'Mon', cost: 4500 },
    { label: 'Tue', cost: 7800 },
    { label: 'Wed', cost: 3200 },
    { label: 'Thu', cost: 9500 },
    { label: 'Fri', cost: 12000 },
    { label: 'Sat', cost: 15400 },
    { label: 'Sun', cost: 8900 },
  ],
  month: [
    { label: 'Week 1', cost: 24000 },
    { label: 'Week 2', cost: 35000 },
    { label: 'Week 3', cost: 18000 },
    { label: 'Week 4', cost: 42000 },
  ],
  year: [
    { label: 'Jan', cost: 35000 },
    { label: 'Feb', cost: 42000 },
    { label: 'Mar', cost: 58000 },
    { label: 'Apr', cost: 31000 },
    { label: 'May', cost: 67000 },
    { label: 'Jun', cost: 89000 },
    { label: 'Jul', cost: 110000 },
    { label: 'Aug', cost: 95000 },
    { label: 'Sep', cost: 72000 },
    { label: 'Oct', cost: 83000 },
    { label: 'Nov', cost: 125000 },
    { label: 'Dec', cost: 150000 },
  ]
};

const MOCK_CATEGORIES = [
  { name: 'Accommodation', value: 35000 },
  { name: 'Transport', value: 24500 },
  { name: 'Food & Dining', value: 18200 },
  { name: 'Activities', value: 15000 },
  { name: 'Shopping', value: 9500 },
  { name: 'Other', value: 4800 },
];

const MOCK_BUDGET_COMPARISON = [
  { name: 'Paris Getaway', budget: 80000, spent: 72000 },
  { name: 'Lisbon Tour', budget: 60000, spent: 58000 },
  { name: 'Tokyo Adventure', budget: 120000, spent: 115000 },
  { name: 'Bali Relax', budget: 50000, spent: 48000 },
  { name: 'Bengaluru Work', budget: 30000, spent: 22000 },
];

const MOCK_MAP_CITIES = [
  { name: 'Lisbon', country: 'Portugal', region: 'Europe', costIndex: 3, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1509840144299-db508400a789?w=300' },
  { name: 'Paris', country: 'France', region: 'Europe', costIndex: 4, popularity: 95, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300' },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 5, popularity: 98, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300' },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 2, popularity: 96, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300' },
  { name: 'Bengaluru', country: 'India', region: 'Asia', costIndex: 2, popularity: 88, imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300' },
];

const AdminPanelPage = () => {
  const { user: currentAuthUser } = useAuth();
  const isAdmin = currentAuthUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState('analytics');

  // Personal/Platform Analytics Stats
  const [stats, setStats] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [loadingStats, setLoadingStats] = useState(false);
  const [costInterval, setCostInterval] = useState('week');
  const [hoveredCity, setHoveredCity] = useState(null);

  // Platform Overview State
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  // Cities State
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  // Activities State
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');

  // Modal states
  const [showCityModal, setShowCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityForm, setCityForm] = useState({
    name: '', country: '', region: '', cost_index: 3, popularity_score: 80, image_url: ''
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    city_id: '', name: '', category: 'sightseeing', cost: 0, duration_hours: 1, description: ''
  });

  // Set default tab on load based on role
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('overview');
    } else {
      setActiveTab('analytics');
    }
  }, [isAdmin]);

  // ── Fetchers ──
  const fetchStatsForUser = async (targetUserId) => {
    try {
      setLoadingStats(true);
      const statsData = await adminService.getStats(targetUserId);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load analytics trends');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsersList = async () => {
    if (!isAdmin) return;
    try {
      setLoadingUsers(true);
      const usersData = await adminService.getUsers();
      setUsers(usersData || []);
    } catch (err) {
      toast.error('Failed to load users list');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchOverview = async () => {
    if (!isAdmin) return;
    try {
      setLoadingOverview(true);
      const data = await adminService.getOverview();
      setOverview(data);
    } catch (err) {
      toast.error('Failed to load platform overview metrics');
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchCities = async () => {
    if (!isAdmin) return;
    try {
      setLoadingCities(true);
      const c = await adminService.getCities();
      setCities(c || []);
      if (c && c.length > 0 && !selectedCityId) {
        setSelectedCityId(c[0].id || c[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load destinations');
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchActivities = async (cityId) => {
    if (!isAdmin || !cityId) return;
    try {
      setLoadingActivities(true);
      const acts = await adminService.getActivitiesForCity(cityId);
      setActivities(acts || []);
    } catch (err) {
      toast.error('Failed to load activities for city');
    } finally {
      setLoadingActivities(false);
    }
  };

  // Trigger loads based on active tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchStatsForUser(selectedUserId);
      if (isAdmin && users.length === 0) {
        fetchUsersList();
      }
    } else if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'users') {
      fetchUsersList();
    } else if (activeTab === 'cities') {
      fetchCities();
    } else if (activeTab === 'activities') {
      fetchCities();
    }
  }, [activeTab, selectedUserId, isAdmin]);

  // Fetch activities when selected city changes
  useEffect(() => {
    if (activeTab === 'activities' && selectedCityId) {
      fetchActivities(selectedCityId);
    }
  }, [selectedCityId, activeTab]);

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    setActiveTab('analytics');
    const target = users.find(u => u._id === id || u.id === id);
    if (target) {
      toast.success(`Loaded analytics for ${target.firstName || target.username}`);
    } else {
      toast.success('Loaded platform analytics');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'analytics') fetchStatsForUser(selectedUserId);
    else if (activeTab === 'users') fetchUsersList();
    else if (activeTab === 'cities') fetchCities();
    else if (activeTab === 'activities' && selectedCityId) fetchActivities(selectedCityId);
  };

  // ── User Administration ──
  const handleToggleAdmin = async (userId) => {
    try {
      const res = await adminService.toggleAdmin(userId);
      toast.success(res.message || 'Admin status updated');
      setUsers((prev) => prev.map((u) =>
        (u._id === userId || u.id === userId)
          ? { ...u, role: res.is_admin ? 'admin' : 'user' }
          : u
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will remove all their trips.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      if (selectedUserId === id) setSelectedUserId('all');
      toast.success(`User "${name}" deleted`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // ── City CRUD ──
  const openCityModal = (city = null) => {
    if (city) {
      setEditingCity(city);
      setCityForm({
        name: city.name,
        country: city.country,
        region: city.region || '',
        cost_index: city.cost_index || 3,
        popularity_score: city.popularity_score || 80,
        image_url: city.image_url || ''
      });
    } else {
      setEditingCity(null);
      setCityForm({ name: '', country: '', region: '', cost_index: 3, popularity_score: 80, image_url: '' });
    }
    setShowCityModal(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        const cityId = editingCity.id || editingCity._id;
        await adminService.updateCity(cityId, cityForm);
        toast.success('Destination updated successfully');
      } else {
        await adminService.createCity(cityForm);
        toast.success('Destination created successfully');
      }
      setShowCityModal(false);
      fetchCities();
    } catch (err) {
      toast.error(err.message || 'Failed to save destination');
    }
  };

  const handleDeleteCity = async (cityId, cityName) => {
    if (!window.confirm(`Delete city "${cityName}" and ALL its curated activities? This cannot be undone.`)) return;
    try {
      await adminService.deleteCity(cityId);
      toast.success(`Destination "${cityName}" deleted`);
      fetchCities();
    } catch (err) {
      toast.error(err.message || 'Failed to delete city');
    }
  };

  // ── Curated Activity CRUD ──
  const openActivityModal = () => {
    setActivityForm({
      city_id: selectedCityId || (cities[0]?.id || cities[0]?._id || ''),
      name: '',
      category: 'sightseeing',
      cost: 0,
      duration_hours: 1,
      description: ''
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      await adminService.createActivity(activityForm);
      toast.success('Curated activity added');
      setShowActivityModal(false);
      if (selectedCityId) fetchActivities(selectedCityId);
    } catch (err) {
      toast.error(err.message || 'Failed to create activity');
    }
  };

  const handleDeleteActivity = async (actId, actName) => {
    if (!window.confirm(`Delete curated activity "${actName}"?`)) return;
    try {
      await adminService.deleteActivity(actId);
      toast.success(`Activity "${actName}" deleted`);
      if (selectedCityId) fetchActivities(selectedCityId);
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
    }
  };

  // ── Filtered data ──
  const filteredUsers = useMemo(() => {
    if (!searchUser) return users;
    const q = searchUser.toLowerCase();
    return users.filter((u) =>
      `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.username || ''}`.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  const filteredCities = useMemo(() => {
    if (!searchCity) return cities;
    const q = searchCity.toLowerCase();
    return cities.filter((c) =>
      `${c.name || ''} ${c.country || ''} ${c.region || ''}`.toLowerCase().includes(q)
    );
  }, [cities, searchCity]);

  const selectedUserObj = users.find(u => u._id === selectedUserId || u.id === selectedUserId);

  const navTabs = [
    ...(isAdmin ? [{ key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> }] : []),
    { key: 'analytics', label: 'Trends & Analytics', icon: <TrendingUp size={16} /> },
    ...(isAdmin ? [
      { key: 'users', label: 'Manage Users', icon: <Users size={16} /> },
      { key: 'cities', label: 'Manage Cities', icon: <Globe size={16} /> },
      { key: 'activities', label: 'Manage Activities', icon: <ActivityIcon size={16} /> }
    ] : []),
  ];

  const currentCostData = useMemo(() => {
    if (stats?.trends?.[costInterval] && stats.trends[costInterval].length > 0) {
      return stats.trends[costInterval];
    }
    return MOCK_TRENDS[costInterval];
  }, [stats, costInterval]);

  const categoryData = useMemo(() => {
    if (stats?.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      return stats.categoryBreakdown;
    }
    return MOCK_CATEGORIES;
  }, [stats]);

  const mapCities = useMemo(() => {
    if (stats?.mapData && stats.mapData.length > 0) {
      return stats.mapData;
    }
    if (cities && cities.length > 0) {
      return cities.map(c => ({
        name: c.name,
        country: c.country,
        region: c.region,
        costIndex: c.cost_index || c.costIndex || 3,
        popularity: c.popularity_score || c.popularity || 80,
        imageUrl: c.image_url || c.imageUrl
      }));
    }
    return MOCK_MAP_CITIES;
  }, [stats, cities]);

  const budgetComparisonData = useMemo(() => {
    if (stats?.tripBudgetComparison && stats.tripBudgetComparison.length > 0) {
      return stats.tripBudgetComparison;
    }
    return MOCK_BUDGET_COMPARISON;
  }, [stats]);

  return (
    <PageShell sectionLabel="Administration" title="Admin & Intelligence Dashboard">
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isAdmin ? "Musafir Admin Dashboard" : "Personal Travel Intelligence"}
            </h1>
            <p className={styles.subtitle}>
              {isAdmin
                ? "Platform-wide user trends, destination cost indexing, and curated activity analytics."
                : "Real database insights, personal expenditure records, and trip budgets."
              }
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={handleRefresh} className={styles.resetBtn}>
              <RefreshCw size={14} /> Refresh Data
            </Button>

            {isAdmin && activeTab === 'analytics' && (
              <div className={styles.userSelectorBox}>
                <label className={styles.userSelectorLabel}><UserCheck size={14} /> Filter Graph:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className={styles.userDropdown}
                >
                  <option value="all">All Users (Platform-Wide)</option>
                  {users.map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.firstName} {u.lastName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* User-Specific Active Banner */}
        {activeTab === 'analytics' && selectedUserId !== 'all' && selectedUserObj && (
          <div className={styles.userActiveBanner}>
            <div className={styles.userBannerInfo}>
              <div className={styles.userBannerAvatar}>
                {selectedUserObj.firstName?.[0]}{selectedUserObj.lastName?.[0]}
              </div>
              <div>
                <h4 className={styles.userBannerName}>
                  Showing Real Analytics for: <strong>{selectedUserObj.firstName} {selectedUserObj.lastName}</strong> (@{selectedUserObj.username})
                </h4>
                <p className={styles.userBannerEmail}>Email: {selectedUserObj.email} &bull; Role: {selectedUserObj.role?.toUpperCase()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSelectUser('all')} className={styles.resetBtn}>
              <RotateCcw size={14} /> Reset to All Users
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={styles.tabsRow}>
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.activeTabBtn : ''}`}
              onClick={() => { setActiveTab(tab.key); setSearchUser(''); setSearchCity(''); }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Panels */}
        <div className={styles.mainCanvas}>

          {/* ═══════ TAB: OVERVIEW (Admin Only) ═══════ */}
          {activeTab === 'overview' && isAdmin && (
            <div className={styles.tabContentArea}>
              {loadingOverview ? (
                <Loader text="Loading overview metrics..." />
              ) : overview ? (
                <>
                  {/* Stats KPIs */}
                  <div className={styles.kpiGrid}>
                    {[
                      { label: "Total Users", value: overview.stats.total_users, icon: <Users size={20} />, color: "rgba(14, 124, 134, 0.12)", txtColor: "#0E7C86" },
                      { label: "Total Trips", value: overview.stats.total_trips, icon: <Compass size={20} />, color: "rgba(242, 112, 60, 0.12)", txtColor: "#F2703C" },
                      { label: "Destinations", value: overview.stats.total_cities, icon: <Globe size={20} />, color: "rgba(47, 163, 107, 0.12)", txtColor: "#2FA36B" },
                      { label: "Total Activities", value: overview.stats.total_activities, icon: <ActivityIcon size={20} />, color: "rgba(243, 156, 18, 0.12)", txtColor: "#F39C12" },
                      { label: "City Stops", value: overview.stats.total_stops, icon: <MapPin size={20} />, color: "rgba(231, 76, 60, 0.12)", txtColor: "#E74C3C" },
                      { label: "Scheduled Acts", value: overview.stats.total_scheduled_activities, icon: <Calendar size={20} />, color: "rgba(142, 68, 173, 0.12)", txtColor: "#8E44AD" }
                    ].map((kpi) => (
                      <div key={kpi.label} className={styles.kpiCard}>
                        <div className={styles.kpiIconWrap} style={{ backgroundColor: kpi.color, color: kpi.txtColor }}>
                          {kpi.icon}
                        </div>
                        <div>
                          <p className={styles.kpiLabel}>{kpi.label}</p>
                          <p className={styles.kpiValue}>{(kpi.value || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2-Column: Category Distribution + Top Destinations */}
                  <div className={styles.twoColumnGrid}>
                    <div className={styles.chartCard}>
                      <div className={styles.chartHeaderRow}>
                        <h3 className={styles.chartTitle}><PieIcon size={18} /> Curated Activity Categories</h3>
                      </div>
                      <div className={styles.pieContainer}>
                        {(!overview.category_distribution || overview.category_distribution.length === 0) ? (
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', padding: '40px 0' }}>No activities seeded in database.</p>
                        ) : (
                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(() => {
                              const maxVal = Math.max(...overview.category_distribution.map(c => c.count), 1);
                              return overview.category_distribution.map((cat, i) => (
                                <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {cat.category}
                                  </span>
                                  <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--color-bg-sunken)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        width: `${(cat.count / maxVal) * 100}%`,
                                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                        height: '100%',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingRight: '8px',
                                        transition: 'width 0.5s ease'
                                      }}
                                    >
                                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{cat.count}</span>
                                    </div>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.chartCard}>
                      <div className={styles.chartHeaderRow}>
                        <h3 className={styles.chartTitle}><TrendingUp size={18} /> Top Planned Destinations</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {(!overview.top_planned_cities || overview.top_planned_cities.length === 0) ? (
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', padding: '40px 0' }}>No trips planned yet.</p>
                        ) : (
                          overview.top_planned_cities.map((c, i) => (
                            <div key={c.city + i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                  {i + 1}
                                </span>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{c.city}</p>
                                  <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0 }}>{c.country}</p>
                                </div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(14, 124, 134, 0.1)', color: '#0E7C86', padding: '4px 12px', borderRadius: '20px' }}>
                                {c.stops_count} visits
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recents: Users + Trips */}
                  <div className={styles.twoColumnGrid}>
                    <div className={styles.tableCard}>
                      <h3 className={styles.tableTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Recent Registrations</h3>
                      <div style={{ marginTop: '12px' }}>
                        {overview.recent_users?.map((u) => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{u.name}</p>
                              <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0 }}>{u.email}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {u.is_admin && (
                                <span style={{ fontSize: '9px', backgroundColor: 'rgba(231,76,60,0.1)', color: '#E74C3C', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: '10px' }}>Admin</span>
                              )}
                              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{u.created_at}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tableCard}>
                      <h3 className={styles.tableTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Compass size={16} /> Recently Created Itineraries</h3>
                      <div style={{ marginTop: '12px' }}>
                        {overview.recent_trips?.map((t) => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{t.name}</p>
                              <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0 }}>{t.start_date} to {t.end_date}</p>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F2703C' }}>₹{(t.budget || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        {(!overview.recent_trips || overview.recent_trips.length === 0) && (
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', padding: '20px 0' }}>No trips created yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>No overview stats available.</p>
              )}
            </div>
          )}

          {/* ═══════ TAB: TRENDS & ANALYTICS ═══════ */}
          {activeTab === 'analytics' && (
            <div className={styles.tabContentArea}>
              {loadingStats ? (
                <Loader text="Loading spending trends..." />
              ) : stats ? (
                <div className={styles.layoutGrid}>
                  <div className={styles.mainCanvas}>
                    {/* Cost Over Time Chart */}
                    <div className={styles.chartCard}>
                      <div className={styles.chartHeaderRow}>
                        <div>
                          <h3 className={styles.chartTitle}><TrendingUp size={18} /> Budget & Expenditure Analysis</h3>
                          <p className={styles.chartSubtitle}>Timeframe comparison of estimated travel costs</p>
                        </div>
                        <div className={styles.intervalButtons}>
                          {['day', 'week', 'month', 'year'].map((interval) => (
                            <button
                              key={interval}
                              className={`${styles.intervalBtn} ${costInterval === interval ? styles.activeIntervalBtn : ''}`}
                              onClick={() => setCostInterval(interval)}
                            >
                              {interval.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.chartBody}>
                        {currentCostData.length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                            No spending history records found for this interval.
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={currentCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0E7C86" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#0E7C86" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                              <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} />
                              <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} />
                              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']} />
                              <Area type="monotone" dataKey="cost" name="Expenditure" stroke="#0E7C86" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Category Distribution + Budget Variance */}
                    <div className={styles.twoColumnGrid}>
                      <div className={styles.chartCard}>
                        <div className={styles.chartHeaderRow}>
                          <h3 className={styles.chartTitle}><PieIcon size={18} /> Budget Category Allocations</h3>
                        </div>
                        <div className={styles.pieContainer}>
                          {categoryData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                              No expense records registered.
                            </div>
                          ) : (
                            <>
                              <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {categoryData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className={styles.categoryLegendList}>
                                {categoryData.map((cat, i) => (
                                  <div key={cat.name} className={styles.legendItem}>
                                    <span className={styles.colorDot} style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                                    <span className={styles.legendName}>{cat.name}</span>
                                    <span className={styles.legendAmount}>₹{cat.value.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className={styles.chartCard}>
                        <div className={styles.chartHeaderRow}>
                          <h3 className={styles.chartTitle}><BarChart3 size={18} /> Plan vs. Actual Expenditures</h3>
                        </div>
                        <div className={styles.chartBody}>
                          {budgetComparisonData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                              Create trips to analyze budget allocations.
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height={230}>
                              <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={9} tickLine={false} />
                                <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} />
                                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                                <Bar dataKey="budget" name="Allocated Budget" fill="#0E7C86" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spent" name="Spent Amount" fill="#F2703C" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className={styles.sidebarPanel}>
                    <div className={styles.infoBoxCard}>
                      <div className={styles.infoBoxHeader}>
                        <Globe size={18} className={styles.infoIcon} />
                        <h3>Destination Cost Map</h3>
                      </div>
                      <p className={styles.guideText}>
                        Interactive map directory detailing estimated cost markers across seeded platform locations.
                      </p>
                      <div className={styles.mapCanvas}>
                        <div className={styles.mapPinsGrid}>
                          {mapCities.map((city) => (
                            <div
                              key={city.name}
                              className={styles.mapPinItem}
                              onMouseEnter={() => setHoveredCity(city)}
                              onClick={() => setHoveredCity(city)}
                            >
                              <span className={styles.pinDot}></span>
                              <span className={styles.pinLabel}>{city.name}</span>
                              <span className={styles.pinCostTag}>{COST_RUPEE_SHORT[city.costIndex] || '₹'}</span>
                            </div>
                          ))}
                        </div>
                        {hoveredCity && (
                          <div className={styles.hoverCostPopover}>
                            <div
                              className={styles.hoverCityImg}
                              style={{ backgroundImage: `url(${hoveredCity.imageUrl || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300'})` }}
                            ></div>
                            <div className={styles.hoverCityDetails}>
                              <div className={styles.popoverHeader}>
                                <h4>{hoveredCity.name}</h4>
                                <span className={styles.regionTag}>{hoveredCity.region || 'Global'}</span>
                              </div>
                              <p className={styles.popoverCost}>
                                Cost Index: <strong>{COST_RUPEE_FULL[hoveredCity.costIndex] || 'Moderate'}</strong>
                              </p>
                              <div className={styles.popoverMeta}>
                                <span>Popularity: {hoveredCity.popularity || 85}/100</span>
                                <span>Country: {hoveredCity.country}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={styles.serverStatusCard}>
                        <div className={styles.statusRow}>
                          <span>MongoDB Connection:</span>
                          <span className={styles.statusOnline}>ACTIVE</span>
                        </div>
                        <div className={styles.statusRow}>
                          <span>API Routing Gateway:</span>
                          <span className={styles.statusText}>express-cors-proxied</span>
                        </div>
                        <div className={styles.statusRow}>
                          <span>Local Timezone:</span>
                          <span className={styles.statusHighlight}>Asia/Kolkata</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>No trend records found in database.</p>
              )}
            </div>
          )}

          {/* ═══════ TAB: MANAGE USERS ═══════ */}
          {activeTab === 'users' && isAdmin && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeaderControls}>
                <div>
                  <h3 className={styles.tableTitle}>Registered Platform Members</h3>
                  <p className={styles.tableSubtitle}>Manage authorizations, review login security, and assign admin roles</p>
                </div>
                <div className={styles.searchUserWrap}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Filter by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className={styles.userSearchInput}
                  />
                  {searchUser && (
                    <button onClick={() => setSearchUser('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.tableWrapper}>
                {loadingUsers ? (
                  <Loader text="Loading members list..." />
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Member Details</th>
                        <th>Email Address</th>
                        <th>Origin Location</th>
                        <th style={{ textAlign: 'center' }}>Role Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id || u.id}>
                          <td>
                            <div className={styles.nameCell}>
                              <div className={styles.avatarCircle}>
                                {u.firstName?.[0]}{u.lastName?.[0]}
                              </div>
                              <div>
                                <span className={styles.boldText}>{u.firstName} {u.lastName}</span>
                                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0 }}>@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.city || "\u2014"}, {u.country || "\u2014"}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleAdmin(u._id || u.id)}
                              className={`${styles.roleSwitchBtn} ${u.role === 'admin' ? styles.adminActive : ''}`}
                            >
                              {u.role === 'admin' ? <Shield size={10} /> : <ShieldOff size={10} />}
                              {u.role?.toUpperCase()}
                            </button>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <button onClick={() => handleSelectUser(u._id || u.id)} className={styles.viewUserGraphBtn}>
                                View Analytics
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id || u.id, `${u.firstName} ${u.lastName}`)}
                                className={styles.deleteUserBtn}
                                disabled={u._id === currentAuthUser?._id || u.id === currentAuthUser?._id}
                                title={u._id === currentAuthUser?._id ? "Cannot delete yourself" : "Delete user"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>No registered users matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ═══════ TAB: MANAGE CITIES ═══════ */}
          {activeTab === 'cities' && isAdmin && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeaderControls}>
                <div>
                  <h3 className={styles.tableTitle}>Global Destination Index</h3>
                  <p className={styles.tableSubtitle}>Manage cities directory, cost index scales, and cover imagery</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.searchUserWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Filter destinations..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className={styles.userSearchInput}
                    />
                    {searchCity && (
                      <button onClick={() => setSearchCity('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <Button onClick={() => openCityModal()} style={{ borderRadius: '20px', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
                    <Plus size={14} /> Add City
                  </Button>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                {loadingCities ? (
                  <Loader text="Loading destinations..." />
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>City Details</th>
                        <th>Country</th>
                        <th>Region</th>
                        <th style={{ textAlign: 'center' }}>Cost Scale</th>
                        <th style={{ textAlign: 'center' }}>Popularity</th>
                        <th style={{ textAlign: 'center' }}>Activities</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCities.map((c) => (
                        <tr key={c.id || c._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden',
                                  border: '1px solid var(--color-border)', backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0,
                                  backgroundImage: `url(${c.image_url || c.imageUrl || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=100'})`
                                }}
                              ></div>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</span>
                            </div>
                          </td>
                          <td>{c.country}</td>
                          <td>{c.region || "\u2014"}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: '#0E7C86', fontWeight: 700 }}>{COST_RUPEE_SHORT[c.cost_index || c.costIndex || 3]}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#F39C12' }}>{c.popularity_score || c.popularity || 0}/100</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(14, 124, 134, 0.1)', color: '#0E7C86', padding: '2px 10px', borderRadius: '20px' }}>
                              {c.activities_count || 0}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <button onClick={() => openCityModal(c)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px' }} title="Edit destination">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteCity(c.id || c._id, c.name)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px' }} title="Delete destination">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCities.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>No cities found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ═══════ TAB: MANAGE ACTIVITIES ═══════ */}
          {activeTab === 'activities' && isAdmin && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeaderControls}>
                <div>
                  <h3 className={styles.tableTitle}>Curated Destination Activities</h3>
                  <p className={styles.tableSubtitle}>Configure recommended activity guides, estimated budgets, and duration slots</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Select City:</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      style={{ height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-bg-sunken)', border: '1px solid var(--color-border)', padding: '0 12px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', outline: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                    >
                      {cities.map((c) => (
                        <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.activities_count || 0})</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={openActivityModal} style={{ borderRadius: '20px', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
                    <Plus size={14} /> Add Activity
                  </Button>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                {loadingActivities ? (
                  <Loader text="Loading activities..." />
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Activity Title</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Estimated Cost</th>
                        <th style={{ textAlign: 'center' }}>Duration</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a, i) => (
                        <tr key={a.id || a._id}>
                          <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{i + 1}</td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.name}</span>
                            {a.description && <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</p>}
                          </td>
                          <td>
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'var(--color-bg-sunken)', padding: '2px 6px', borderRadius: '10px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                              {a.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#0E7C86' }}>
                            {Number(a.estimatedCost || a.cost || 0) === 0 ? "Free" : `\u20B9${Math.round(a.estimatedCost || a.cost).toLocaleString()}`}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px' }}>{Math.round((a.duration || 60) / 60)} hrs</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteActivity(a.id || a._id, a.name)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px' }}
                              title="Delete activity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activities.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                            No activities seeded for this city. Click "Add Activity" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══════ CITY CRUD MODAL ═══════ */}
      {showCityModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingCity ? 'Modify Destination' : 'Add New Destination'}</h3>
              <button onClick={() => setShowCityModal(false)} className={styles.modalCloseBtn}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveCity}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>City Name *</label>
                  <input type="text" required value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} className={styles.formInput} placeholder="e.g. Lisbon" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Country Name *</label>
                  <input type="text" required value={cityForm.country} onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })} className={styles.formInput} placeholder="e.g. Portugal" />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formLabel}>Continent/Region</label>
                <input type="text" value={cityForm.region} onChange={(e) => setCityForm({ ...cityForm, region: e.target.value })} className={styles.formInput} placeholder="e.g. Europe" />
              </div>
              <div className={styles.formRow} style={{ marginTop: '16px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cost Index (1-5)</label>
                  <input type="number" min={1} max={5} value={cityForm.cost_index} onChange={(e) => setCityForm({ ...cityForm, cost_index: Number(e.target.value) })} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Popularity (1-100)</label>
                  <input type="number" min={1} max={100} value={cityForm.popularity_score} onChange={(e) => setCityForm({ ...cityForm, popularity_score: Number(e.target.value) })} className={styles.formInput} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formLabel}>Cover Image URL</label>
                <input type="text" value={cityForm.image_url} onChange={(e) => setCityForm({ ...cityForm, image_url: e.target.value })} className={styles.formInput} placeholder="https://images.unsplash.com/photo-..." />
              </div>
              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setShowCityModal(false)}>Cancel</Button>
                <Button type="submit">{editingCity ? 'Save Details' : 'Register Destination'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ ACTIVITY CRUD MODAL ═══════ */}
      {showActivityModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Curated Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className={styles.modalCloseBtn}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveActivity}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Target Destination</label>
                <select value={activityForm.city_id} onChange={(e) => setActivityForm({ ...activityForm, city_id: e.target.value })} className={styles.formSelect} required>
                  {cities.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}, {c.country}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formLabel}>Activity Title *</label>
                <input type="text" required value={activityForm.name} onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })} className={styles.formInput} placeholder="e.g. Historic Alfama Walking Tour" />
              </div>
              <div className={styles.formRow} style={{ marginTop: '16px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select value={activityForm.category} onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })} className={styles.formSelect}>
                    <option value="sightseeing">Sightseeing</option>
                    <option value="food">Food</option>
                    <option value="adventure">Adventure</option>
                    <option value="culture">Culture</option>
                    <option value="nightlife">Nightlife</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cost (INR)</label>
                  <input type="number" min={0} value={activityForm.cost} onChange={(e) => setActivityForm({ ...activityForm, cost: Number(e.target.value) })} className={styles.formInput} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formLabel}>Duration (Hours)</label>
                <input type="number" min={0.5} step={0.5} value={activityForm.duration_hours} onChange={(e) => setActivityForm({ ...activityForm, duration_hours: Number(e.target.value) })} className={styles.formInput} />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formLabel}>Activity Description</label>
                <textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} className={styles.formTextarea} placeholder="Brief descriptive highlight..." rows={3} />
              </div>
              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setShowActivityModal(false)}>Cancel</Button>
                <Button type="submit">Create Activity</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default AdminPanelPage;
