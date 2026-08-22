import React, { useState, useEffect } from 'react';
import { Users, MapPin, Activity, TrendingUp, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import styles from './AdminPanelPage.module.css';

const CHART_COLORS = ['#2C2418', '#B36B3F', '#3D7C3F', '#7A7165', '#9A5A33', '#1A150E', '#B93B2B', '#E5E1DA'];

const AdminPanelPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
        ]);
        setStats(statsRes);
        setUsers(usersRes);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will remove all their data.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  if (loading) return <PageShell sectionLabel="06 — ADMIN" title="Platform administration"><Loader /></PageShell>;

  const cityChartData = stats?.topCities?.slice(0, 8).map((c) => ({
    name: c.name,
    popularity: c.popularity,
  })) || [];

  const activityChartData = stats?.topActivities?.slice(0, 6).map((a) => ({
    name: a.name.length > 20 ? a.name.substring(0, 20) + '…' : a.name,
    rating: a.rating,
  })) || [];

  const trendData = stats?.userTrends || [];

  return (
    <PageShell 
      sectionLabel="06 — ADMIN" 
      title="Platform administration"
      subtitle="Overview of registered users, itinerary activity, and regional data."
    >
      <div className={styles.container}>
        {/* Tab Navigation */}
        <div className={styles.tabs}>
          {['overview', 'users', 'analytics'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Total Users</p>
                  <p className={styles.statNumber}>{stats?.totalUsers || 0}</p>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Total Trips</p>
                  <p className={styles.statNumber}>{stats?.totalTrips || 0}</p>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Community Posts</p>
                  <p className={styles.statNumber}>{stats?.totalPosts || 0}</p>
                </div>
              </Card>
            </div>

            {/* Popular Cities Chart */}
            <Card className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <MapPin size={18} /> Popular Cities
              </h3>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityChartData}>
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
                      {cityChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Popular Activities Chart */}
            <Card className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <Activity size={18} /> Top Rated Activities
              </h3>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
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
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className={styles.tableCard}>
            <h3 className={styles.tableTitle}>Manage Users ({users.length})</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>City</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className={styles.nameCell}>
                        <div className={styles.userAvatar}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.firstName} />
                          ) : (
                            <span>{u.firstName?.[0]}{u.lastName?.[0]}</span>
                          )}
                        </div>
                        {u.firstName} {u.lastName}
                      </td>
                      <td>{u.email}</td>
                      <td>@{u.username}</td>
                      <td>{u.city || '—'}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.adminBadge : ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              <TrendingUp size={18} /> Trips Created (Last 30 Days)
            </h3>
            <div className={styles.chartWrapper}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="_id"
                      tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                    <Tooltip
                      labelFormatter={(d) => `Date: ${d}`}
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <Bar dataKey="count" fill="var(--color-ink)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.noData}>No trip data available for the last 30 days.</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default AdminPanelPage;
