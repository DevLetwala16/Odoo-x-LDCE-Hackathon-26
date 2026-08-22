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
  Compass
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
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import styles from './AdminPanelPage.module.css';

const CHART_COLORS = ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB', '#E74C3C', '#1ABC9C'];

const AdminPanelPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // Default to rich analytics
  const [costInterval, setCostInterval] = useState('week'); // 'day' | 'week' | 'month' | 'year'
  const [hoveredCity, setHoveredCity] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [loginLogs, setLoginLogs] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData, logsData] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getLoginLogs(),
        ]);
        setStats(statsData);
        setUsers(usersData || []);
        setLoginLogs(logsData || []);
      } catch (err) {
        toast.error('Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will remove all their trips and login data.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
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

  if (loading) return <PageShell title="Admin Panel"><Loader text="Loading Admin Intelligence Hub..." /></PageShell>;

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

  return (
    <PageShell title="Admin Panel">
      <div className={styles.container}>
        {/* ── Top Header & FilterBar (Wireframe Screen 12) ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>GlobeTrotter Admin Portal</h1>
            <p className={styles.subtitle}>Real-time graphical analytics, cost breakdown & system management</p>
          </div>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span> Live System Feed
          </div>
        </div>

        {/* ── 4 Top Navigation Tabs (Wireframe Screen 12) ── */}
        <div className={styles.tabsRow}>
          {[
            { key: 'users', label: 'Manage Users', icon: <Users size={16} /> },
            { key: 'popular-cities', label: 'Popular Cities', icon: <MapPin size={16} /> },
            { key: 'popular-activities', label: 'Popular Activities', icon: <Activity size={16} /> },
            { key: 'analytics', label: 'User Trends and Analytics', icon: <BarChart3 size={16} /> },
          ].map((tab) => (
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
                      <p className={styles.kpiLabel}>Total Registered Users</p>
                      <h3 className={styles.kpiValue}>{stats?.totalUsers || 0}</h3>
                    </div>
                  </Card>

                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(242, 112, 60, 0.1)' }}>
                      <Compass size={22} color="var(--color-accent)" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>Total Trips Planned</p>
                      <h3 className={styles.kpiValue}>{stats?.totalTrips || 0}</h3>
                    </div>
                  </Card>

                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(47, 163, 107, 0.1)' }}>
                      <DollarSign size={22} color="var(--color-success)" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>Total Platform Budget</p>
                      <h3 className={styles.kpiValue}>₹{(stats?.totalPlatformBudget || 0).toLocaleString()}</h3>
                    </div>
                  </Card>

                  <Card className={styles.kpiCard}>
                    <div className={styles.kpiIconWrap} style={{ backgroundColor: 'rgba(142, 68, 173, 0.1)' }}>
                      <TrendingUp size={22} color="#8E44AD" />
                    </div>
                    <div>
                      <p className={styles.kpiLabel}>Average Trip Cost</p>
                      <h3 className={styles.kpiValue}>₹{(stats?.avgTripBudget || 0).toLocaleString()}</h3>
                    </div>
                  </Card>
                </div>

                {/* ── 1. Trip Cost Graphs: 1 Day, Week Wise, Month Wise, Year Wise ── */}
                <Card className={styles.chartCard}>
                  <div className={styles.chartHeaderRow}>
                    <div>
                      <h3 className={styles.chartTitle}>
                        <TrendingUp size={18} /> Trip Cost Trends & Spending Volume
                      </h3>
                      <p className={styles.chartSubtitle}>Real-time analysis of travel expenditures across time intervals</p>
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
                      <PieIcon size={18} /> Category-Wise Spending During Trips
                    </h3>
                    <p className={styles.chartSubtitle}>Distribution across accommodation, flights, dining, and activities</p>

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
                          <Globe size={18} /> Destination Map with Cost on Hover
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
                    <Clock size={18} /> Real-Time Login Audit Logs (`Login_data` Collection)
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

            {/* ════════════════ TAB: MANAGE USERS ════════════════ */}
            {activeTab === 'users' && (
              <Card className={styles.tableCard}>
                <div className={styles.tableHeaderControls}>
                  <div>
                    <h3 className={styles.tableTitle}>Manage Users ({filteredUsers.length})</h3>
                    <p className={styles.tableSubtitle}>Manage account roles, permissions, and created itineraries</p>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id}>
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
                <h3>Admin Control Guide</h3>
              </div>

              <div className={styles.guideSections}>
                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Manage User Section:</h4>
                  <p className={styles.guideText}>
                    This Section is responsible for managing users and their actions. Allows admins to promote roles, inspect created itineraries, and remove accounts.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Popular Cities:</h4>
                  <p className={styles.guideText}>
                    Lists all the popular cities where users are visiting based on current travel trends and search patterns.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>Popular Activities:</h4>
                  <p className={styles.guideText}>
                    List all the popular activities that users are doing based on current user trend and rating data.
                  </p>
                </div>

                <div className={styles.guideItem}>
                  <h4 className={styles.guideTitle}>User Trends and Analytics:</h4>
                  <p className={styles.guideText}>
                    Major focus on providing analysis across various points (1-day, week-wise, month-wise, year-wise trip costs and category budgets) to give actionable insights.
                  </p>
                </div>
              </div>

              {/* Live Status Badge */}
              <div className={styles.serverStatusCard}>
                <div className={styles.statusRow}>
                  <span>MongoDB Atlas</span>
                  <span className={styles.statusOnline}>● Connected</span>
                </div>
                <div className={styles.statusRow}>
                  <span>Active Database</span>
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
