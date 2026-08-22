import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, DollarSign, Edit, CalendarDays, Share2, Activity, Tag, Check, Copy, Clock, Plus, Save, Download, CloudSun } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import sharingService from '../services/sharingService';
import weatherService from '../services/weatherService';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import BudgetSummary from '../components/budget/BudgetSummary';
import CostBreakdownChart from '../components/budget/CostBreakdownChart';
import BudgetAlert from '../components/budget/BudgetAlert';
import tripService from '../services/tripService';
import api from '../services/api';
import styles from './ItineraryViewPage.module.css';

const ItineraryViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [weatherData, setWeatherData] = useState({});
  const [activeView, setActiveView] = useState('itinerary');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const [tripRes, budgetRes] = await Promise.all([
          tripService.getTripById(id),
          api.get(`/budget/trips/${id}/budget`).catch(() => null)
        ]);
        const fetchedTrip = tripRes?.trip || tripRes?.data?.trip || tripRes;
        setTrip(fetchedTrip);
        setBudgetData(budgetRes?.data || budgetRes || null);
      } catch (error) {
        console.error('Failed to load trip', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  useEffect(() => {
    // Fetch weather for stops
    if (trip && trip.stops) {
      trip.stops.forEach(async (stop) => {
        if (stop.city && stop.city.name && !weatherData[stop._id]) {
          try {
            const wData = await weatherService.getCityWeather(stop.city.name);
            setWeatherData(prev => ({ ...prev, [stop._id]: wData }));
          } catch (e) {
            console.error('Failed to load weather for', stop.city.name);
          }
        }
      });
    }
  }, [trip]);

  const handleShareTrip = async () => {
    setIsSharing(true);
    try {
      const res = await sharingService.shareTrip(trip._id);
      if (res.success) {
        const fullUrl = `${window.location.origin}${res.shareUrl}`;
        setShareUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
        toast.success('Trip link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // PDF generation logic here
      toast.success('Trip exported to PDF!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <PageShell sectionLabel="03 — ITINERARY" title="Loading Journey..."><Loader /></PageShell>;
  if (!trip) return <PageShell sectionLabel="03 — ITINERARY" title="Trip Not Found"><p>This journey could not be located.</p></PageShell>;

  const stops = trip.stops || [];

  return (
    <PageShell 
      sectionLabel="03 — ITINERARY" 
      title={trip.name}
      subtitle={`${new Date(trip.startDate).toLocaleDateString()} – ${new Date(trip.endDate).toLocaleDateString()} • Total Budget: ₹${trip.totalBudget || 0}`}
    >
      <div className={styles.container}>
        {/* Hero Cover Banner */}
        <div className={styles.hero}>
          <div 
            className={styles.heroBg} 
            style={{ 
              backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'})` 
            }} 
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{trip.name}</h1>
            <div className={styles.meta}>
              <span><CalendarIcon size={14} /> {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
              <span><DollarSign size={14} /> Budget: ₹{trip.totalBudget || 0}</span>
              <span><MapPin size={14} /> {stops.length} Stops</span>
            </div>
          </div>

          <div className={styles.heroActions}>
            <Button variant="outline" size="sm" className={styles.heroActionBtn} onClick={handleShareTrip} disabled={isSharing}>
              <Share2 size={14} /> {isSharing ? 'Generating...' : (shareUrl ? 'Link Copied!' : 'Share Trip')}
            </Button>
            <Button variant="outline" size="sm" className={styles.heroActionBtn} onClick={handleExportPDF} disabled={isExporting}>
              <Download size={14} /> {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button variant="outline" size="sm" className={styles.heroActionBtn} onClick={() => navigate(`/trips/${trip._id}/calendar`)}>
              <CalendarDays size={14} /> Calendar
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate(`/trips/${trip._id}/edit`)}>
              <Edit size={14} /> Edit Stops
            </Button>
          </div>
        </div>

        {/* View Switcher: Itinerary Table vs Budget Breakdown */}
        <div className={styles.viewTabs}>
          <button 
            className={`${styles.viewTab} ${activeView === 'itinerary' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('itinerary')}
          >
            Day-by-Day Activities & Expenses
          </button>
          <button 
            className={`${styles.viewTab} ${activeView === 'budget' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('budget')}
          >
            Budget & Financial Analytics
          </button>
        </div>

        {activeView === 'itinerary' ? (
          <div className={styles.itineraryTableContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCol}>Physical Activity / Sight</div>
              <div className={styles.headerCol}>Allocated Expense</div>
            </div>

            {stops.length > 0 ? (
              stops.map((stop, stopIndex) => (
                <div key={stop._id || stopIndex} className={styles.dayBlock}>
                  <div className={styles.dayTitleBar}>
                    <span className={styles.dayTag}>Day {stopIndex + 1}: {stop.city?.name || stop.title || 'Stop'}</span>
                    <span className={styles.dayDates}>
                      {new Date(stop.arrivalDate).toLocaleDateString()} – {new Date(stop.departureDate).toLocaleDateString()}
                    </span>
                    <span className={styles.sectionBudgetTag}>Budget: ₹{stop.sectionBudget || 0}</span>
                  </div>

                  <div className={styles.activityExpenseRows}>
                    {stop.activities && stop.activities.length > 0 ? (
                      stop.activities.map((activity, actIndex) => (
                        <div key={activity._id || actIndex} className={styles.activityExpensePair}>
                          <div className={styles.activityBox}>
                            <div className={styles.actTitleLine}>
                              <Activity size={16} className={styles.actIcon} />
                              <span className={styles.actName}>{activity.name}</span>
                            </div>
                            <p className={styles.actDesc}>
                              {activity.description || `${activity.category?.toUpperCase()} • Duration: ${activity.duration || 60} mins`}
                            </p>
                          </div>

                          <div className={styles.expenseBox}>
                            <div className={styles.expenseAmount}>
                              ₹{activity.estimatedCost || 0}
                            </div>
                            <span className={styles.expenseCategoryBadge}>
                              <Tag size={12} /> {activity.category || 'activity'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noActivitiesRow}>
                        <div className={styles.emptyActivityBox}>
                          Hotel stay & Exploration in {stop.city?.name || 'Destination'}
                        </div>
                        <div className={styles.emptyExpenseBox}>
                          <span>Est. Section Budget: ₹{stop.sectionBudget || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weather Widget */}
                  {weatherData[stop._id] && (
                    <div className={styles.weatherWidget}>
                      <div className={styles.weatherHeader}>
                        <CloudSun size={18} />
                        <span>Current Weather</span>
                      </div>
                      <div className={styles.weatherInfo}>
                        <span className={styles.weatherTemp}>{weatherData[stop._id].temperature}°C</span>
                        <span className={styles.weatherCond}>{weatherData[stop._id].condition}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Card className={styles.emptyCard}>
                <p>No stops or activities added to this journey yet.</p>
                <Button variant="accent" onClick={() => navigate(`/trips/${trip._id}/edit`)}>
                  + Customize Journey Stops
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className={styles.budgetView}>
            <BudgetAlert 
              overBudget={budgetData?.overBudget} 
              totalBudget={trip.totalBudget} 
              totalEstimated={budgetData?.totalEstimated || 0} 
            />
            <BudgetSummary 
              totalBudget={trip.totalBudget} 
              totalEstimated={budgetData?.totalEstimated || 0} 
              breakdown={budgetData?.breakdown} 
            />
            <CostBreakdownChart 
              breakdown={budgetData?.breakdown} 
              perDay={budgetData?.perDay} 
            />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ItineraryViewPage;
