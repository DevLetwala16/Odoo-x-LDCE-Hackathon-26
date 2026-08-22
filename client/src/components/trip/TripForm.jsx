import React, { useState, useEffect } from 'react';
import styles from './TripForm.module.css';
import { validateDateRange, validateForm } from '../../utils/validators';

const TripForm = ({ initialData, onSubmit, loading, submitText = 'Save Trip' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    coverImage: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        totalBudget: initialData.totalBudget || '',
        coverImage: initialData.coverImage || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationRules = {
      name: { required: true, minLength: 3 },
      startDate: { required: true },
      endDate: { required: true },
      totalBudget: { required: true, isNumber: true, min: 1 }
    };
    
    const { isValid, errors: formErrors } = validateForm(formData, validationRules);
    
    let dateErrors = {};
    if (formData.startDate && formData.endDate) {
      const dateCheck = validateDateRange(formData.startDate, formData.endDate);
      if (!dateCheck.isValid) {
        dateErrors.endDate = dateCheck.message;
      }
    }

    const allErrors = { ...formErrors, ...dateErrors };

    if (!isValid || Object.keys(dateErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="name">Trip Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="E.g., Summer in Europe"
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="What is this trip about?"
          rows="4"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
          />
          {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
          />
          {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="totalBudget">Total Budget</label>
          <input
            type="number"
            id="totalBudget"
            name="totalBudget"
            value={formData.totalBudget}
            onChange={handleChange}
            className={`${styles.input} ${errors.totalBudget ? styles.inputError : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.totalBudget && <span className={styles.errorText}>{errors.totalBudget}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="coverImage">Cover Image URL</label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
