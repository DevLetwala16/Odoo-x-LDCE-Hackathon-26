import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Trash2, 
  Shield, 
  Globe, 
  Clock, 
  Calendar, 
  Info, 
  Star,
  Search,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieIcon,
  Compass,
  UserCheck,
  RotateCcw,
  ArrowRight,
  Sparkles
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
} from 'recharts';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import styles from './AdminPanelPage.module.css';

const CHART_COLORS = ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB', '#E74C3C', '#1ABC9C'];

const AdminPanelPage = () => {
  const { user: currentAuthUser } = useAuth();
  const isAdmin = currentAuthUser?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(isAdmin ? 'all' : (currentAuthUser?._id || 'all'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // Default to rich analytics
  const [costInterval, setCostInterval] = useState('week'); // 'day' | 'week' | 'month' | 'year'
  const [hoveredCity, setHoveredCity] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [loginLogs, setLoginLogs] = useState([]);

  const fetchStatsForUser = async (targetUserId) => {
    try {
      setLoading(true);
      const promises = [
        adminService.getStats(isAdmin ? targetUserId : (currentAuthUser?._id || 'all')),
        adminService.getLoginLogs(),
      ];
      if (isAdmin) {
        promises.push(users.length === 0 ? adminService.getUsers() : Promise.resolve(users));
      }

      const [statsData, logsData, usersData] = await Promise.all(promises);
      setStats(statsData);
      setLoginLogs(logsData || []);
      if (isAdmin && usersData) {
        setUsers(usersData || []);
      }
    } catch (err) {
      toast.error('Failed to load personalized analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsForUser(selectedUserId);
  }, [selectedUserId]);

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    setActiveTab('analytics');
    const target = users.find(u => u._id === id);
    if (target) {
      toast.success(`Loaded personalized graph for ${target.firstName || target.username}`);
    } else {
      toast.success('Loaded platform analytics');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will remove all their trips and login data.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (selectedUserId === id) {
        setSelectedUserId('all');
      }
      toast.success(`User "${name}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(user._id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
      toast.success(`Updated ${user.firstName}'s role to ${newRole}`);
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  if (loading && !stats) return <PageShell title="Personal Admin & Analytics"><Loader text="Loading Your Intelligence Dashboard..." /></PageShell>;

  // Current Cost Trend Data based on interval (1 Day, Week Wise, Month Wise, Year Wise)
  const currentCostData = stats?.trends?.[costInterval] || [];

  // Category Breakdown Data
  const categoryData = stats?.categoryBreakdown || [];

  // Map Data
  const mapCities = stats?.mapData || [];

  // Filtered Users
  const filteredUsers = users.filter((u) => 
    `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const selectedUserObj = users.find(u => u._id === selectedUserId) || (!isAdmin ? currentAuthUser : null);

  // Tabs configured for Admin vs Regular User
  const navTabs = isAdmin ? [
    { key: 'users', label: 'Manage Users', icon: <Users size={16} /> },
    { key: 'popular-cities', label: 'Popular Cities', icon: <MapPin size={16} /> },
    { key: 'popular-activities', label: 'Popular Activities', icon: <Activity size={16} /> },
    { key: 'analytics', label: 'User Trends and Analytics', icon: <BarChart3 size={16} /> },
  ] : [
    { key: 'analytics', label: 'My Personal Trends & Graphs', icon: <BarChart3 size={16} /> },
    { key: 'popular-cities', label: 'Top Destinations & Cost Map', icon: <MapPin size={16} /> },
    { key: 'popular-activities', label: 'Recommended Activities', icon: <Activity size={16} /> },
  ];

  return (
    <PageShell title={isAdmin ? "GlobeTrotter Admin Portal" : "Personal Travel Intelligence Portal"}>
      <div className={styles.container}>
        {/* ── Top Header & FilterBar (Wireframe Screen 12) ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isAdmin ? "GlobeTrotter Admin Portal" : `Welcome, ${currentAuthUser?.firstName || currentAuthUser?.username}!`}
            </h1>
            <p className={styles.subtitle}>
              {isAdmin 
                ? "Real-time platform analytics, user management & travel intelligence"
                : "Your personal trip cost graphs, category spending breakdown, destination map & security audit"}
            </p>
          </div>
          
          {/* Admin User-Specific Switcher Dropdown */}
          {isAdmin ? (
            <div className={styles.userSelectorBox}>
              <label className={styles.userSelectorLabel}><UserCheck size={16} /> Filter Graph by Person:</label>
              <select 
                value={selectedUserId} 
                onChange={(e) => handleSelectUser(e.target.value)}
                className={styles.userDropdown}
              >
                <option value="all">📊 All Users (Platform-Wide)</option>
                {currentAuthUser && (
                  <option value={currentAuthUser._id}>
                    👤 Your Account ({currentAuthUser.firstName || currentAuthUser.username})
                  </option>
                )}
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    👤 {u.firstName} {u.lastName} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.userStatusBadge}>
              <Sparkles size={16} className={styles.sparkleIcon} />
              <span>Personal Intelligence Dashboard</span>
            </div>
          )}
        </div>

        {/* User-Specific Active Banner (When filtering as Admin) */}
        {isAdmin && selectedUserId !== 'all' && selectedUserObj && (
          <div className={styles.userActiveBanner}>
            <div className={styles.userBannerInfo}>
              <div className={styles.userBannerAvatar}>
                {selectedUserObj.firstName?.[0]}{selectedUserObj.lastName?.[0]}
              </div>
              <div>
                <h4 className={styles.userBannerName}>
                  Showing Personalized Analytics for: <strong>{selectedUserObj.firstName} {selectedUserObj.lastName}</strong> (@{selectedUserObj.username})
                </h4>
                <p className={styles.userBannerEmail}>Email: {selectedUserObj.email} • Role: {selectedUserObj.role?.toUpperCase()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSelectUser('all')} className={styles.resetBtn}>
              <RotateCcw size={14} /> Reset to All Users
            </Button>
          </div>
        )}

        {/* ── 4 Top Navigation Tabs (Wireframe Screen 12) ── */}
        <div className={styles.tabsRow}>
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Main Layout with Right-side Sidebar (Wireframe Screen 12) ── */}
        <div className={styles.layoutGrid}>
          {/* Main Dashboard Canvas */}
          <div className={styles.mainCanvas}>

            {/* ════════════════ TAB: USER TRENDS & ANALYTICS ════════════════ */}
            {activeTab === 'analytics' && (
              <div className={styles.tabContentArea}>
                {/* KPI Summary Cards */}
                <div className={styles.kpiGrid}>
                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(14, 124, 134, 0.1)' }}>
                      <Users size={22} color="var(--color-primary)" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>{!isAdmin || selectedUserId !== 'all' ? 'Account Profile' : 'Total Registered Users'}</p>
                      <h3 className={styles.kpiValue}>{!isAdmin || selectedUserId !== 'all' ? (selectedUserObj?.username || currentAuthUser?.username) : (stats?.totalUsers || 0)}</h3>
                    </div>
                  </Card>

                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(242, 112, 60, 0.1)' }}>
                      <Compass size={22} color="var(--color-accent)" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>{!isAdmin || selectedUserId !== 'all' ? 'Your Total Trips' : 'Total Trips Planned'}</p>
                      <h3 className={styles.kpiValue}>{stats?.totalTrips || 0}</h3>
                    </div>
                  </Card>

                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(47, 163, 107, 0.1)' }}>
                      <DollarSign size={22} color="var(--color-success)" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>{!isAdmin || selectedUserId !== 'all' ? 'Your Total Budget' : 'Total Platform Budget'}</p>
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

                {/* ── 1. Trip Cost Graphs: 1 Day, Week Wise, Month Wise, Year Wise ── */}
                <Card className={styles.chartCard}>
                  <div className={styles.chartHeaderRow}>
                    <div>
                      <h3 className={styles.chartTitle}>
                        <TrendingUp size={18} /> {!isAdmin ? "Your Trip Cost Trajectory & Spending Curve" : (selectedUserId !== 'all' ? `${selectedUserObj?.firstName}'s Trip Cost Curve` : 'Trip Cost Trends & Spending Volume')}
                      </h3>
                      <p className={styles.chartSubtitle}>
                        {!isAdmin 
                          ? "Real-time graphic representation of your trip costs across day, week, month, and year"
                          : (selectedUserId !== 'all' ? `Visual spending pattern across intervals for ${selectedUserObj?.firstName} ${selectedUserObj?.lastName}` : 'Real-time analysis of travel expenditures across time intervals')}
                      </p>
                    </div>

                    {/* Timeframe Selectors */}
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
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={currentCostData}>
                        <defs>
                          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Estimated Cost']}
                          labelFormatter={(label) => `Timeframe: ${label}`}
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="var(--color-primary)" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#costGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* ── 2. Category-wise Spending During Trips ── */}
                <div className={styles.twoColumnGrid}>
                  <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                      <PieIcon size={18} /> {!isAdmin ? "Your Category-Wise Spending Breakdown" : (selectedUserId !== 'all' ? `${selectedUserObj?.firstName}'s Category Spending` : 'Category-Wise Spending During Trips')}
                    </h3>
                    <p className={styles.chartSubtitle}>Distribution across accommodation, transport, dining, and activities</p>

                    <div className={styles.pieContainer}>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                            contentStyle={{
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Legend List */}
                      <div className={styles.categoryLegendList}>
                        {categoryData.map((cat, i) => (
                          <div key={i} className={styles.legendItem}>
                            <span className={styles.colorDot} style={{ backgroundColor: cat.color || CHART_COLORS[i] }}></span>
                            <span className={styles.legendName}>{cat.name}</span>
                            <span className={styles.legendAmount}>₹{cat.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* ── 3. Interactive Map with Cost on Hover ── */}
                  <Card className={styles.chartCard}>
                    <div className={styles.mapHeaderRow}>
                      <div>
                        <h3 className={styles.chartTitle}>
                          <Globe size={18} /> {!isAdmin ? "Your Destinations & Cost Map" : (selectedUserId !== 'all' ? `${selectedUserObj?.firstName}'s Destinations` : 'Destination Map with Cost on Hover')}
                        </h3>
                        <p className={styles.chartSubtitle}>Hover or tap on destinations to view average trip cost</p>
                      </div>
                    </div>

                    {/* Interactive World Map Canvas */}
                    <div className={styles.mapCanvas}>
                      <div className={styles.worldMapSvgWrapper}>
                        {/* Map Pins Grid */}
                        <div className={styles.mapPinsGrid}>
                          {mapCities.slice(0, 16).map((city) => (
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
                      </div>

                      {/* Hover Info Popover Card */}
                      {hoveredCity && (
                        <div className={styles.hoverCostPopover}>
                          <div 
                            className={styles.hoverCityImg} 
                            style={{ backgroundImage: `url(${hoveredCity.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` }}
                          />
                          <div className={styles.hoverCityDetails}>
                            <div className={styles.popoverHeader}>
                              <h4>{hoveredCity.name}, {hoveredCity.country}</h4>
                              <span className={styles.regionTag}>{hoveredCity.region}</span>
                            </div>
                            <p className={styles.popoverCost}>
                              Average Trip Cost: <strong>₹{hoveredCity.avgTripCost.toLocaleString()}</strong>
                            </p>
                            <div className={styles.popoverMeta}>
                              <span>★ Popularity: {hoveredCity.popularity}/100</span>
                              <span>Cost Index: {hoveredCity.costIndex}/5</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* ── 4. Recent Real-Time Login Logs from Login_data Collection ── */}
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    <Clock size={18} /> {!isAdmin ? "Your Recent Login History (`Login_data` Collection)" : (selectedUserId !== 'all' ? `${selectedUserObj?.firstName}'s Login Records` : 'Real-Time Login Audit Logs (`Login_data` Collection)')}
                  </h3>
                  <p className={styles.chartSubtitle}>Auditing user authentication activity, IP addresses, and timestamps</p>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>IP Address</th>
                          <th>Device / User-Agent</th>
                          <th>Timestamp</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginLogs.slice(0, 6).map((log) => (
                          <tr key={log._id}>
                            <td className={styles.boldText}>@{log.username}</td>
                            <td>{log.ipAddress || '127.0.0.1'}</td>
                            <td className={styles.userAgentCell}>{log.userAgent ? log.userAgent.substring(0, 40) + '...' : 'Browser Session'}</td>
                            <td>{new Date(log.loginTime || log.createdAt).toLocaleString()}</td>
                            <td>
                              {log.status === 'success' ? (
                                <span className={styles.successStatus}><CheckCircle size={14} /> Success</span>
                              ) : (
                                <span className={styles.failedStatus}><XCircle size={14} /> Failed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ════════════════ TAB: MANAGE USERS (ADMIN ONLY) ════════════════ */}
            {isAdmin && activeTab === 'users' && (
              <Card className={styles.tableCard}>
                <div className={styles.tableHeaderControls}>
                  <div>
                    <h3 className={styles.tableTitle}>Manage Users ({filteredUsers.length})</h3>
                    <p className={styles.tableSubtitle}>Manage account roles, inspect created itineraries, and view individual user graphs</p>
                  </div>
                  <div className={styles.searchUserWrap}>
                    <Search size={16} className={styles.searchIcon} />
                    <input 
                      type="text" 
                      placeholder="Search users by name, email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className={styles.userSearchInput}
                    />
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>City / Country</th>
                        <th>Trips Created</th>
                        <th>Role</th>
                        <th>Personal Graph</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className={selectedUserId === u._id ? styles.selectedTableRow : ''}>
                          <td className={styles.nameCell}>
                            <div className={styles.avatarCircle}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <span>{u.firstName} {u.lastName}</span>
                          </td>
                          <td>{u.email}</td>
                          <td>@{u.username}</td>
                          <td>{u.city || u.country ? `${u.city || ''}, ${u.country || ''}` : '—'}</td>
                          <td className={styles.boldText}>{u.tripCount || 0} trips</td>
                          <td>
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className={`${styles.roleSwitchBtn} ${u.role === 'admin' ? styles.adminActive : ''}`}
                              title="Click to toggle Admin / User role"
                            >
                              <Shield size={12} /> {u.role.toUpperCase()}
                            </button>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleSelectUser(u._id)}
                              className={styles.viewUserGraphBtn}
                              title="View individual graph and analytics for this person"
                            >
                              <TrendingUp size={14} /> View Graph <ArrowRight size={12} />
                            </button>
                          </td>
                          <td>
                            <button
                              className={styles.deleteUserBtn}
                              onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ════════════════ TAB: POPULAR CITIES ════════════════ */}
            {activeTab === 'popular-cities' && (
              <div className={styles.tabContentArea}>
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}><MapPin size={18} /> Top Destinations Ranked by Popularity</h3>
                  <div className={styles.chartBody}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stats?.topCities?.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                        <Bar dataKey="popularity" radius={[4, 4, 0, 0]}>
                          {stats?.topCities?.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className={styles.citiesCardsGrid}>
                  {stats?.topCities?.map((city) => (
                    <Card key={city._id} className={styles.cityRankCard}>
                      <div 
                        className={styles.cityCardImg} 
                        style={{ backgroundImage: `url(${city.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` }}
                      />
                      <div className={styles.cityCardBody}>
                        <h4>{city.name}</h4>
                        <p className={styles.cityCardCountry}>{city.country} • {city.region}</p>
                        <div className={styles.cityCardMeta}>
                          <span className={styles.popBadge}>★ {city.popularity}/100</span>
                          <span className={styles.costBadge}>Cost: {city.costIndex}/5</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ TAB: POPULAR ACTIVITIES ════════════════ */}
            {activeTab === 'popular-activities' && (
              <div className={styles.tabContentArea}>
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}><Activity size={18} /> Top Rated Activities Across Global Cities</h3>
                  <div className={styles.chartBody}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stats?.topActivities?.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                        <Bar dataKey="rating" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className={styles.activitiesListGrid}>
                  {stats?.topActivities?.map((act) => (
                    <Card key={act._id} className={styles.activityRankCard}>
                      <div className={styles.activityTopLine}>
                        <h4>{act.name}</h4>
                        <span className={styles.ratingBadge}>★ {act.rating}</span>
                      </div>
                      <p className={styles.activityCityLine}><MapPin size={13} /> {act.city?.name || 'Destination'}, {act.city?.country || ''}</p>
                      <div className={styles.activityFooterRow}>
                        <span className={styles.actCategoryTag}>{act.category}</span>
                        <span className={styles.actCostTag}>Est. ₹{act.estimatedCost || 0}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Right Sidebar Summary & Notes (Wireframe Screen 12) ── */}
          <div className={styles.sidebarPanel}>
            <Card className={styles.infoBoxCard}>
              <div className={styles.infoBoxHeader}>
                <Info size={20} className={styles.infoIcon} />
                <h3>{isAdmin ? "Admin Control Guide" : "Personal Travel Guide"}</h3>
              </div>

              <div className={styles.guideSections}>
                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Trip Cost Trajectory:</h4>
                  <p className={styles.guideText}>
                    Track your daily, weekly, monthly, and yearly travel costs and compare budget distributions in real time.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Category Spending:</h4>
                  <p className={styles.guideText}>
                    Instant breakdown of how much you spend across hotels, flights, dining, and sightseeing excursions.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Interactive Cost Map:</h4>
                  <p className={styles.guideText}>
                    Hover over destinations worldwide to check live average trip costs, popularity ratings, and budget indices.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Account Security & Logs:</h4>
                  <p className={styles.guideText}>
                    Real-time audit log of your recent login timestamps, IP addresses, and authenticated sessions.
                  </p>
                </div>
              </div>

              {/* Live Status Badge */}
              <div className={styles.serverStatusCard}>
                <div className={styles.statusRow}>
                  <span>Account Session</span>
                  <span className={styles.statusHighlight}>
                    @{currentAuthUser?.username || 'User'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span>Database</span>
                  <span className={styles.statusText}>`Globe_Trotter`</span>
                </div>
                <div className={styles.statusRow}>
                  <span>User Collection</span>
                  <span className={styles.statusText}>`Registrartion_users`</span>
                </div>
                <div className={styles.statusRow}>
                  <span>Login Audit</span>
                  <span className={styles.statusText}>`Login_data`</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminPanelPage;
