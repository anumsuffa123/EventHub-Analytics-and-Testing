import React from 'react';

const EmptyState = ({ 
  title = 'No data available yet.', 
  description = 'There is nothing to display right now.',
  actionText,
  onAction
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m9-4h.01M9 16h6" />
        </svg>
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-empty-action">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
