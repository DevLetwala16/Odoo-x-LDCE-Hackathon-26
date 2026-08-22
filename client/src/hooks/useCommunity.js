import { useState, useEffect, useCallback } from 'react';
import communityService from '../services/communityService';

export const useCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'recent', q: '', tags: '' });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await communityService.getPosts(filters);
      setPosts(response.posts || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (postData) => {
    const newPost = await communityService.createPost(postData);
    if (!newPost) return;
    setPosts((prev) => [newPost, ...prev]);
    setTotal((prev) => prev + 1);
    return newPost;
  };

  const deletePost = async (id) => {
    await communityService.deletePost(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
    setTotal((prev) => prev - 1);
  };

  const toggleLike = async (id) => {
    const updated = await communityService.likePost(id);
    if (!updated) return;
    setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: updated.likes, likedBy: updated.likedBy } : p)));
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const nextPage = () => {
    if (filters.page * filters.limit < total) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (filters.page > 1) {
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return {
    posts, total, loading, error, filters,
    fetchPosts, createPost, deletePost, toggleLike,
    updateFilters, nextPage, prevPage,
  };
};

export default useCommunity;
