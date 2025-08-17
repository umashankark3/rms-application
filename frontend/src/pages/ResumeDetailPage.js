import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import SkillsChips from '../components/SkillsChips';
import WhatsAppButton from '../components/WhatsAppButton';

const ResumeDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, setValue } = useForm();

  // Fetch resume details
  const { data: resumeData, isLoading, error: fetchError } = useQuery(
    ['resume', id],
    () => api.resumes.get(parseInt(id)),
    {
      onSuccess: (data) => {
        console.log('Resume data received:', data);
        // Set form default values
        const resumeData = data.resume || data;
        setValue('status', resumeData.status);
        setValue('notes', resumeData.notes || resumeData.experience || '');
      },
      onError: (error) => {
        console.error('Resume fetch error:', error);
      }
    }
  );

  // Update resume mutation
  const updateMutation = useMutation(
    (data) => api.resumes.update(parseInt(id), data),
    {
      onSuccess: () => {
        setSuccess('Resume updated successfully');
        setError('');
        queryClient.invalidateQueries(['resume', id]);
        queryClient.invalidateQueries('resumes');
      },
      onError: (error) => {
        setError(error.message);
        setSuccess('');
      }
    }
  );

  // Assign resume mutation
  const assignMutation = useMutation(
    (username) => api.resumes.assign(parseInt(id), username),
    {
      onSuccess: () => {
        setSuccess('Resume assigned successfully');
        setError('');
        queryClient.invalidateQueries(['resume', id]);
        queryClient.invalidateQueries('resumes');
      },
      onError: (error) => {
        setError(error.message);
        setSuccess('');
      }
    }
  );

  // Get file URL mutation
  const getFileMutation = useMutation(
    () => api.resumes.getFileUrl(parseInt(id)),
    {
      onSuccess: (data) => {
        console.log('File URL received:', data.url);
        // Try to open the file URL
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow) {
          // If popup was blocked, show the URL to user
          setError(`Popup blocked. Please visit: ${data.url}`);
        }
      },
      onError: (error) => {
        console.error('File URL error:', error);
        setError(error.message);
      }
    }
  );

  const onUpdateSubmit = (data) => {
    const updateData = {};
    const currentResume = resumeData?.resume || resumeData;
    if (data.status !== currentResume?.status) {
      updateData.status = data.status;
    }
    if (data.notes !== (currentResume?.notes || currentResume?.experience || '')) {
      updateData.notes = data.notes;
    }

    if (Object.keys(updateData).length > 0) {
      updateMutation.mutate(updateData);
    }
  };

  const onAssignSubmit = (data) => {
    if (data.assignUsername?.trim()) {
      assignMutation.mutate(data.assignUsername.trim());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (fetchError) {
    return (
      <div className="container mt-2">
        <div className="error-message">
          Error loading resume: {fetchError.message}
        </div>
        <Link to="/resumes" className="btn teal mt-1">
          <i className="material-icons left">arrow_back</i>
          Back to Resumes
        </Link>
      </div>
    );
  }

  const { resume } = resumeData || {};
  // Handle both old and new field names
  const resumeInfo = resume || resumeData;

  if (!resumeInfo) {
    return (
      <div className="container mt-2">
        <div className="error-message">
          Resume not found
        </div>
        <Link to="/resumes" className="btn teal mt-1">
          <i className="material-icons left">arrow_back</i>
          Back to Resumes
        </Link>
      </div>
    );
  }

  const canEdit = user.role === 'admin' || 
                 (user.role === 'recruiter' && resume.assignedToUserId === user.id);

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="row">
        <div className="col s12">
          <Link to="/resumes" className="btn-flat">
            <i className="material-icons left">arrow_back</i>
            Back to Resumes
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="row">
          <div className="col s12">
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col s12">
            <div className="success-message">{success}</div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Resume Details Card */}
        <div className="col s12 l8">
          <div className="card">
            <div className="card-content">
              <span className="card-title">
                <i className="material-icons left">person</i>
                {resumeInfo.name || resumeInfo.candidateName}
              </span>

              <div className="row">
                <div className="col s12 m6">
                  <p>
                    <i className="material-icons tiny">email</i>
                    <strong> Email:</strong> {resumeInfo.email || resumeInfo.candidateEmail || 'Not provided'}
                  </p>
                  <p>
                    <i className="material-icons tiny">phone</i>
                    <strong> Phone:</strong> {resumeInfo.phone || resumeInfo.candidatePhone || 'Not provided'}
                  </p>
                  <p>
                    <i className="material-icons tiny">work</i>
                    <strong> Experience:</strong> {resumeInfo.experienceYears ? `${resumeInfo.experienceYears} years` : 'Not specified'}
                  </p>
                </div>
                <div className="col s12 m6">
                  <p>
                    <i className="material-icons tiny">description</i>
                    <strong> File:</strong> {resume.fileName}
                  </p>
                  <p>
                    <i className="material-icons tiny">storage</i>
                    <strong> Size:</strong> {resume.fileSize ? `${(resume.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                  </p>
                  <p>
                    <i className="material-icons tiny">schedule</i>
                    <strong> Uploaded:</strong> {formatDate(resume.createdAt)}
                  </p>
                </div>
              </div>

              {resume.skills && (
                <div className="row">
                  <div className="col s12">
                    <p><strong>Skills:</strong></p>
                    <SkillsChips skills={resume.skills} maxDisplay={10} />
                  </div>
                </div>
              )}

              {resume.notes && (
                <div className="row">
                  <div className="col s12">
                    <p><strong>Notes:</strong></p>
                    <p className="grey-text">{resume.notes}</p>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col s12">
                  <p>
                    <strong>Status:</strong> <StatusBadge status={resume.status} />
                  </p>
                  {resume.assignedTo && (
                    <p>
                      <strong>Assigned to:</strong> {resume.assignedTo.fullName || resume.assignedTo.username}
                    </p>
                  )}
                  <p>
                    <strong>Uploaded by:</strong> {resume.uploadedBy.fullName || resume.uploadedBy.username}
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col s12">
                  <button
                    className="btn waves-effect waves-light"
                    onClick={() => getFileMutation.mutate()}
                    disabled={getFileMutation.isLoading}
                  >
                    {getFileMutation.isLoading ? (
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
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="material-icons left">visibility</i>
                        View Resume
                      </>
                    )}
                  </button>

                  <a
                    href={`http://localhost:8081/uploads/${resume.fileKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-flat waves-effect waves-light"
                    style={{ marginLeft: '10px' }}
                  >
                    <i className="material-icons left">file_download</i>
                    Direct Link
                  </a>

                  <WhatsAppButton
                    candidateName={resumeInfo.name || resumeInfo.candidateName}
                                    skills={resumeInfo.skills}
                resumeId={resumeInfo.id}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="col s12 l4">
          {canEdit && (
            <div className="card">
              <div className="card-content">
                <span className="card-title">
                  <i className="material-icons left">settings</i>
                  Actions
                </span>

                <form onSubmit={handleSubmit(onUpdateSubmit)}>
                  <div className="input-field">
                    <select {...register('status')}>
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="assigned">Assigned</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <label>Status</label>
                  </div>

                  <div className="input-field">
                    <textarea
                      id="notes"
                      className="materialize-textarea"
                      {...register('notes')}
                    />
                    <label htmlFor="notes">Notes</label>
                  </div>

                  <button
                    type="submit"
                    className="btn waves-effect waves-light"
                    disabled={updateMutation.isLoading}
                    style={{ width: '100%', marginBottom: '1rem' }}
                  >
                    {updateMutation.isLoading ? (
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="material-icons left">save</i>
                        Save Changes
                      </>
                    )}
                  </button>
                </form>

                {user.role === 'admin' && (
                  <form onSubmit={handleSubmit(onAssignSubmit)}>
                    <div className="input-field">
                      <i className="material-icons prefix">person_add</i>
                      <input
                        id="assignUsername"
                        type="text"
                        {...register('assignUsername')}
                        disabled={assignMutation.isLoading}
                      />
                      <label htmlFor="assignUsername">Assign to Username</label>
                    </div>

                    <button
                      type="submit"
                      className="btn waves-effect waves-light teal"
                      disabled={assignMutation.isLoading}
                      style={{ width: '100%' }}
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
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailPage;