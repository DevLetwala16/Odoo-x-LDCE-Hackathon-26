import React, { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import PostCard from '../components/community/PostCard';
import PostForm from '../components/community/PostForm';
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
      toast.success('Post created!');
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

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ q: searchInput });
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <PageShell title="Community">
      <div className={styles.container}>
        {/* Controls */}
        <div className={styles.controls}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </form>

          <div className={styles.sortTabs}>
            <button
              className={`${styles.tab} ${filters.sortBy === 'recent' ? styles.active : ''}`}
              onClick={() => updateFilters({ sortBy: 'recent' })}
            >
              Recent
            </button>
            <button
              className={`${styles.tab} ${filters.sortBy === 'popular' ? styles.active : ''}`}
              onClick={() => updateFilters({ sortBy: 'popular' })}
            >
              Popular
            </button>
          </div>

          <Button variant="accent" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            New Post
          </Button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <PostForm onSubmit={handleCreatePost} onCancel={() => setShowForm(false)} />
        )}

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Loading */}
        {loading && <Loader />}

        {/* Posts Feed */}
        {!loading && posts.length === 0 && (
          <div className={styles.empty}>
            <p>No posts yet. Be the first to share your travel experience!</p>
          </div>
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
              <ChevronLeft size={18} />
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {filters.page} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={nextPage}
              disabled={filters.page >= totalPages}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CommunityPage;
