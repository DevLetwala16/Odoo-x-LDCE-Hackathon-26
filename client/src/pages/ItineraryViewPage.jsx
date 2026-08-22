import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, DollarSign, Edit, CalendarDays, Plus, Activity, Tag } from 'lucide-react';
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

  if (loading) return <PageShell><Loader text="Loading Itinerary..." /></PageShell>;
  if (!trip) return <PageShell><div className={styles.error}>Trip not found</div></PageShell>;

  const stops = trip.stops || [];

  return (
    <PageShell title="Itinerary View with Budget Section">
      <div className={styles.container}>
        {/* ── Screen 9: Title & Destination Banner ── */}
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <h1 className={styles.pageTitle}>Itinerary for a selected place: {trip.name}</h1>
            <div className={styles.tripMetaRow}>
              <span><CalendarIcon size={14} /> {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
              <span><DollarSign size={14} /> Allocated Budget: ₹{trip.totalBudget || 0}</span>
              <span><MapPin size={14} /> {stops.length} Stops</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${trip._id}/calendar`)}>
              <CalendarDays size={16} /> Calendar View
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate(`/trips/${trip._id}/edit`)}>
              <Edit size={16} /> Edit Itinerary
            </Button>
          </div>
        </div>

        {/* View Switcher: Itinerary Table vs Budget Breakdown */}
        <div className={styles.viewTabs}>
          <button 
            className={`${styles.viewTab} ${activeView === 'itinerary' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('itinerary')}
          >
            Physical Activities & Expenses
          </button>
          <button 
            className={`${styles.viewTab} ${activeView === 'budget' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('budget')}
          >
            Budget Breakdown & Charts
          </button>
        </div>

        {activeView === 'itinerary' ? (
          <div className={styles.itineraryTableContainer}>
            {/* ── Screen 9: Two-column Physical Activity vs Expense Table ── */}
            <div className={styles.tableHeader}>
              <div className={styles.headerCol}>Physical Activity</div>
              <div className={styles.headerCol}>Expense</div>
            </div>

            {stops.length > 0 ? (
              stops.map((stop, stopIndex) => (
                <div key={stop._id || stopIndex} className={styles.dayBlock}>
                  {/* Day Header */}
                  <div className={styles.dayTitleBar}>
                    <span className={styles.dayTag}>Day {stopIndex + 1} ({stop.city?.name || stop.title || 'Stop'})</span>
                    <span className={styles.dayDates}>
                      {new Date(stop.arrivalDate).toLocaleDateString()} – {new Date(stop.departureDate).toLocaleDateString()}
                    </span>
                    <span className={styles.sectionBudgetTag}>Section Budget: ₹{stop.sectionBudget || 0}</span>
                  </div>

                  {/* Activity and Expense Rows (Wireframe Screen 9) */}
                  <div className={styles.activityExpenseRows}>
                    {stop.activities && stop.activities.length > 0 ? (
                      stop.activities.map((activity, actIndex) => (
                        <div key={activity._id || actIndex} className={styles.activityExpensePair}>
                          {/* Physical Activity Box */}
                          <div className={styles.activityBox}>
                            <div className={styles.actTitleLine}>
                              <Activity size={16} className={styles.actIcon} />
                              <span className={styles.actName}>{activity.name}</span>
                            </div>
                            <p className={styles.actDesc}>
                              {activity.description || `${activity.category?.toUpperCase()} • Duration: ${activity.duration || 60} mins`}
                            </p>
                          </div>

                          {/* Expense Box */}
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
                          ₹{stop.sectionBudget || 0} (allocated)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Card className={styles.emptyCard}>
                <p>No itinerary sections or activities added yet.</p>
                <Button variant="accent" onClick={() => navigate(`/trips/${trip._id}/edit`)}>
                  + Add Itinerary Sections
                </Button>
              </Card>
            )}
          </div>
        ) : (
          /* ── Budget & Visual Analytics Section ── */
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
