import React from 'react';
import { Heart, Trash2, Calendar, MapPin, Tag } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './PostCard.module.css';

const PostCard = ({ post, currentUserId, onLike, onDelete }) => {
  const isLiked = post.likedBy?.some((id) => id === currentUserId);
  const isOwner = post.user?._id === currentUserId;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className={styles.postCard}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {post.user?.avatar ? (
              <img src={post.user.avatar} alt={post.user.firstName} />
            ) : (
              <span>{post.user?.firstName?.[0]}{post.user?.lastName?.[0]}</span>
            )}
          </div>
          <div>
            <p className={styles.userName}>
              {post.user?.firstName} {post.user?.lastName}
            </p>
            <p className={styles.date}>
              <Calendar size={12} />
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        {isOwner && (
          <button className={styles.deleteBtn} onClick={() => onDelete(post._id)} title="Delete post">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.content}>{post.content}</p>

      {post.trip && (
        <div className={styles.meta}>
          <MapPin size={14} />
          <span>Trip: {post.trip.name}</span>
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className={styles.tags}>
          <Tag size={14} />
          {post.tags.map((tag, i) => (
            <Badge key={i} variant="info">#{tag}</Badge>
          ))}
        </div>
      )}

      {post.images?.length > 0 && (
        <div className={styles.images}>
          {post.images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt={`Post image ${i + 1}`} className={styles.postImage} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <button
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
          onClick={() => onLike(post._id)}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes || 0}</span>
        </button>
      </div>
    </Card>
  );
};

export default PostCard;
