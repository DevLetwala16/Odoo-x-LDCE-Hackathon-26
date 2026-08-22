import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Share2, Send, User } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
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
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts({ limit: 10 });
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
      toast.success('Field note published!');
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

  return (
    <PageShell 
      sectionLabel="05 — FIELD NOTES" 
      title="Community & field notes"
      subtitle="Discover honest travel stories, recommendations, and field notes from fellow explorers."
    >
      <div className={styles.container}>
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
          <Loader text="Loading field notes..." />
        ) : (
          <div className={styles.feed}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.postAuthorInfo}>
                      <div className={styles.authorAvatar}>
                        {post.user?.avatar ? (
                          <img src={post.user.avatar} alt={post.user.firstName} />
                        ) : (
                          <span>{post.user?.firstName ? post.user.firstName.charAt(0) : 'U'}</span>
                        )}
                      </div>
                      <div className={styles.authorDetails}>
                        <h4 className={styles.authorName}>
                          {post.user?.firstName ? `${post.user.firstName} ${post.user.lastName || ''}` : 'Explorer'}
                        </h4>
                        <p className={styles.postTime}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
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
                      <Heart size={16} fill={post.isLiked ? 'var(--color-accent)' : 'none'} color={post.isLiked ? 'var(--color-accent)' : 'currentColor'} /> 
                      <span>{post.likesCount || 0}</span>
                    </button>
                    <button className={styles.actionBtn}>
                      <MessageCircle size={16} /> 
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    <button className={styles.actionBtn}>
                      <Share2 size={16} />
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <div className={styles.emptyFeed}>
                No community field notes published yet. Be the first to share your journey!
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CommunityPage;
