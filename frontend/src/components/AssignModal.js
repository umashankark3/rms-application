import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import api from '../api/client';

const AssignModal = ({ resumeId, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Fetch users for dropdown
  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    api.users.list,
    {
      onError: (error) => {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users');
      }
    }
  );

  const assignMutation = useMutation(
    (username) => api.resumes.assign(resumeId, username),
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        setError(error.message);
      }
    }
  );

  useEffect(() => {
    // Initialize modal and select
    const modal = document.getElementById('assignModal');
    if (modal && window.M) {
      const instance = window.M.Modal.init(modal, {
        dismissible: true,
        onCloseEnd: onClose
      });
      instance.open();

      // Initialize select dropdown after users are loaded
      if (users && users.length > 0) {
        setTimeout(() => {
          const selects = document.querySelectorAll('#assignModal select');
          window.M.FormSelect.init(selects);
        }, 100);
      }

      return () => {
        instance.destroy();
      };
    }
  }, [onClose, users]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    setError('');
    assignMutation.mutate(username.trim());
  };

  const handleClose = () => {
    const modal = document.getElementById('assignModal');
    if (modal && window.M) {
      const instance = window.M.Modal.getInstance(modal);
      if (instance) {
        instance.close();
      }
    }
  };

  return (
    <div id="assignModal" className="modal">
      <div className="modal-content">
        <h4>
          <i className="material-icons left">person_add</i>
          Assign Resume
        </h4>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <i className="material-icons prefix">account_circle</i>
            <select
              id="assignUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={assignMutation.isLoading || usersLoading}
            >
              <option value="" disabled>Choose user to assign</option>
              {users?.filter(user => user.role === 'recruiter').map(user => (
                <option key={user.username} value={user.username}>
                  {user.fullName} ({user.username})
                </option>
              ))}
            </select>
            <label htmlFor="assignUsername">Assign to User</label>
            {usersLoading && (
              <span className="helper-text">Loading users...</span>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-close waves-effect waves-teal btn-flat"
              onClick={handleClose}
              disabled={assignMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn waves-effect waves-light teal"
              disabled={assignMutation.isLoading || !username.trim()}
            >
              {assignMutation.isLoading ? (
                <>
                  <div className="preloader-wrapper small active" style={{ marginRight: '10px' }}>
                    <div className="spinner-layer spinner-white-only">
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
                  Assigning...
                </>
              ) : (
                <>
                  <i className="material-icons left">person_add</i>
                  Assign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignModal;