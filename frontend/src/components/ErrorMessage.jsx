import React from 'react';

const ErrorMessage = ({ message = 'An error occurred. Please try again.', onRetry }) => {
  return (
    <div className="error-message-card">
      <div className="error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="error-text">
        <p className="error-title">Error</p>
        <p className="error-desc">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-retry">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
