import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    // Initialize Materialize components
    if (window.M) {
      const sidenavs = document.querySelectorAll('.sidenav');
      const dropdowns = document.querySelectorAll('.dropdown-trigger');
      
      window.M.Sidenav.init(sidenavs);
      window.M.Dropdown.init(dropdowns);
    }
  }, []);

  return (
    <div className="navbar-fixed">
      <nav className="teal">
        <div className="nav-wrapper container">
          <Link to="/" className="brand-logo">
            <i className="material-icons left">description</i>
            RMS
          </Link>
          
          {/* Mobile menu trigger */}
          <a href="#!" data-target="mobile-nav" className="sidenav-trigger">
            <i className="material-icons">menu</i>
          </a>

          {/* Desktop menu */}
          <ul className="right hide-on-med-and-down">
            <li className={isActive('/upload')}>
              <Link to="/upload">
                <i className="material-icons left">cloud_upload</i>
                Upload
              </Link>
            </li>
            <li className={isActive('/resumes')}>
              <Link to="/resumes">
                <i className="material-icons left">folder</i>
                Resumes
              </Link>
            </li>
            {user?.role === 'admin' && (
              <li className={isActive('/users')}>
                <Link to="/users">
                  <i className="material-icons left">people</i>
                  Users
                </Link>
              </li>
            )}
            <li>
              <a href="#!" className="dropdown-trigger" data-target="user-dropdown">
                <i className="material-icons left">account_circle</i>
                {user?.fullName || user?.username}
                <i className="material-icons right">arrow_drop_down</i>
              </a>
            </li>
          </ul>
          
          {/* Theme toggle in top right corner */}
          <div className="right" style={{ marginLeft: '10px', marginTop: '8px' }}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile sidenav */}
      <ul className="sidenav" id="mobile-nav">
        <li>
          <div className="user-view">
            <div className="background teal lighten-1"></div>
            <a href="#!">
              <i className="material-icons circle">account_circle</i>
            </a>
            <a href="#!">
              <span className="white-text name">{user?.fullName || user?.username}</span>
            </a>
            <a href="#!">
              <span className="white-text email">{user?.role}</span>
            </a>
          </div>
        </li>
        <li className={isActive('/upload')}>
          <Link to="/upload">
            <i className="material-icons">cloud_upload</i>
            Upload Resume
          </Link>
        </li>
        <li className={isActive('/resumes')}>
          <Link to="/resumes">
            <i className="material-icons">folder</i>
            All Resumes
          </Link>
        </li>
        {user?.role === 'admin' && (
          <li className={isActive('/users')}>
            <Link to="/users">
              <i className="material-icons">people</i>
              Manage Users
            </Link>
          </li>
        )}
        <li><div className="divider"></div></li>
        <li>
          <ThemeToggle className="left-align" />
        </li>
        <li>
          <a href="#!" onClick={handleLogout}>
            <i className="material-icons">exit_to_app</i>
            Logout
          </a>
        </li>
      </ul>

      {/* User dropdown */}
      <ul id="user-dropdown" className="dropdown-content">
        <li>
          <a href="#!" onClick={handleLogout}>
            <i className="material-icons left">exit_to_app</i>
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;