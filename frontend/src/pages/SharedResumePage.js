import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillsChips from '../components/SkillsChips';

const SharedResumePage = () => {
  const { token } = useParams();

  const { data, isLoading, error } = useQuery(
    ['sharedResume', token],
    () => api.shareLinks.get(token),
    {
      retry: false
    }
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (data?.fileUrl) {
      window.open(data.fileUrl, '_blank');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container" style={{ marginTop: '5rem' }}>
        <div className="row">
          <div className="col s12 m6 offset-m3">
            <div className="card">
              <div className="card-content center-align">
                <i className="material-icons large red-text">error_outline</i>
                <h5>Access Denied</h5>
                <p className="grey-text">{error.message}</p>
                
                <div className="mt-2">
                  <p className="small grey-text">
                    This link may have expired, been revoked, or is invalid.
                    <br />
                    Please contact the person who shared this link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { resume, shareLink } = data || {};

  if (!resume) {
    return (
      <div className="container" style={{ marginTop: '5rem' }}>
        <div className="row">
          <div className="col s12 m6 offset-m3">
            <div className="card">
              <div className="card-content center-align">
                <i className="material-icons large grey-text">description</i>
                <h5>Resume Not Found</h5>
                <p className="grey-text">The shared resume could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="row">
        <div className="col s12 center-align">
          <div className="card">
            <div className="card-content">
              <i className="material-icons large teal-text">description</i>
              <h4 className="teal-text">RMS</h4>
              <p className="grey-text">Shared Resume Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Link Info */}
      {shareLink?.expiresAt && (
        <div className="row">
          <div className="col s12">
            <div className="card amber lighten-4">
              <div className="card-content">
                <i className="material-icons left amber-text text-darken-2">schedule</i>
                <strong>Note:</strong> This link expires on{' '}
                {new Date(shareLink.expiresAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Details */}
      <div className="row">
        <div className="col s12 l8 offset-l2">
          <div className="card">
            <div className="card-content">
              <span className="card-title">
                <i className="material-icons left">person</i>
                {resume.candidateName}
              </span>

              <div className="row">
                <div className="col s12 m6">
                  {resume.candidateEmail && (
                    <p>
                      <i className="material-icons tiny">email</i>
                      <strong> Email:</strong> 
                      <a href={`mailto:${resume.candidateEmail}`} className="teal-text">
                        {resume.candidateEmail}
                      </a>
                    </p>
                  )}
                  
                  {resume.candidatePhone && (
                    <p>
                      <i className="material-icons tiny">phone</i>
                      <strong> Phone:</strong> 
                      <a href={`tel:${resume.candidatePhone}`} className="teal-text">
                        {resume.candidatePhone}
                      </a>
                    </p>
                  )}

                  {resume.experienceYears && (
                    <p>
                      <i className="material-icons tiny">work</i>
                      <strong> Experience:</strong> {resume.experienceYears} years
                    </p>
                  )}
                </div>

                <div className="col s12 m6">
                  <p>
                    <i className="material-icons tiny">description</i>
                    <strong> File:</strong> {resume.fileName}
                  </p>
                  
                  {resume.fileSize && (
                    <p>
                      <i className="material-icons tiny">storage</i>
                      <strong> Size:</strong> {(resume.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}

                  <p>
                    <i className="material-icons tiny">schedule</i>
                    <strong> Uploaded:</strong> {formatDate(resume.createdAt)}
                  </p>

                  {resume.uploadedBy && (
                    <p>
                      <i className="material-icons tiny">person_outline</i>
                      <strong> Uploaded by:</strong> {resume.uploadedBy.fullName || resume.uploadedBy.username}
                    </p>
                  )}
                </div>
              </div>

              {resume.skills && (
                <div className="row">
                  <div className="col s12">
                    <p><strong>Skills:</strong></p>
                    <SkillsChips skills={resume.skills} maxDisplay={20} />
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col s12 center-align">
                  <button
                    className="btn waves-effect waves-light teal btn-large"
                    onClick={handleDownload}
                  >
                    <i className="material-icons left">file_download</i>
                    Download Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="row">
        <div className="col s12 center-align">
          <div className="card grey lighten-4">
            <div className="card-content">
              <p className="grey-text">
                <small>
                  <i className="material-icons tiny">security</i>
                  This is a secure, time-limited link to view this resume.
                  <br />
                  Powered by <strong>RMS</strong> - Resume Management System
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedResumePage;