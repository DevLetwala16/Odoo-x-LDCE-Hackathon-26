import React from 'react';
import SearchBar from './SearchBar';
import styles from './FilterBar.module.css';

const FilterBar = ({
  onSearch,
  searchValue,
  onSort,
  sortValue,
  sortOptions = [],
  onFilter,
  filterValue,
  filterOptions = [],
  onGroupBy,
  groupByValue,
  groupByOptions = []
}) => {
  return (
    <div className={styles.filterBar}>
      <div className={styles.searchSection}>
        <SearchBar
          value={searchValue}
          onChange={onSearch}
          className={styles.searchBar}
        />
      </div>

      <div className={styles.controlsSection}>
        {filterOptions.length > 0 && onFilter && (
          <select 
            value={filterValue} 
            onChange={(e) => onFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">All Filters</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {groupByOptions.length > 0 && onGroupBy && (
          <select 
            value={groupByValue} 
            onChange={(e) => onGroupBy(e.target.value)}
            className={styles.select}
          >
            <option value="">No Grouping</option>
            {groupByOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {sortOptions.length > 0 && onSort && (
          <select 
            value={sortValue} 
            onChange={(e) => onSort(e.target.value)}
            className={styles.select}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
