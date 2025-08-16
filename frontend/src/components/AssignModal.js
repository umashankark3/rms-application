import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import api from '../api/client';

const AssignModal = ({ resumeId, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

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
    // Initialize modal
    const modal = document.getElementById('assignModal');
    if (modal && window.M) {
      const instance = window.M.Modal.init(modal, {
        dismissible: true,
        onCloseEnd: onClose
      });
      instance.open();

      return () => {
        instance.destroy();
      };
    }
  }, [onClose]);

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
            <input
              id="assignUsername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={assignMutation.isLoading}
            />
            <label htmlFor="assignUsername">Username</label>
            <span className="helper-text">
              Enter the username of the person to assign this resume to
            </span>
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