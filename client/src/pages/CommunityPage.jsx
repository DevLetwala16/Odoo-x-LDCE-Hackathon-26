import React, { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Info, Heart, MessageSquare, Share2, Compass } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import PostCard from '../components/community/PostCard';
import PostForm from '../components/community/PostForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import useCommunity from '../hooks/useCommunity';
import toast from 'react-hot-toast';
import styles from './CommunityPage.module.css';

const CommunityPage = () => {
  const { user } = useAuth();
  const {
    posts, total, loading, error,
    filters, createPost, deletePost, toggleLike,
    updateFilters, nextPage, prevPage,
  } = useCommunity();

  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
      toast.success('Post shared with community!');
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create post');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleLike = async (id) => {
    try {
      await toggleLike(id);
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <PageShell title="Community Tab">
      <div className={styles.container}>
        {/* Header (Wireframe Screen 10) */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Community Tab</h1>
            <p className={styles.subtitle}>Discover travel stories, tips, and cloned itineraries from fellow globe trotters</p>
          </div>
          <Button variant="accent" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Share Your Trip Story
          </Button>
        </div>

        {/* FilterBar (Wireframe Screen 10) */}
        <FilterBar 
          searchValue={searchInput}
          onSearch={(val) => {
            setSearchInput(val);
            updateFilters({ q: val });
          }}
          placeholder="Search community posts by destination, keywords, tag..."
          sortOptions={[
            { label: 'Most Recent', value: 'recent' },
            { label: 'Most Liked', value: 'popular' },
          ]}
          sortValue={filters.sortBy}
          onSort={(val) => updateFilters({ sortBy: val })}
        />

        <div className={styles.layoutWithSidebar}>
          {/* Main Feed Area */}
          <div className={styles.mainFeed}>
            {showForm && (
              <PostForm onSubmit={handleCreatePost} onCancel={() => setShowForm(false)} />
            )}

            {error && <p className={styles.error}>{error}</p>}
            {loading && <Loader text="Loading community posts..." />}

            {!loading && posts.length === 0 && (
              <Card className={styles.emptyCard}>
                <Compass size={40} className={styles.emptyIcon} />
                <h3>No community posts yet</h3>
                <p>Be the first traveler to share a story or itinerary with the GlobeTrotter community!</p>
                <Button variant="accent" size="sm" onClick={() => setShowForm(true)}>
                  Create First Post
                </Button>
              </Card>
            )}

            {!loading && posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={prevPage}
                  disabled={filters.page <= 1}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={nextPage}
                  disabled={filters.page >= totalPages}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* ── Screen 10 Right Sidebar Note Box ── */}
          <div className={styles.sidebarNote}>
            <Card className={styles.noteCard}>
              <div className={styles.noteHeader}>
                <Info size={20} className={styles.noteIcon} />
                <h3 className={styles.noteTitle}>Community Hub</h3>
              </div>
              <p className={styles.noteText}>
                Community posts where users share trip/activity experiences. Users can search by destination/tag, view experiences, and clone them into their own trips.
              </p>
              <div className={styles.noteList}>
                <div className={styles.noteItem}>
                  <Heart size={14} className={styles.itemIcon} />
                  <span>Like and interact with traveler stories</span>
                </div>
                <div className={styles.noteItem}>
                  <Share2 size={14} className={styles.itemIcon} />
                  <span>Publish your public itineraries</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default CommunityPage;
