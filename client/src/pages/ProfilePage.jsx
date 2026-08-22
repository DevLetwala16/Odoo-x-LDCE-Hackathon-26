import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  Calendar, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Compass, 
  PieChart as PieIcon,
  Globe,
  BarChart3,
  Activity,
  Star,
  Layers,
  Filter,
  Check,
  Building2,
  SlidersHorizontal,
  ChevronDown
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
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import tripService from '../services/tripService';
import adminService from '../services/adminService';
import { getTripStatus } from '../utils/tripStatus';
import styles from './ProfilePage.module.css';

const CHART_COLORS = ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB', '#E74C3C', '#1ABC9C'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trends'); // 'trends' | 'destinations' | 'activities'
  const [costInterval, setCostInterval] = useState('week'); // 'day' | 'week' | 'month' | 'year'
  const [hoveredCity, setHoveredCity] = useState(null);

  // Tab 2: Destination Rating & Cost Filters
  const [ratingRangeFilter, setRatingRangeFilter] = useState('all'); // 'all' | '95' | '90' | '80' | '70'
  const [costLevelFilter, setCostLevelFilter] = useState('all'); // 'all' | 'budget' | 'mid' | 'luxury'

  // Tab 3: Recommended Activities City Selection Filter
  const [selectedActivityCity, setSelectedActivityCity] = useState('all'); // 'all' | cityName

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    avatar: user?.avatar || '',
    additionalInfo: user?.additionalInfo || ''
  });

  useEffect(() => {
    const fetchUserDataAndStats = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const [tripsRes, statsRes] = await Promise.all([
          tripService.getTrips({}),
          adminService.getStats(user._id),
        ]);
        setTrips(tripsRes?.trips || tripsRes?.data?.trips || tripsRes || []);
        setStats(statsRes);
      } catch (err) {
        console.error('Failed to load user profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDataAndStats();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile(formData);
      }
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const preplannedTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) !== 'completed');
  const previousTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'completed');

  // Real database analytics metrics
  const currentCostData = stats?.trends?.[costInterval] || [];
  const categoryData = stats?.categoryBreakdown || [];
  const userMapCities = stats?.mapData || [];
  const rawTopCities = stats?.topCities || [];
  const rawTopActivities = stats?.topActivities || [];
  const budgetComparisonData = stats?.tripBudgetComparison || [];

  // Filtered Destinations (Tab 2) based on Rating & Cost range
  const filteredDestinations = useMemo(() => {
    return rawTopCities.filter(city => {
      const pop = city.popularity || 80;
      const cost = city.costIndex || 3;

      let matchesRating = true;
      if (ratingRangeFilter === '95') matchesRating = pop >= 95;
      else if (ratingRangeFilter === '90') matchesRating = pop >= 90;
      else if (ratingRangeFilter === '80') matchesRating = pop >= 80;
      else if (ratingRangeFilter === '70') matchesRating = pop >= 70;

      let matchesCost = true;
      if (costLevelFilter === 'budget') matchesCost = cost <= 2;
      else if (costLevelFilter === 'mid') matchesCost = cost === 3;
      else if (costLevelFilter === 'luxury') matchesCost = cost >= 4;

      return matchesRating && matchesCost;
    });
  }, [rawTopCities, ratingRangeFilter, costLevelFilter]);

  // Distinct list of cities for Activity Selection (Tab 3)
  const availableActivityCities = useMemo(() => {
    const citySet = new Set();
    rawTopActivities.forEach(act => {
      const cName = act.city?.name;
      if (cName) citySet.add(cName);
    });
    return Array.from(citySet).sort();
  }, [rawTopActivities]);

  // Filtered Activities (Tab 3) based on user's chosen City
  const filteredActivities = useMemo(() => {
    if (selectedActivityCity === 'all') return rawTopActivities;
    return rawTopActivities.filter(act => act.city?.name?.toLowerCase() === selectedActivityCity.toLowerCase());
  }, [rawTopActivities, selectedActivityCity]);

  // Category breakdown for activities of chosen city
  const activityCategoryBreakdown = useMemo(() => {
    const map = {};
    filteredActivities.forEach(act => {
      const cat = act.category ? act.category.toLowerCase().trim() : 'general';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.keys(map).map((k, idx) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      count: map[k],
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [filteredActivities]);

  const mainTabs = [
    { key: 'trends', label: 'My Personal Trends & Graphs', icon: <BarChart3 size={16} /> },
    { key: 'destinations', label: 'Top Destinations & Cost Map', icon: <MapPin size={16} /> },
    { key: 'activities', label: 'Recommended Activities', icon: <Activity size={16} /> },
  ];

  const renderTripCard = (trip) => (
    <Card key={trip._id} className={styles.tripCard}>
      <div 
        className={styles.tripImage} 
        style={{ 
          backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` 
        }}
      />
      <div className={styles.tripCardContent}>
        <h4 className={styles.tripTitle}>{trip.name}</h4>
        <p className={styles.tripDates}>
          <Calendar size={12} />
          {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
        </p>
        <p className={styles.tripBudget}>Budget: ₹{trip.totalBudget || 0}</p>
        <Button 
          variant="outline" 
          size="sm" 
          fullWidth 
          onClick={() => navigate(`/trips/${trip._id}`)}
          className={styles.viewBtn}
        >
          View
        </Button>
      </div>
    </Card>
  );

  return (
    <PageShell 
      sectionLabel="User Profile" 
      title="User Profile & Personal Dashboard"
      subtitle="Personal account details, travel history, and real database analytics."
    >
      <div className={styles.container}>
        {/* ── Screen 7: User Profile Header Card ── */}
        <Card className={styles.profileHeaderCard}>
          <div className={styles.userPhotoCircleWrapper}>
            {user.avatar && !avatarError ? (
              <img 
                src={user.avatar} 
                alt="" 
                className={styles.userPhoto} 
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className={styles.userPhotoCircle}>
                <User size={36} />
              </div>
            )}
          </div>

          <div className={styles.userDetailsContent}>
            {!isEditing ? (
              <>
                <div className={styles.nameRow}>
                  <div>
                    <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                    <p className={styles.userHandle}>@{user.username}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </Button>
                </div>

                <div className={styles.metaInfoGrid}>
                  <div className={styles.metaInfoItem}>
                    <Mail size={14} /> <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className={styles.metaInfoItem}>
                      <Phone size={14} /> <span>{user.phone}</span>
                    </div>
                  )}
                  {(user.city || user.country) && (
                    <div className={styles.metaInfoItem}>
                      <MapPin size={14} /> <span>{user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>
                    </div>
                  )}
                </div>

                <p className={styles.additionalInfoText}>
                  {user.additionalInfo || 'Passionate traveler exploring global destinations, multi-city routes, and local experiences.'}
                </p>
              </>
            ) : (
              <form onSubmit={handleSave} className={styles.editForm}>
                <div className={styles.formRow}>
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className={styles.formRow}>
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Avatar URL" name="avatar" value={formData.avatar} onChange={handleChange} />
                </div>
                <div className={styles.formRow}>
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Additional Information ...</label>
                  <textarea 
                    name="additionalInfo" 
                    value={formData.additionalInfo} 
                    onChange={handleChange} 
                    className={styles.textarea}
                    rows="3"
                  ></textarea>
                </div>
                <div className={styles.formActions}>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X size={14} /> Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={loading}>
                    <Save size={14} /> {loading ? 'Saving...' : 'Save Details'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* ── 3 Main Navigation Tabs (Matching Screen 12 & User Schema) ── */}
        <div className={styles.mainNavTabsRow}>
          {mainTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.mainNavTabBtn} ${activeTab === tab.key ? styles.activeMainNavTabBtn : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ════════════════ TAB 1: MY PERSONAL TRENDS & GRAPHS ════════════════ */}
        {activeTab === 'trends' && (
          <div className={styles.tabContentBlock}>
            {/* Real Database KPI Metrics */}
            <div className={styles.kpiGrid}>
              <Card className={styles.kpiCard}>
                <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(14, 124, 134, 0.1)' }}>
                  <User size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <p className={styles.kpiLabel}>Account Profile</p>
                  <h3 className={styles.kpiValue}>@{user.username}</h3>
                </div>
              </Card>

              <Card className={styles.kpiCard}>
                <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(242, 112, 60, 0.1)' }}>
                  <Compass size={22} color="var(--color-accent)" />
                </div>
                <div>
                  <p className={styles.kpiLabel}>Your Total Trips</p>
                  <h3 className={styles.kpiValue}>{trips.length}</h3>
                </div>
              </Card>

              <Card className={styles.kpiCard}>
                <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(47, 163, 107, 0.1)' }}>
                  <DollarSign size={22} color="var(--color-success)" />
                </div>
                <div>
                  <p className={styles.kpiLabel}>Your Total Budget</p>
                  <h3 className={styles.kpiValue}>₹{(stats?.totalPlatformBudget || 0).toLocaleString()}</h3>
                </div>
              </Card>

              <Card className={styles.kpiCard}>
                <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(142, 68, 173, 0.1)' }}>
                  <TrendingUp size={22} color="#8E44AD" />
                </div>
                <div>
                  <p className={styles.kpiLabel}>Avg Cost per Trip</p>
                  <h3 className={styles.kpiValue}>₹{(stats?.avgTripBudget || 0).toLocaleString()}</h3>
                </div>
              </Card>
            </div>

            {/* 1. Trip Cost Trajectory & Spending Curve (Area Chart with Interval Toggles) */}
            <Card className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <div>
                  <h4 className={styles.chartCardTitle}>
                    <TrendingUp size={18} /> Your Trip Cost Trajectory & Spending Curve
                  </h4>
                  <p className={styles.chartCardSubtitle}>
                    Real-time graphic representation of your trip costs across day, week, month, and year
                  </p>
                </div>

                <div className={styles.intervalButtons}>
                  {[
                    { id: 'day', label: '1 Day (24h)' },
                    { id: 'week', label: 'Week Wise' },
                    { id: 'month', label: 'Month Wise' },
                    { id: 'year', label: 'Year Wise' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={`${styles.intervalBtn} ${costInterval === item.id ? styles.activeIntervalBtn : ''}`}
                      onClick={() => setCostInterval(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.chartBody}>
                {currentCostData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={currentCostData}>
                      <defs>
                        <linearGradient id="userCostGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className={styles.customTooltip}>
                                <h5 className={styles.tooltipTitle}>{label} ({costInterval.toUpperCase()})</h5>
                                <p className={styles.tooltipItem}>
                                  <strong>Recorded Cost:</strong> ₹{Number(payload[0].value).toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="var(--color-primary)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#userCostGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.noDataText}>No trip cost data recorded for this interval.</p>
                )}
              </div>
            </Card>

            {/* 2 & 3. Category Spending Breakdown & Destinations Map Row */}
            <div className={styles.twoColumnGrid}>
              {/* Category Donut */}
              <Card className={styles.chartCard}>
                <h4 className={styles.chartCardTitle}>
                  <PieIcon size={18} /> Your Category-Wise Spending Breakdown
                </h4>
                <p className={styles.chartCardSubtitle}>
                  Distribution across accommodation, transport, dining, and activities
                </p>

                <div className={styles.pieContainer}>
                  {categoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                                const percent = total > 0 ? Math.round((data.value / total) * 100) : 0;
                                return (
                                  <div className={styles.customTooltip}>
                                    <h5 className={styles.tooltipTitle}>{data.name}</h5>
                                    <p className={styles.tooltipItem}>
                                      <strong>Total Spent:</strong> ₹{data.value.toLocaleString()}
                                    </p>
                                    <p className={styles.tooltipSub}>Allocation: {percent}% of all expenses</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className={styles.categoryLegendList}>
                        {categoryData.map((cat, i) => (
                          <div key={i} className={styles.legendItem}>
                            <span className={styles.colorDot} style={{ backgroundColor: cat.color || CHART_COLORS[i] }}></span>
                            <span className={styles.legendName}>{cat.name}</span>
                            <span className={styles.legendAmount}>₹{cat.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className={styles.noDataText}>No expenses logged yet. Add activities or section budgets to view your breakdown.</p>
                  )}
                </div>
              </Card>

              {/* Destinations & Cost Map */}
              <Card className={styles.chartCard}>
                <h4 className={styles.chartCardTitle}>
                  <Globe size={18} /> Your Destinations & Cost Map
                </h4>
                <p className={styles.chartCardSubtitle}>
                  Hover or tap on destinations to view average trip cost
                </p>

                <div className={styles.userMapArea}>
                  {userMapCities.length > 0 ? (
                    <div className={styles.userMapPinsGrid}>
                      {userMapCities.map((city) => (
                        <div 
                          key={city._id}
                          className={styles.mapPinItem}
                          onMouseEnter={() => setHoveredCity(city)}
                          onClick={() => setHoveredCity(city)}
                        >
                          <div className={styles.pinDot}></div>
                          <span className={styles.pinLabel}>{city.name}</span>
                          <span className={styles.pinCostTag}>₹{(city.avgTripCost/1000).toFixed(0)}k</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noDataText}>No destination stops created yet.</p>
                  )}

                  {hoveredCity && (
                    <div className={styles.hoverCostPopover}>
                      <div 
                        className={styles.hoverCityImg} 
                        style={{ backgroundImage: `url(${hoveredCity.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` }}
                      />
                      <div className={styles.hoverCityDetails}>
                        <h4>{hoveredCity.name}, {hoveredCity.country}</h4>
                        <p className={styles.popoverCost}>
                          Allocated Budget: <strong>₹{hoveredCity.avgTripCost.toLocaleString()}</strong>
                        </p>
                        <p className={styles.popoverTripName}>
                          Popularity: ★ {hoveredCity.popularity}/100 • Cost Index: {hoveredCity.costIndex}/5
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Planned Budget vs Actual Spend Comparison */}
            <Card className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <div>
                  <h4 className={styles.chartCardTitle}>
                    <BarChart3 size={18} /> Planned Budget vs Actual Spend Comparison
                  </h4>
                  <p className={styles.chartCardSubtitle}>
                    X-Axis: Journey / Trip Name • Y-Axis: Total Planned Budget vs Actual Expenses Logged (₹)
                  </p>
                </div>
              </div>

              <div className={styles.chartBody}>
                {budgetComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={budgetComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className={styles.customTooltip}>
                                <h5 className={styles.tooltipTitle}>{d.fullName || d.name}</h5>
                                <div className={styles.tooltipGrid}>
                                  <div><strong>Planned Budget:</strong> ₹{d.allocatedBudget.toLocaleString()}</div>
                                  <div><strong>Actual Spent:</strong> ₹{d.actualExpense.toLocaleString()}</div>
                                  <div><strong>Duration:</strong> {d.durationDays} Days ({d.startDate} – {d.endDate})</div>
                                  <div><strong>Stops Count:</strong> {d.stopsCount} Stops</div>
                                  <div className={d.savingsOrDeficit >= 0 ? styles.savingsText : styles.deficitText}>
                                    <strong>Status:</strong> {d.status} (₹{Math.abs(d.savingsOrDeficit).toLocaleString()})
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend formatter={(v) => v === 'allocatedBudget' ? 'Planned Budget (₹)' : 'Actual Spent (₹)'} />
                      <Bar dataKey="allocatedBudget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualExpense" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.noDataText}>No trip comparison data available yet. Create trips to view planned vs actual budget comparisons.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════ TAB 2: TOP DESTINATIONS & COST MAP (RATING & COST RANGE FILTER) ════════════════ */}
        {activeTab === 'destinations' && (
          <div className={styles.tabContentBlock}>
            {/* Interactive Rating & Cost Filter Bar */}
            <Card className={styles.filterControlCard}>
              <div className={styles.filterBarHeader}>
                <div className={styles.filterBarTitle}>
                  <SlidersHorizontal size={16} color="var(--color-primary)" />
                  <span>Filter Destinations by Rating & Cost Range</span>
                </div>
                <span className={styles.resultCountBadge}>{filteredDestinations.length} Destinations Match</span>
              </div>

              <div className={styles.filterControlsRow}>
                {/* Rating Range Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Rating Range:</label>
                  <div className={styles.filterBtnGroup}>
                    {[
                      { id: 'all', label: 'All Ratings (0-100)' },
                      { id: '95', label: '★ 95+ (World Class)' },
                      { id: '90', label: '★ 90+ (Top Rated)' },
                      { id: '80', label: '★ 80+ (Recommended)' },
                    ].map(r => (
                      <button
                        key={r.id}
                        className={`${styles.filterPillBtn} ${ratingRangeFilter === r.id ? styles.activeFilterPillBtn : ''}`}
                        onClick={() => setRatingRangeFilter(r.id)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Level Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Cost Range:</label>
                  <div className={styles.filterBtnGroup}>
                    {[
                      { id: 'all', label: 'All Budgets' },
                      { id: 'budget', label: 'Affordable (Cost: 1-2)' },
                      { id: 'mid', label: 'Mid-Range (Cost: 3)' },
                      { id: 'luxury', label: 'Luxury (Cost: 4-5)' },
                    ].map(c => (
                      <button
                        key={c.id}
                        className={`${styles.filterPillBtn} ${costLevelFilter === c.id ? styles.activeFilterPillBtn : ''}`}
                        onClick={() => setCostLevelFilter(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Graphical Representation of Filtered Destinations */}
            <Card className={styles.chartCard}>
              <h4 className={styles.chartCardTitle}>
                <MapPin size={18} /> Top Destinations Ranked by Popularity & Average Cost
              </h4>
              <p className={styles.chartCardSubtitle}>
                X-Axis: Destination / City Name • Y-Axis: Popularity Score (0 – 100★)
              </p>

              <div className={styles.chartBody}>
                {filteredDestinations.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={filteredDestinations.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const c = payload[0].payload;
                            return (
                              <div className={styles.customTooltip}>
                                <h5 className={styles.tooltipTitle}>{c.name}, {c.country}</h5>
                                <p><strong>Popularity Rating:</strong> ★ {c.popularity}/100</p>
                                <p><strong>Average Trip Cost:</strong> ₹{(c.avgTripCost || 15000).toLocaleString()}</p>
                                <p><strong>Cost Index:</strong> {c.costIndex || 3} / 5</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="popularity" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                        {filteredDestinations.slice(0, 12).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.noDataText}>No destinations match the selected rating and cost range.</p>
                )}
              </div>
            </Card>

            {/* Destination Cards Grid Below */}
            <div className={styles.destinationCardsGrid}>
              {filteredDestinations.slice(0, 8).map((city) => (
                <Card key={city._id} className={styles.cityCardMini}>
                  <div 
                    className={styles.cityCardImg} 
                    style={{ backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400'})` }}
                  />
                  <div className={styles.cityCardInfo}>
                    <h4 className={styles.cityNameText}>{city.name}</h4>
                    <p className={styles.citySubText}>{city.country} • {city.region || 'World'}</p>
                    <div className={styles.cityCardFooter}>
                      <span className={styles.cityRatingBadge}>★ {city.popularity || 85}/100</span>
                      <span className={styles.cityCostBadge}>Cost: {city.costIndex || 3}/5</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ TAB 3: RECOMMENDED ACTIVITIES (CITY SELECTION FILTER) ════════════════ */}
        {activeTab === 'activities' && (
          <div className={styles.tabContentBlock}>
            {/* Interactive City Selector Bar */}
            <Card className={styles.filterControlCard}>
              <div className={styles.filterBarHeader}>
                <div className={styles.filterBarTitle}>
                  <Building2 size={16} color="var(--color-primary)" />
                  <span>Choose City for Activity Graphical Representation</span>
                </div>
                <span className={styles.resultCountBadge}>
                  {filteredActivities.length} Activities {selectedActivityCity !== 'all' ? `in ${selectedActivityCity}` : 'Globally'}
                </span>
              </div>

              <div className={styles.citySelectorScrollList}>
                <button
                  className={`${styles.citySelectBtn} ${selectedActivityCity === 'all' ? styles.activeCitySelectBtn : ''}`}
                  onClick={() => setSelectedActivityCity('all')}
                >
                  <Globe size={14} /> <span>All Cities (Global)</span>
                </button>

                {availableActivityCities.map(city => (
                  <button
                    key={city}
                    className={`${styles.citySelectBtn} ${selectedActivityCity.toLowerCase() === city.toLowerCase() ? styles.activeCitySelectBtn : ''}`}
                    onClick={() => setSelectedActivityCity(city)}
                  >
                    <MapPin size={14} /> <span>{city}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* City-Specific Activity Category Distribution (If city selected) */}
            {selectedActivityCity !== 'all' && activityCategoryBreakdown.length > 0 && (
              <Card className={styles.chartCard}>
                <h4 className={styles.chartCardTitle}>
                  <PieIcon size={18} /> {selectedActivityCity} Activity Category Distribution
                </h4>
                <p className={styles.chartCardSubtitle}>
                  Proportion of sightseeing, culinary, cultural, and adventure experiences in {selectedActivityCity}
                </p>

                <div className={styles.pieContainer}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={activityCategoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {activityCategoryBreakdown.map((entry, index) => (
                          <Cell key={`act-cat-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className={styles.customTooltip}>
                                <h5 className={styles.tooltipTitle}>{d.name}</h5>
                                <p><strong>Available Activities:</strong> {d.count} Tours/Experiences</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className={styles.categoryLegendList}>
                    {activityCategoryBreakdown.map((cat, i) => (
                      <div key={i} className={styles.legendItem}>
                        <span className={styles.colorDot} style={{ backgroundColor: cat.color }}></span>
                        <span className={styles.legendName}>{cat.name}</span>
                        <span className={styles.legendAmount}>{cat.count} activities</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Graphical Representation of Activities in Selected City */}
            <Card className={styles.chartCard}>
              <h4 className={styles.chartCardTitle}>
                <Activity size={18} /> Top Rated Activities {selectedActivityCity !== 'all' ? `in ${selectedActivityCity}` : 'Across Global Cities'}
              </h4>
              <p className={styles.chartCardSubtitle}>
                Y-Axis: Activity Name • X-Axis: Star Rating Score (0 – 5.0★) & Estimated Cost in Hover
              </p>

              <div className={styles.chartBody}>
                {filteredActivities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={filteredActivities.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const act = payload[0].payload;
                            return (
                              <div className={styles.customTooltip}>
                                <h5 className={styles.tooltipTitle}>{act.name}</h5>
                                <p><strong>City:</strong> {act.city?.name || 'Destination'}, {act.city?.country || ''}</p>
                                <p><strong>Rating:</strong> ★ {act.rating} / 5.0</p>
                                <p><strong>Category:</strong> {act.category}</p>
                                <p><strong>Estimated Cost:</strong> ₹{act.estimatedCost || 0}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rating" fill="var(--color-accent)" radius={[0, 4, 4, 0]}>
                        {filteredActivities.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-act-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.noDataText}>No activities found for {selectedActivityCity}.</p>
                )}
              </div>
            </Card>

            {/* Activities Cards Grid Below */}
            <div className={styles.activitiesCardsGrid}>
              {filteredActivities.slice(0, 8).map((act) => (
                <Card key={act._id} className={styles.activityCardMini}>
                  <div className={styles.activityCardHeader}>
                    <h4 className={styles.actTitleText}>{act.name}</h4>
                    <span className={styles.actRatingStar}>★ {act.rating || 4.5}</span>
                  </div>
                  <p className={styles.actCityText}>
                    <MapPin size={13} /> {act.city?.name || 'Local Destination'}, {act.city?.country || ''}
                  </p>
                  <div className={styles.actCardFooter}>
                    <span className={styles.actCategoryBadge}>{act.category?.toUpperCase() || 'TOUR'}</span>
                    <span className={styles.actCostBadge}>Est. ₹{act.estimatedCost || 1200}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Screen 7: Preplanned Trips ── */}
        <section className={styles.tripsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Preplanned Trips</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/new')}>
              <Plus size={14} /> Plan New Trip
            </Button>
          </div>
          <div className={styles.tripsGrid}>
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map(trip => renderTripCard(trip))
            ) : (
              <p className={styles.emptyText}>No preplanned trips found.</p>
            )}
          </div>
        </section>

        {/* ── Screen 7: Previous Trips ── */}
        <section className={styles.tripsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Previous Trips</h3>
          </div>
          <div className={styles.tripsGrid}>
            {previousTrips.length > 0 ? (
              previousTrips.map(trip => renderTripCard(trip))
            ) : (
              <p className={styles.emptyText}>No previous completed trips found.</p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
