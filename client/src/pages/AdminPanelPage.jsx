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
  Search, 
  BarChart3, 
  PieChart as PieIcon, 
  Compass, 
  UserCheck, 
  RotateCcw, 
  ArrowRight,
  Flame,
  Layers 
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

const AdminPanelPage = () => {
  const { user: currentAuthUser } = useAuth();
  const isAdmin = currentAuthUser?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [costInterval, setCostInterval] = useState('week'); // 'day' | 'week' | 'month' | 'year'
  const [hoveredCity, setHoveredCity] = useState(null);
  const [searchUser, setSearchUser] = useState('');

  const fetchStatsForUser = async (targetUserId) => {
    try {
      setLoading(true);
      const promises = [
        adminService.getStats(targetUserId),
      ];
      if (isAdmin) {
        promises.push(users.length === 0 ? adminService.getUsers() : Promise.resolve(users));
      }

      const [statsData, usersData] = await Promise.all(promises);
      setStats(statsData);
      if (isAdmin && usersData) {
        setUsers(usersData || []);
      }
    } catch (err) {
      toast.error('Failed to load analytics');
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
      toast.success(`Loaded analytics for ${target.firstName || target.username}`);
    } else {
      toast.success('Loaded platform analytics');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will remove all their trips.`)) return;
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

  if (loading && !stats) return <PageShell title="Admin Portal"><Loader text="Loading Analytics..." /></PageShell>;

  const currentCostData = stats?.trends?.[costInterval] || [];
  const categoryData = stats?.categoryBreakdown || [];
  const mapCities = stats?.mapData || [];
  const budgetComparisonData = stats?.tripBudgetComparison || [];
  const dailyBurnRateData = stats?.dailyBurnRateData || [];
  const stopBudgetBreakdown = stats?.stopBudgetBreakdown || [];

  const filteredUsers = users.filter((u) => 
    `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const selectedUserObj = users.find(u => u._id === selectedUserId);

  const navTabs = [
    { key: 'analytics', label: 'Trends and Analytics', icon: <BarChart3 size={16} /> },
    { key: 'popular-cities', label: 'Popular Cities', icon: <MapPin size={16} /> },
    { key: 'popular-activities', label: 'Popular Activities', icon: <Activity size={16} /> },
    ...(isAdmin ? [{ key: 'users', label: 'Manage Users', icon: <Users size={16} /> }] : []),
  ];

  return (
    <PageShell sectionLabel="Screen 12" title="Admin & Intelligence Portal">
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isAdmin ? "GlobeTrotter Admin Portal" : "Travel Intelligence Portal"}
            </h1>
            <p className={styles.subtitle}>
              Real database analytics, destination cost trends, and travel expenditures
            </p>
          </div>
          
          {/* User Filter Dropdown for Admins */}
          {isAdmin && (
            <div className={styles.userSelectorBox}>
              <label className={styles.userSelectorLabel}><UserCheck size={16} /> Filter Graph by Person:</label>
              <select 
                value={selectedUserId} 
                onChange={(e) => handleSelectUser(e.target.value)}
                className={styles.userDropdown}
              >
                <option value="all">📊 All Users (Platform-Wide)</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    👤 {u.firstName} {u.lastName} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* User-Specific Active Banner */}
        {selectedUserId !== 'all' && selectedUserObj && (
          <div className={styles.userActiveBanner}>
            <div className={styles.userBannerInfo}>
              <div className={styles.userBannerAvatar}>
                {selectedUserObj.firstName?.[0]}{selectedUserObj.lastName?.[0]}
              </div>
              <div>
                <h4 className={styles.userBannerName}>
                  Showing Real Analytics for: <strong>{selectedUserObj.firstName} {selectedUserObj.lastName}</strong> (@{selectedUserObj.username})
                </h4>
                <p className={styles.userBannerEmail}>Email: {selectedUserObj.email} • Role: {selectedUserObj.role?.toUpperCase()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSelectUser('all')} className={styles.resetBtn}>
              <RotateCcw size={14} /> Reset to All Users
            </Button>
          </div>
        )}

        {/* ── Navigation Tabs ── */}
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

        {/* ── Main Dashboard Content ── */}
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
                    <p className={styles.kpiLabel}>{selectedUserId !== 'all' ? 'Filtered Account' : 'Total Registered Users'}</p>
                    <h3 className={styles.kpiValue}>{selectedUserId !== 'all' ? selectedUserObj?.username : (stats?.totalUsers || 0)}</h3>
                  </div>
                </Card>

                <Card className={styles.kpiCard}>
                  <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(242, 112, 60, 0.1)' }}>
                    <Compass size={22} color="var(--color-accent)" />
                  </div>
                  <div>
                    <p className={styles.kpiLabel}>{selectedUserId !== 'all' ? 'User Trips' : 'Total Trips Created'}</p>
                    <h3 className={styles.kpiValue}>{stats?.totalTrips || 0}</h3>
                  </div>
                </Card>

                <Card className={styles.kpiCard}>
                  <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(47, 163, 107, 0.1)' }}>
                    <DollarSign size={22} color="var(--color-success)" />
                  </div>
                  <div>
                    <p className={styles.kpiLabel}>Total Budget Allocated</p>
                    <h3 className={styles.kpiValue}>₹{(stats?.totalPlatformBudget || 0).toLocaleString()}</h3>
                  </div>
                </Card>

                <Card className={styles.kpiCard}>
                  <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(142, 68, 173, 0.1)' }}>
                    <Globe size={22} color="#8E44AD" />
                  </div>
                  <div>
                    <p className={styles.kpiLabel}>Avg Cost per Trip</p>
                    <h3 className={styles.kpiValue}>₹{(stats?.avgTripBudget || 0).toLocaleString()}</h3>
                  </div>
                </Card>
              </div>

              {/* 1. Trip Cost Trajectory (1-Day, Week, Month, Year) */}
              <Card className={styles.chartCard}>
                <div className={styles.chartHeaderRow}>
                  <div>
                    <h3 className={styles.chartTitle}>
                      <TrendingUp size={18} /> 1. Trip Cost Trajectory (1 Day, Week, Month, Year)
                    </h3>
                    <p className={styles.chartSubtitle}>
                      Real expenditure curves computed directly from database records
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
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={currentCostData}>
                        <defs>
                          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Cost / Expense']}
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="var(--color-primary)" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#costGrad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.noDataState}>No expense data recorded for this interval.</div>
                  )}
                </div>
              </Card>

              {/* 2 & 3. Category Donut & Interactive Map Grid */}
              <div className={styles.twoColumnGrid}>
                {/* 2. Category Spending Donut */}
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}><PieIcon size={18} /> 2. Category Spending Breakdown</h3>
                  <p className={styles.chartSubtitle}>Expenses across accommodation, transport, dining & activities</p>

                  <div className={styles.pieContainer}>
                    {categoryData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Allocated']}
                              contentStyle={{
                                backgroundColor: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
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
                      <div className={styles.noDataState}>No categories logged yet.</div>
                    )}
                  </div>
                </Card>

                {/* 3. Interactive Map with Hover Cost Details */}
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}><Globe size={18} /> 3. Interactive Destination Map & Cost</h3>
                  <p className={styles.chartSubtitle}>Hover over cities to view live average cost and popularity</p>

                  <div className={styles.mapCanvasWrapper}>
                    <div className={styles.worldMapGrid}>
                      {mapCities.slice(0, 18).map((city, idx) => (
                        <div 
                          key={city._id || idx}
                          className={styles.mapNode}
                          onMouseEnter={() => setHoveredCity(city)}
                          onClick={() => setHoveredCity(city)}
                        >
                          <div className={styles.nodePoint} />
                          <span className={styles.nodeLabel}>{city.name}</span>
                          <span className={styles.nodeCostBadge}>₹{(city.avgTripCost/1000).toFixed(0)}k</span>
                        </div>
                      ))}
                    </div>

                    {hoveredCity && (
                      <div className={styles.hoverCostPopover}>
                        <div 
                          className={styles.hoverCityImg} 
                          style={{ backgroundImage: `url(${hoveredCity.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300'})` }}
                        />
                        <div className={styles.hoverCityDetails}>
                          <h4>{hoveredCity.name}, {hoveredCity.country}</h4>
                          <p className={styles.popoverCost}>
                            Average Cost: <strong>₹{hoveredCity.avgTripCost.toLocaleString()}</strong>
                          </p>
                          <span className={styles.popoverRating}>★ Popularity: {hoveredCity.popularity}/100</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* 4. Planned Budget vs Actual Spend Comparison */}
              <Card className={styles.chartCard}>
                <h3 className={styles.chartTitle}><BarChart3 size={18} /> 4. Trip Budget vs Actual Spend Comparison</h3>
                <p className={styles.chartSubtitle}>Compare planned trip budget with real expenses logged</p>

                <div className={styles.chartBody}>
                  {budgetComparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={budgetComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value, name) => [
                            `₹${Number(value).toLocaleString()}`,
                            name === 'allocatedBudget' ? 'Planned Budget' : 'Actual Spent'
                          ]}
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                        <Legend formatter={(v) => v === 'allocatedBudget' ? 'Planned Budget (₹)' : 'Actual Spent (₹)'} />
                        <Bar dataKey="allocatedBudget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actualExpense" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.noDataState}>No comparison data available yet.</div>
                  )}
                </div>
              </Card>

              {/* 5 & 6. Additional Useful Graphs: Daily Burn Rate & Stop Budget Breakdown */}
              <div className={styles.twoColumnGrid}>
                {/* 5. Daily Burn Rate */}
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    <Flame size={18} color="var(--color-accent)" /> 5. Daily Burn Rate (₹ / Day by Journey)
                  </h3>
                  <p className={styles.chartSubtitle}>Estimated daily expense rate calculated from trip duration</p>

                  <div className={styles.chartBody}>
                    {dailyBurnRateData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={dailyBurnRateData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip
                            formatter={(value, name, item) => [
                              `₹${Number(value).toLocaleString()}/day (${item.payload.durationDays} days total)`,
                              'Daily Rate'
                            ]}
                            contentStyle={{
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                            }}
                          />
                          <Bar dataKey="dailyRate" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className={styles.noDataState}>No trip burn rate data available.</div>
                    )}
                  </div>
                </Card>

                {/* 6. Stop-by-Stop Section Budget Allocation */}
                <Card className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    <Layers size={18} color="var(--color-primary)" /> 6. Stop-by-Stop Budget Allocation
                  </h3>
                  <p className={styles.chartSubtitle}>How total budget is partitioned across individual cities & stops</p>

                  <div className={styles.chartBody}>
                    {stopBudgetBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stopBudgetBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                          <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                          <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Stop Budget']}
                            contentStyle={{
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                            }}
                          />
                          <Bar dataKey="budget" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className={styles.noDataState}>No stop budget data available.</div>
                    )}
                  </div>
                </Card>
              </div>

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
                      <Bar dataKey="popularity" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* ════════════════ TAB: POPULAR ACTIVITIES ════════════════ */}
          {activeTab === 'popular-activities' && (
            <div className={styles.tabContentArea}>
              <Card className={styles.chartCard}>
                <h3 className={styles.chartTitle}><Activity size={18} /> Highest Rated Activities</h3>
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
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
};

export default AdminPanelPage;
