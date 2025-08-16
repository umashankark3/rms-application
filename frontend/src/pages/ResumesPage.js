import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import SkillsChips from '../components/SkillsChips';
import AssignModal from '../components/AssignModal';
import WhatsAppButton from '../components/WhatsAppButton';

const ResumesPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    assignedTo: '',
    page: 1,
    limit: 10
  });
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const { data, isLoading, error, refetch } = useQuery(
    ['resumes', filters],
    () => api.resumes.list(filters),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log('Resumes data received:', data);
      },
      onError: (error) => {
        console.error('Resumes query error:', error);
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Initialize Materialize select elements
    if (window.M) {
      const selects = document.querySelectorAll('select');
      window.M.FormSelect.init(selects);
    }
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mt-2">
        <div className="error-message">
          Error loading resumes: {error.message}
        </div>
      </div>
    );
  }

  const { resumes = [], pagination = {} } = data || {};

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="row">
        <div className="col s12">
          <h4>
            <i className="material-icons left">folder</i>
            Resume Dashboard
          </h4>
        </div>
      </div>

      {/* Filters */}
      <div className="row">
        <div className="col s12 m4">
          <div className="input-field">
            <i className="material-icons prefix">search</i>
            <input
              id="search"
              type="text"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              placeholder="Search name, email, skills..."
            />
            <label htmlFor="search">Search</label>
          </div>
        </div>

        <div className="col s12 m3">
          <div className="input-field">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="assigned">Assigned</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
            <label>Status</label>
          </div>
        </div>

        <div className="col s12 m3">
          <div className="input-field">
            <input
              id="assignedTo"
              type="text"
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              placeholder="Username"
            />
            <label htmlFor="assignedTo">Assigned To</label>
          </div>
        </div>

        <div className="col s12 m2">
          <button
            className="btn waves-effect waves-light"
            onClick={() => refetch()}
            style={{ marginTop: '1rem' }}
          >
            <i className="material-icons left">refresh</i>
            Filter
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="row">
        <div className="col s12">
          <p className="grey-text">
            Showing {resumes.length} of {pagination.total || 0} resumes
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col s12">
          {resumes.length === 0 ? (
            <div className="center-align" style={{ padding: '3rem' }}>
              <i className="material-icons large grey-text">folder_open</i>
              <p className="grey-text">No resumes found</p>
              <Link to="/upload" className="btn teal">
                <i className="material-icons left">cloud_upload</i>
                Upload First Resume
              </Link>
            </div>
          ) : (
            <table className="responsive-table highlight z-depth-1">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id}>
                    <td>
                      <strong>{resume.candidateName}</strong>
                      <br />
                      <small className="grey-text">
                        {resume.fileName}
                      </small>
                    </td>
                    <td>
                      {resume.candidateEmail && (
                        <div>{resume.candidateEmail}</div>
                      )}
                      {resume.candidatePhone && (
                        <div>{resume.candidatePhone}</div>
                      )}
                    </td>
                    <td>
                      {resume.experienceYears ? `${resume.experienceYears} years` : '-'}
                    </td>
                    <td>
                      <SkillsChips skills={resume.skills} maxDisplay={3} />
                    </td>
                    <td>
                      <StatusBadge status={resume.status} />
                    </td>
                    <td>
                      {resume.assignedTo ? (
                        <div>
                          <i className="material-icons tiny">person</i>
                          {resume.assignedTo.fullName || resume.assignedTo.username}
                        </div>
                      ) : (
                        <span className="grey-text">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <small>{formatDate(resume.createdAt)}</small>
                      <br />
                      <small className="grey-text">
                        by {resume.uploadedBy.fullName || resume.uploadedBy.username}
                      </small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/resumes/${resume.id}`}
                          className="btn-flat btn-small"
                          title="View Details"
                        >
                          <i className="material-icons">visibility</i>
                        </Link>
                        
                        {user.role === 'admin' && (
                          <button
                            className="btn-flat btn-small"
                            onClick={() => setSelectedResumeId(resume.id)}
                            title="Assign"
                          >
                            <i className="material-icons">person_add</i>
                          </button>
                        )}

                        <WhatsAppButton
                          candidateName={resume.candidateName}
                          skills={resume.skills}
                          resumeId={resume.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="row">
          <div className="col s12 center-align">
            <ul className="pagination">
              <li className={pagination.page === 1 ? 'disabled' : 'waves-effect'}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="material-icons">chevron_left</i>
                </button>
              </li>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.page) <= 2
                )
                .map(page => (
                  <li 
                    key={page}
                    className={page === pagination.page ? 'active teal' : 'waves-effect'}
                  >
                    <button onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  </li>
                ))
              }

              <li className={pagination.page === pagination.totalPages ? 'disabled' : 'waves-effect'}>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <i className="material-icons">chevron_right</i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {selectedResumeId && (
        <AssignModal
          resumeId={selectedResumeId}
          onClose={() => setSelectedResumeId(null)}
          onSuccess={() => {
            setSelectedResumeId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default ResumesPage;