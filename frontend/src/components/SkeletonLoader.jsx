import React from 'react';

const SkeletonLoader = ({ type = 'list', count = 3 }) => {
  if (type === 'profile') {
    return (
      <div className="skeleton-profile-card">
        <div className="skeleton-avatar skeleton-shimmer"></div>
        <div className="skeleton-details">
          <div className="skeleton-line skeleton-title skeleton-shimmer"></div>
          <div className="skeleton-line skeleton-subtitle skeleton-shimmer"></div>
          <div className="skeleton-line skeleton-badge skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  // Default 'list' or registrations list loader
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-item-img skeleton-shimmer"></div>
          <div className="skeleton-item-content">
            <div className="skeleton-line skeleton-title skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-subtitle skeleton-shimmer" style={{ width: '60%' }}></div>
            <div className="skeleton-line skeleton-subtitle skeleton-shimmer" style={{ width: '40%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
