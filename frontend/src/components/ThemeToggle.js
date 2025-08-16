import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn-flat waves-effect ${className}`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      style={{ 
        minWidth: 'auto',
        padding: '0 8px',
        height: '36px',
        lineHeight: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <i className="material-icons" style={{ fontSize: '20px' }}>
        {isDarkMode ? 'light_mode' : 'dark_mode'}
      </i>
    </button>
  );
};

export default ThemeToggle;