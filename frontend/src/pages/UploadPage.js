import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const uploadSchema = z.object({
  candidateName: z.string().min(2, 'Name must be at least 2 characters').max(140),
  candidateEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  candidatePhone: z.string().max(20).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  skills: z.string().optional(),
  notes: z.string().optional()
});

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(uploadSchema)
  });

  const uploadMutation = useMutation(api.resumes.create, {
    onSuccess: (data) => {
      setSuccess('Resume uploaded successfully!');
      setError('');
      reset();
      setFile(null);
      queryClient.invalidateQueries('resumes');
      
      // Redirect to resume detail after 2 seconds
      setTimeout(() => {
        navigate(`/resumes/${data.resume.id}`);
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess('');
    }
  });

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const onSubmit = async (data) => {
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateName', data.candidateName);
    
    if (data.candidateEmail) formData.append('candidateEmail', data.candidateEmail);
    if (data.candidatePhone) formData.append('candidatePhone', data.candidatePhone);
    if (data.experienceYears) formData.append('experienceYears', data.experienceYears.toString());
    if (data.skills) formData.append('skills', data.skills);
    if (data.notes) formData.append('notes', data.notes);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="row">
        <div className="col s12 m8 offset-m2">
          <div className="card">
            <div className="card-content">
              <span className="card-title">
                <i className="material-icons left">cloud_upload</i>
                Upload Resume
              </span>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* File Upload Area */}
                <div className="row">
                  <div className="col s12">
                    <div
                      className={`file-drop-zone ${dragOver ? 'dragover' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                      
                      {file ? (
                        <div>
                          <i className="material-icons large teal-text">description</i>
                          <p><strong>{file.name}</strong></p>
                          <p className="grey-text">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="teal-text">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <i className="material-icons large grey-text">cloud_upload</i>
                          <p>Drag and drop your resume here</p>
                          <p className="grey-text">or click to select file</p>
                          <small className="grey-text">
                            Supported formats: PDF, DOC, DOCX (max 10MB)
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Information */}
                <div className="row">
                  <div className="input-field col s12 m6">
                    <i className="material-icons prefix">person</i>
                    <input
                      id="candidateName"
                      type="text"
                      className={errors.candidateName ? 'invalid' : ''}
                      {...register('candidateName')}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="candidateName">Candidate Name *</label>
                    {errors.candidateName && (
                      <span className="helper-text red-text">
                        {errors.candidateName.message}
                      </span>
                    )}
                  </div>

                  <div className="input-field col s12 m6">
                    <i className="material-icons prefix">email</i>
                    <input
                      id="candidateEmail"
                      type="email"
                      className={errors.candidateEmail ? 'invalid' : ''}
                      {...register('candidateEmail')}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="candidateEmail">Email</label>
                    {errors.candidateEmail && (
                      <span className="helper-text red-text">
                        {errors.candidateEmail.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="input-field col s12 m6">
                    <i className="material-icons prefix">phone</i>
                    <input
                      id="candidatePhone"
                      type="text"
                      className={errors.candidatePhone ? 'invalid' : ''}
                      {...register('candidatePhone')}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="candidatePhone">Phone</label>
                    {errors.candidatePhone && (
                      <span className="helper-text red-text">
                        {errors.candidatePhone.message}
                      </span>
                    )}
                  </div>

                  <div className="input-field col s12 m6">
                    <i className="material-icons prefix">work</i>
                    <input
                      id="experienceYears"
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      className={errors.experienceYears ? 'invalid' : ''}
                      {...register('experienceYears', { valueAsNumber: true })}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="experienceYears">Experience (Years)</label>
                    {errors.experienceYears && (
                      <span className="helper-text red-text">
                        {errors.experienceYears.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="input-field col s12">
                    <i className="material-icons prefix">code</i>
                    <textarea
                      id="skills"
                      className={`materialize-textarea ${errors.skills ? 'invalid' : ''}`}
                      {...register('skills')}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    {errors.skills && (
                      <span className="helper-text red-text">
                        {errors.skills.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="input-field col s12">
                    <i className="material-icons prefix">note</i>
                    <textarea
                      id="notes"
                      className={`materialize-textarea ${errors.notes ? 'invalid' : ''}`}
                      {...register('notes')}
                      disabled={uploadMutation.isLoading}
                    />
                    <label htmlFor="notes">Notes</label>
                    {errors.notes && (
                      <span className="helper-text red-text">
                        {errors.notes.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col s12 center-align">
                    <button
                      type="submit"
                      className="btn waves-effect waves-light teal"
                      disabled={uploadMutation.isLoading || !file}
                    >
                      {uploadMutation.isLoading ? (
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
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="material-icons left">cloud_upload</i>
                          Upload Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;