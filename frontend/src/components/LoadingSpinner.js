import React from 'react';

const LoadingSpinner = ({ size = 'medium', overlay = false }) => {
  const sizeClass = size === 'small' ? 'small' : size === 'large' ? 'big' : '';
  
  const spinner = (
    <div className="preloader-wrapper active">
      <div className={`spinner-layer spinner-blue-only ${sizeClass}`}>
        <div className="circle-clipper left">
          <div className="circle"></div>
        </div>
        <div className="gap-patch">
          <div className="circle"></div>
        </div>
        <div className="circle-clipper right">
          <div className="circle"></div>
        </div>
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return (
    <div className="center-align" style={{ padding: '2rem' }}>
      {spinner}
    </div>
  );
};

export default LoadingSpinner;