import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  User, 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Layers, 
  Sparkles,
  X
} from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import communityService from '../services/communityService';
import tripService from '../services/tripService';
import { useAuth } from '../hooks/useAuth';
import styles from './CommunityPage.module.css';

// Curated showcase journeys matching the Travelers' Circle reference
const SEED_COMMUNITY_JOURNEYS = [
  {
    _id: 'seed-1',
    title: 'European Grand Tour: Paris & Rome',
    content: 'Golden hour over the Seine and Eiffel Tower. Paris never fails to inspire. Exploring the ancient Colosseum at sunrise was simply magical! ✨🗼',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
    stopsCount: 2,
    cities: ['Paris', 'Rome'],
    region: 'europe',
    date: '2026-05-01',
    cost: '₹4,000',
    likes: 24,
    likedBy: [],
    user: {
      firstName: 'Alex',
      lastName: 'Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'New York, United States'
    },
    createdAt: '2026-08-22T10:19:00.000Z',
    comments: [
      {
        _id: 'c1',
        user: { firstName: 'Elena', lastName: 'Rov' },
        text: 'The best time to visit Eiffel Tower is definitely around sunset!',
        createdAt: '2026-08-22T11:00:00.000Z'
      }
    ]
  },
  {
    _id: 'seed-2',
    title: 'Tropical Odyssey: Bali & Singapore',
    content: 'Early morning mist over the Tegalalang Rice Terraces in Ubud. Pure tranquility! Singapore Gardens by the Bay light show at night was spectacular. 🌴✨',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    stopsCount: 2,
    cities: ['Bali', 'Singapore'],
    region: 'asia',
    date: '2026-06-18',
    cost: '₹2,700',
    likes: 19,
    likedBy: [],
    user: {
      firstName: 'Alex',
      lastName: 'Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'New York, United States'
    },
    createdAt: '2026-08-22T10:19:00.000Z',
    comments: []
  },
  {
    _id: 'seed-3',
    title: 'Ultimate Japan Expedition: Tokyo to Kyoto',
    content: 'Cannot wait for the sunrise hike up Mount Inari in Kyoto! ⛩️ #JapanTravel #GlobeTrotter. Tokyo nightlife and street food in Shinjuku are unmatched.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    stopsCount: 2,
    cities: ['Tokyo', 'Kyoto'],
    region: 'asia',
    date: '2026-10-10',
    cost: '₹3,200',
    likes: 38,
    likedBy: [],
    user: {
      firstName: 'Alex',
      lastName: 'Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'New York, United States'
    },
    createdAt: '2026-08-22T10:19:00.000Z',
    comments: [
      {
        _id: 'c2',
        user: { firstName: 'Kenji', lastName: 'Sato' },
        text: 'Make sure you grab a matcha ice cream near the Fushimi Inari shrine!',
        createdAt: '2026-08-22T12:30:00.000Z'
      }
    ]
  }
];

// Helper to get matching destination image based on country / city / title
const getPostCoverImage = (post) => {
  if (post.imageUrl && post.imageUrl.startsWith('http')) return post.imageUrl;
  const text = `${post.title || ''} ${post.content || ''} ${(post.tags || []).join(' ')} ${(post.cities || []).join(' ')}`.toLowerCase();
  if (text.includes('india') || text.includes('delhi') || text.includes('taj') || text.includes('jaipur') || text.includes('mumbai') || text.includes('goa') || text.includes('kerala') || text.includes('agra') || text.includes('ahmedabad')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('paris') || text.includes('france') || text.includes('eiffel')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('bali') || text.includes('indonesia') || text.includes('ubud')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('japan') || text.includes('tokyo') || text.includes('kyoto') || text.includes('osaka')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('rome') || text.includes('italy') || text.includes('venice') || text.includes('florence')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('london') || text.includes('uk') || text.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('swiss') || text.includes('switzerland') || text.includes('zurich') || text.includes('zermatt')) {
    return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('new york') || text.includes('nyc') || text.includes('america') || text.includes('usa')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('dubai') || text.includes('uae')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800';
  }
  if (text.includes('singapore')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800';
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800';
};

const getPostCities = (post) => {
  if (post.cities && post.cities.length > 0) return post.cities;
  if (post.tags && post.tags.length > 0) return post.tags;
  if (post.title) return [post.title];
  return ['Global Journey'];
};

const getAuthorLocation = (post) => {
  if (post.user?.location) return post.user.location;
  if (post.user?.city) return `${post.user.city}${post.user.country ? `, ${post.user.country}` : ''}`;
  if (post.user?.country) return post.user.country;
  return 'Global Explorer';
};

const getDisplayCost = (post) => {
  if (post.cost) return post.cost.startsWith('₹') || post.cost.startsWith('$') ? post.cost : `₹${post.cost}`;
  if (post.trip?.totalBudget) return `₹${post.trip.totalBudget}`;
  return 'Self-Planned';
};

const getStopsCount = (post) => {
  if (post.stopsCount) return post.stopsCount;
  if (post.cities && post.cities.length > 0) return post.cities.length;
  if (post.tags && post.tags.length > 0) return post.tags.length;
  return 1;
};

const CATEGORY_TABS = [
  { id: 'all', label: 'ALL POSTS' },
  { id: 'itineraries', label: 'FULL ITINERARIES' },
  { id: 'asia', label: 'ASIA & PACIFIC' },
  { id: 'europe', label: 'EUROPE' },
  { id: 'americas', label: 'AMERICAS' },
];

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // New Journey Post Form State
  const [newJourney, setNewJourney] = useState({
    title: '',
    content: '',
    cities: '',
    imageUrl: '',
    cost: '',
    region: 'europe',
    stopsCount: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  // Replies & comments state
  const [openReplies, setOpenReplies] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts({ limit: 50 });
      const dbPosts = res?.posts || res?.data?.posts || res || [];
      
      // Combine DB posts with rich showcase seed journeys
      const combined = [...dbPosts];
      SEED_COMMUNITY_JOURNEYS.forEach(seed => {
        if (!combined.some(p => p._id === seed._id || p.title === seed.title)) {
          combined.push(seed);
        }
      });
      setPosts(combined);
    } catch (err) {
      console.error('Fetch community error:', err);
      setPosts(SEED_COMMUNITY_JOURNEYS);
    } finally {
      setLoading(false);
    }
  };

  const handleShareJourneySubmit = async (e) => {
    e.preventDefault();
    if (!newJourney.title.trim() || !newJourney.content.trim()) {
      toast.error('Please fill in Journey Title and Story description');
      return;
    }

    setSubmitting(true);
    try {
      const cityList = newJourney.cities ? newJourney.cities.split(',').map(c => c.trim()).filter(Boolean) : [];
      const postPayload = {
        title: newJourney.title.trim(),
        content: newJourney.content.trim(),
        imageUrl: newJourney.imageUrl.trim() || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
        tags: cityList,
        region: newJourney.region,
        cost: newJourney.cost ? `₹${newJourney.cost}` : '₹3,500',
        stopsCount: Number(newJourney.stopsCount) || (cityList.length || 2),
      };

      const res = await communityService.createPost(postPayload);
      toast.success('Journey published to Travelers’ Circle!');
      setIsShareModalOpen(false);
      setNewJourney({
        title: '',
        content: '',
        cities: '',
        imageUrl: '',
        cost: '',
        region: 'europe',
        stopsCount: 2,
      });
      fetchCommunityData();
    } catch (err) {
      toast.error(err.message || 'Failed to share journey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const isSeed = postId.startsWith('seed-');
      if (isSeed) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const isNowLiked = !p.isLiked;
            return {
              ...p,
              likes: isNowLiked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 1) - 1),
              isLiked: isNowLiked
            };
          }
          return p;
        }));
        return;
      }

      const res = await communityService.likePost(postId);
      const updatedPost = res?.post || res?.data?.post || res;

      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const currentUserId = user?._id?.toString();
          const likedBy = updatedPost?.likedBy || p.likedBy || [];
          const isNowLiked = likedBy.some(id => (id._id || id).toString() === currentUserId);
          const likesCount = updatedPost?.likes !== undefined ? updatedPost.likes : (p.likes || 0) + 1;
          return {
            ...p,
            likes: likesCount,
            likedBy,
            isLiked: isNowLiked
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to update like');
    }
  };

  const handleToggleReplies = (postId) => {
    setOpenReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSendReply = async (postId) => {
    const text = replyTexts[postId];
    if (!text || !text.trim()) {
      toast.error('Please write a reply first');
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [postId]: true }));
    try {
      const isSeed = postId.startsWith('seed-');
      const newCommentObj = {
        _id: Date.now().toString(),
        user: { firstName: user?.firstName || 'Traveler', lastName: user?.lastName || '' },
        text: text.trim(),
        createdAt: new Date().toISOString()
      };

      if (!isSeed) {
        await communityService.addComment(postId, { text: text.trim() });
      }

      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newCommentObj]
          };
        }
        return p;
      }));

      setReplyTexts(prev => ({ ...prev, [postId]: '' }));
      toast.success('Reply added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add reply');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = (post) => {
    const shareText = `Check out "${post.title || post.content.slice(0, 40)}" on Travelers' Circle (Musafir)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${window.location.origin}/community`);
      toast.success('Journey link copied to clipboard!');
    } else {
      toast.success('Ready to share!');
    }
  };

  // Filtered posts based on Search and Category Tab
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        !searchQuery ||
        (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.user?.firstName && post.user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.cities && post.cities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));

      let matchesTab = true;
      if (activeTab === 'asia') {
        matchesTab = post.region === 'asia' || (post.cities && post.cities.some(c => ['tokyo', 'kyoto', 'bali', 'singapore', 'delhi', 'agra', 'jaipur', 'mumbai', 'bangkok'].includes(c.toLowerCase())));
      } else if (activeTab === 'europe') {
        matchesTab = post.region === 'europe' || (post.cities && post.cities.some(c => ['paris', 'rome', 'london', 'zurich', 'zermatt', 'reykjavik', 'amsterdam', 'barcelona'].includes(c.toLowerCase())));
      } else if (activeTab === 'americas') {
        matchesTab = post.region === 'americas' || (post.cities && post.cities.some(c => ['new york', 'los angeles', 'rio', 'toronto', 'cancun'].includes(c.toLowerCase())));
      } else if (activeTab === 'itineraries') {
        matchesTab = (post.stopsCount || 0) >= 2 || (post.cities && post.cities.length >= 2);
      }

      return matchesSearch && matchesTab;
    });
  }, [posts, searchQuery, activeTab]);

  return (
    <PageShell 
      sectionLabel="Musafir Community" 
      title="Travelers' Circle"
      subtitle="Explore public itineraries created by the Musafir global traveler community."
    >
      <div className={styles.container}>
        {/* ── Header Area matching Image schema ── */}
        <div className={styles.headerHeroRow}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.travelersCircleTitle}>Travelers' Circle</h1>
            <p className={styles.travelersCircleSubtitle}>
              Explore public itineraries created by the Musafir global community. Duplicate multi-city routes, get inspired, and share your own journeys.
            </p>
          </div>

          <button 
            className={styles.shareJourneyBtn}
            onClick={() => setIsShareModalOpen(true)}
          >
            <Plus size={18} /> Share a Journey
          </button>
        </div>

        {/* ── Search & Filter Pill Toolbar ── */}
        <div className={styles.toolbarRow}>
          <div className={styles.searchBoxWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search by city, country, trip title, or traveler..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filterPillsRow}>
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.filterPill} ${activeTab === tab.id ? styles.activeFilterPill : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3-Column Responsive Community Cards Grid ── */}
        {loading ? (
          <Loader text="Loading Travelers' Circle journeys..." />
        ) : (
          <div className={styles.cardsGrid}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => {
                const currentUserId = user?._id?.toString();
                const isLiked = post.isLiked || (post.likedBy && post.likedBy.some(id => (id._id || id).toString() === currentUserId));
                const likesCount = post.likes !== undefined ? post.likes : (post.likedBy?.length || 0);
                const commentsCount = post.comments?.length || 0;
                const isRepliesOpen = openReplies[post._id];
                const stopsCount = getStopsCount(post);
                const authorName = post.user ? `${post.user.firstName || 'Traveler'} ${post.user.lastName || ''}`.trim() : 'Alex Johnson';
                const authorLocation = getAuthorLocation(post);
                const postDateFormatted = post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '2026-08-22');
                const coverImgUrl = getPostCoverImage(post);
                const citiesList = getPostCities(post);
                const costString = getDisplayCost(post);

                return (
                  <Card key={post._id} className={styles.journeyCard}>
                    {/* Top Image Box with Overlays */}
                    <div className={styles.cardImageContainer}>
                      <img 
                        src={coverImgUrl} 
                        alt={post.title} 
                        className={styles.cardCoverImg}
                        loading="lazy"
                      />
                      <div className={styles.imageOverlayGradient} />

                      {/* Top-Left Stops Pill */}
                      <div className={styles.stopsPillBadge}>
                        <Layers size={12} /> {stopsCount} {stopsCount === 1 ? 'STOP' : 'STOPS'}
                      </div>

                      {/* Bottom Image Overlay: Author & Timestamp */}
                      <div className={styles.imageAuthorBar}>
                        <div className={styles.authorLeftBlock}>
                          <div className={styles.authorAvatar}>
                            <span>{authorName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={styles.authorTextColumn}>
                            <p className={styles.authorNameText}>{authorName}</p>
                            <p className={styles.authorLocationText}>{authorLocation}</p>
                          </div>
                        </div>
                        <span className={styles.postTimestampText}>
                          {new Date(post.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{post.title}</h3>
                      <p className={styles.cardDescription}>{post.content}</p>

                      {/* City Badges */}
                      <div className={styles.citiesTagsRow}>
                        {citiesList.map((city, cIdx) => (
                          <span key={cIdx} className={styles.cityTagPill}>
                            <MapPin size={11} /> {city}
                          </span>
                        ))}
                      </div>

                      {/* Date and Estimated Cost Row */}
                      <div className={styles.cardMetaFooterRow}>
                        <span className={styles.metaDate}>
                          <Calendar size={13} /> {postDateFormatted}
                        </span>
                        <span className={styles.metaCost}>
                          Est: {costString}
                        </span>
                      </div>

                      {/* Card Action Buttons (Like, Reply, Share) */}
                      <div className={styles.cardActionButtonsRow}>
                        <button 
                          className={`${styles.cardActionBtn} ${isLiked ? styles.cardLiked : ''}`}
                          onClick={() => handleLike(post._id)}
                          title="Like this journey"
                        >
                          <Heart size={15} fill={isLiked ? "#E11D48" : "none"} color={isLiked ? "#E11D48" : "currentColor"} />
                          <span>{likesCount} Likes</span>
                        </button>

                        <button 
                          className={`${styles.cardActionBtn} ${isRepliesOpen ? styles.cardActiveAction : ''}`}
                          onClick={() => handleToggleReplies(post._id)}
                          title="View & add comments"
                        >
                          <MessageCircle size={15} />
                          <span>{commentsCount > 0 ? `${commentsCount} Replies` : 'Reply'}</span>
                        </button>

                        <button 
                          className={styles.cardActionBtn}
                          onClick={() => handleShare(post)}
                          title="Share journey link"
                        >
                          <Share2 size={15} />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Collapsible Comments Section */}
                      {isRepliesOpen && (
                        <div className={styles.commentsSection}>
                          {post.comments && post.comments.length > 0 && (
                            <div className={styles.commentsList}>
                              {post.comments.map((cmt, idx) => (
                                <div key={cmt._id || idx} className={styles.commentItem}>
                                  <div className={styles.commentAvatar}>
                                    {cmt.user?.firstName?.charAt(0) || 'U'}
                                  </div>
                                  <div className={styles.commentBody}>
                                    <div className={styles.commentHeader}>
                                      <span className={styles.commentAuthor}>{cmt.user?.firstName || 'Traveler'} {cmt.user?.lastName || ''}</span>
                                      <span className={styles.commentDate}>{new Date(cmt.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={styles.commentText}>{cmt.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input Form */}
                          <div className={styles.commentInputRow}>
                            <input 
                              type="text" 
                              placeholder="Write a reply..."
                              value={replyTexts[post._id] || ''}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [post._id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendReply(post._id);
                                }
                              }}
                              className={styles.commentInput}
                            />
                            <button 
                              className={styles.commentSendBtn}
                              onClick={() => handleSendReply(post._id)}
                              disabled={submittingReply[post._id]}
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className={styles.emptyCard}>
                <Sparkles size={36} className={styles.emptyIcon} />
                <h3>No journeys found matching your search.</h3>
                <p>Try searching for a different destination or share your own journey!</p>
              </Card>
            )}
          </div>
        )}

        {/* ── Modal: Share a Journey ── */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share a Journey with Travelers' Circle"
        >
          <form onSubmit={handleShareJourneySubmit} className={styles.shareForm}>
            <Input 
              label="Journey Title *" 
              value={newJourney.title} 
              onChange={(e) => setNewJourney({ ...newJourney, title: e.target.value })} 
              placeholder="e.g. European Grand Tour: Paris & Rome" 
              required 
            />

            <div className={styles.formRow}>
              <Input 
                label="Cities Visited (comma separated) *" 
                value={newJourney.cities} 
                onChange={(e) => setNewJourney({ ...newJourney, cities: e.target.value })} 
                placeholder="e.g. Paris, Rome, Venice" 
                required 
              />
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Region</label>
                <select 
                  value={newJourney.region} 
                  onChange={(e) => setNewJourney({ ...newJourney, region: e.target.value })}
                  className={styles.selectInput}
                >
                  <option value="europe">Europe</option>
                  <option value="asia">Asia & Pacific</option>
                  <option value="americas">Americas</option>
                  <option value="africa">Africa & Middle East</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <Input 
                type="number"
                label="Estimated Cost (₹)" 
                value={newJourney.cost} 
                onChange={(e) => setNewJourney({ ...newJourney, cost: e.target.value })} 
                placeholder="e.g. 4000" 
              />
              <Input 
                type="number"
                label="Number of Stops" 
                value={newJourney.stopsCount} 
                onChange={(e) => setNewJourney({ ...newJourney, stopsCount: e.target.value })} 
                placeholder="2" 
              />
            </div>

            <Input 
              label="Cover Image URL (Optional)" 
              value={newJourney.imageUrl} 
              onChange={(e) => setNewJourney({ ...newJourney, imageUrl: e.target.value })} 
              placeholder="https://images.unsplash.com/..." 
            />

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Your Travel Story & Highlights *</label>
              <textarea 
                value={newJourney.content} 
                onChange={(e) => setNewJourney({ ...newJourney, content: e.target.value })} 
                className={styles.textareaInput}
                placeholder="Share your favorite spots, timings, local food, and tips for fellow travelers..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" type="button" onClick={() => setIsShareModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Journey'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageShell>
  );
};

export default CommunityPage;
