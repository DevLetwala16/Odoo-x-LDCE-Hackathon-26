import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Share2, Send, User, Info } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import communityService from '../services/communityService';
import { useAuth } from '../hooks/useAuth';
import styles from './CommunityPage.module.css';

const CommunityPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts({ limit: 15 });
      setPosts(res?.posts || res?.data?.posts || res || []);
    } catch (err) {
      console.error('Fetch community posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await communityService.createPost({
        content: newPostContent,
        imageUrl: postImage || undefined,
      });
      toast.success('Field note published to Community Hub!');
      setNewPostContent('');
      setPostImage('');
      fetchPosts();
    } catch (err) {
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await communityService.likePost(postId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: res.likesCount || p.likesCount + 1 } : p));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchValue.toLowerCase()) ||
    (p.user?.firstName && p.user.firstName.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <PageShell 
      sectionLabel="Screen 10" 
      title="Community Sub Screen"
      subtitle="Community Hub — Discover travel stories, tips, and experiences from fellow travelers."
    >
      <div className={styles.container}>
        {/* Screen 10 Controls: Search bar | Group by | Filter | Sort by */}
        <FilterBar
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search community posts and tips..."
          sortOptions={[
            { label: 'Latest Posts', value: 'latest' },
            { label: 'Most Liked', value: 'likes' },
          ]}
        />

        <div className={styles.mainLayoutGrid}>
          {/* Main Feed Container: Community Hub */}
          <div className={styles.feedColumn}>
            <h2 className={styles.communityHubTitle}>Community Hub</h2>

            {/* Create Post Section */}
            {user && (
              <Card className={styles.createPostCard}>
                <div className={styles.createHeader}>
                  <div className={styles.userAvatar}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                  <input 
                    type="text"
                    className={styles.createInput}
                    placeholder="Share a field note, trip recommendation, or travel tip..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>
                {newPostContent && (
                  <div className={styles.expandedPostForm}>
                    <Input 
                      placeholder="Optional Photo URL (https://...)" 
                      value={postImage} 
                      onChange={(e) => setPostImage(e.target.value)} 
                    />
                    <div className={styles.postSubmitRow}>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleCreatePost} 
                        disabled={submitting}
                      >
                        {submitting ? 'Publishing...' : 'Publish Note'} <Send size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Posts Feed */}
            {loading ? (
              <Loader text="Loading Community Hub notes..." />
            ) : (
              <div className={styles.feed}>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Card key={post._id} className={styles.postCard}>
                      <div className={styles.postLayout}>
                        {/* Round Avatar on Left (Screen 10 Schema) */}
                        <div className={styles.authorAvatarCircle}>
                          {post.user?.avatar ? (
                            <img src={post.user.avatar} alt={post.user.firstName} />
                          ) : (
                            <span>{post.user?.firstName ? post.user.firstName.charAt(0) : 'U'}</span>
                          )}
                        </div>

                        {/* Post Content Box on Right */}
                        <div className={styles.postMainContent}>
                          <div className={styles.postAuthorInfo}>
                            <h4 className={styles.authorName}>
                              {post.user?.firstName ? `${post.user.firstName} ${post.user.lastName || ''}` : 'Explorer'}
                            </h4>
                            <span className={styles.postTime}>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className={styles.postContent}>{post.content}</p>

                          {post.imageUrl && (
                            <img src={post.imageUrl} alt="Post attachment" className={styles.postImage} />
                          )}

                          <div className={styles.postActions}>
                            <button 
                              className={`${styles.actionBtn} ${post.isLiked ? styles.liked : ''}`}
                              onClick={() => handleLike(post._id)}
                            >
                              <Heart size={16} /> <span>{post.likesCount || 0} Likes</span>
                            </button>
                            <button className={styles.actionBtn}>
                              <MessageCircle size={16} /> <span>Reply</span>
                            </button>
                            <button className={styles.actionBtn}>
                              <Share2 size={16} /> <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className={styles.emptyFeed}>
                    <p>No community posts found. Be the first to share a travel tip!</p>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Screen 10 Right Sidebar Note Box */}
          <div className={styles.sidebarColumn}>
            <Card className={styles.noteBoxCard}>
              <div className={styles.noteHeader}>
                <Info size={18} />
                <h3>Community Hub Guide</h3>
              </div>
              <p className={styles.noteText}>
                The Community section connects travelers worldwide. Share real itineraries, tips on places, local food suggestions, and ask fellow travelers for route recommendations.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default CommunityPage;
