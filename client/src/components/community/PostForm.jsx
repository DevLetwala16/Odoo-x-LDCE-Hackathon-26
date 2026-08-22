import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import styles from './PostForm.module.css';

const PostForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      });
      setForm({ title: '', content: '', tags: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Share your experience</h3>
        {onCancel && (
          <button className={styles.closeBtn} onClick={onCancel}>
            <X size={18} />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="post-title"
          name="title"
          label="Title"
          placeholder="What's your trip highlight?"
          value={form.title}
          onChange={handleChange}
          required
        />
        <div className={styles.textareaGroup}>
          <label htmlFor="post-content" className={styles.label}>Your Story</label>
          <textarea
            id="post-content"
            name="content"
            className={styles.textarea}
            placeholder="Share your travel experience, tips, or recommendations..."
            value={form.content}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        <Input
          id="post-tags"
          name="tags"
          label="Tags (comma separated)"
          placeholder="e.g. paris, food, adventure"
          value={form.tags}
          onChange={handleChange}
        />
        <div className={styles.actions}>
          <Button type="submit" variant="accent" disabled={submitting || !form.title.trim() || !form.content.trim()}>
            <Send size={16} />
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PostForm;
