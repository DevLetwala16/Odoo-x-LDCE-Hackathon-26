import React from 'react';
import styles from './SearchFilters.module.css';

const SearchFilters = ({ 
  categories = [], 
  selectedCategory, 
  onSelectCategory,
  minCost,
  maxCost,
  onCostChange,
  costIndex,
  onCostIndexChange,
  sort,
  onSortChange
}) => {
  return (
    <div className={styles.filtersPanel}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Sort By</h4>
        <select 
          value={sort} 
          onChange={(e) => onSortChange(e.target.value)}
          className={styles.select}
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
          <option value="rating_desc">Top Rated</option>
        </select>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categories</h4>
        <div className={styles.chips}>
          <button 
            className={`${styles.chip} ${!selectedCategory ? styles.activeChip : ''}`}
            onClick={() => onSelectCategory('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.chip} ${selectedCategory === cat ? styles.activeChip : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price Range</h4>
        <div className={styles.priceInputs}>
          <input 
            type="number" 
            placeholder="Min" 
            value={minCost} 
            onChange={(e) => onCostChange('min', e.target.value)}
            className={styles.input}
          />
          <span>-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxCost} 
            onChange={(e) => onCostChange('max', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Cost Index (Cities)</h4>
        <div className={styles.costIndexButtons}>
          {[1, 2, 3, 4, 5].map(index => (
            <button
              key={index}
              className={`${styles.indexBtn} ${costIndex === index ? styles.activeIndex : ''}`}
              onClick={() => onCostIndexChange(costIndex === index ? null : index)}
            >
              {Array.from({ length: index }).map((_, i) => '$').join('')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
