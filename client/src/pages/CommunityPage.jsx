import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Share2, Send, User, Info, CornerDownRight } from 'lucide-react';
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
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Replies & comments state
  const [openReplies, setOpenReplies] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts({ limit: 30 });
      const fetchedPosts = res?.posts || res?.data?.posts || res || [];
      setPosts(fetchedPosts);
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
        title: newPostTitle.trim() || newPostContent.slice(0, 50),
        content: newPostContent,
        imageUrl: postImage || undefined,
      });
      toast.success('Field note published to Community Hub!');
      setNewPostTitle('');
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
      const res = await communityService.addComment(postId, { text: text.trim() });
      const updatedPost = res?.post || res?.data?.post || res;

      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            comments: updatedPost?.comments || [
              ...(p.comments || []),
              {
                _id: Date.now(),
                user: { firstName: user?.firstName || 'You', lastName: user?.lastName || '' },
                text: text.trim(),
                createdAt: new Date().toISOString()
              }
            ]
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
    const shareText = `Check out this travel note by ${post.user?.firstName || 'an explorer'} on GlobeTrotter: "${post.title || post.content.slice(0, 40)}"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      toast.success('Community note copied to clipboard!');
    } else {
      toast.success('Note ready to share!');
    }
  };

  const filteredPosts = posts.filter(p => 
    (p.content && p.content.toLowerCase().includes(searchValue.toLowerCase())) ||
    (p.title && p.title.toLowerCase().includes(searchValue.toLowerCase())) ||
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
                      placeholder="Note Title (Optional, e.g. Sunset in Santorini)" 
                      value={newPostTitle} 
                      onChange={(e) => setNewPostTitle(e.target.value)} 
                    />
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
                  filteredPosts.map((post) => {
                    const currentUserId = user?._id?.toString();
                    const isLiked = post.isLiked || (post.likedBy && post.likedBy.some(id => (id._id || id).toString() === currentUserId));
                    const likesCount = post.likes !== undefined ? post.likes : (post.likedBy?.length || 0);
                    const commentsCount = post.comments?.length || 0;
                    const isRepliesOpen = openReplies[post._id];

                    return (
                      <Card key={post._id} className={styles.postCard}>
                        <div className={styles.postLayout}>
                          {/* Round Avatar on Left (Screen 10 Schema) */}
                          <div className={styles.authorAvatarCircle}>
                            {post.user?.avatar ? (
                              <img src={post.user.avatar} alt="" />
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

                            {post.title && <h3 className={styles.postTitleHeading} style={{ fontSize: '1rem', fontWeight: 600, margin: '2px 0 4px 0', color: 'var(--color-ink)' }}>{post.title}</h3>}
                            <p className={styles.postContent}>{post.content}</p>

                            {post.imageUrl && (
                              <img src={post.imageUrl} alt="Post attachment" className={styles.postImage} />
                            )}

                            {/* Action Buttons: Like, Reply, Share */}
                            <div className={styles.postActions}>
                              <button 
                                className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                                onClick={() => handleLike(post._id)}
                                title={isLiked ? "Unlike post" : "Like post"}
                              >
                                <Heart size={16} fill={isLiked ? "#E11D48" : "none"} color={isLiked ? "#E11D48" : "currentColor"} /> 
                                <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                              </button>
                              
                              <button 
                                className={`${styles.actionBtn} ${isRepliesOpen ? styles.activeActionBtn : ''}`}
                                onClick={() => handleToggleReplies(post._id)}
                                title="View & Add replies"
                              >
                                <MessageCircle size={16} /> 
                                <span>{commentsCount > 0 ? `${commentsCount} ${commentsCount === 1 ? 'Reply' : 'Replies'}` : 'Reply'}</span>
                              </button>
                              
                              <button 
                                className={styles.actionBtn}
                                onClick={() => handleShare(post)}
                                title="Share note"
                              >
                                <Share2 size={16} /> 
                                <span>Share</span>
                              </button>
                            </div>

                            {/* Expandable Replies / Comments Section */}
                            {isRepliesOpen && (
                              <div className={styles.repliesSection}>
                                {post.comments && post.comments.length > 0 && (
                                  <div className={styles.repliesList}>
                                    {post.comments.map((comment, cIdx) => (
                                      <div key={comment._id || cIdx} className={styles.replyItem}>
                                        <div className={styles.replyAvatar}>
                                          {comment.user?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <div className={styles.replyBody}>
                                          <div className={styles.replyHeader}>
                                            <span className={styles.replyAuthor}>{comment.user?.firstName || 'Traveler'} {comment.user?.lastName || ''}</span>
                                            <span className={styles.replyTime}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                          </div>
                                          <p className={styles.replyText}>{comment.text}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Reply Input */}
                                <div className={styles.replyInputWrapper}>
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
                                    className={styles.replyInput}
                                  />
                                  <button 
                                    className={styles.replySendBtn}
                                    onClick={() => handleSendReply(post._id)}
                                    disabled={submittingReply[post._id]}
                                  >
                                    <Send size={12} /> {submittingReply[post._id] ? 'Posting...' : 'Reply'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
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
