import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  fullName: z.string().max(120).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['admin', 'recruiter']),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const UsersPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createUserSchema)
  });

  // Fetch users
  const { data: usersData, isLoading, error: fetchError } = useQuery(
    'users',
    () => api.users.list()
  );

  // Create user mutation
  const createMutation = useMutation(api.users.create, {
    onSuccess: () => {
      setSuccess('User created successfully');
      setError('');
      setShowCreateForm(false);
      reset();
      queryClient.invalidateQueries('users');
    },
    onError: (error) => {
      setError(error.message);
      setSuccess('');
    }
  });

  // Update user mutation
  const updateMutation = useMutation(
    ({ id, data }) => api.users.update(id, data),
    {
      onSuccess: () => {
        setSuccess('User updated successfully');
        setError('');
        setEditingUser(null);
        queryClient.invalidateQueries('users');
      },
      onError: (error) => {
        setError(error.message);
        setSuccess('');
      }
    }
  );

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      role: formData.get('role')
    };

    updateMutation.mutate({ id: editingUser.id, data });
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

  if (fetchError) {
    return (
      <div className="container mt-2">
        <div className="error-message">
          Error loading users: {fetchError.message}
        </div>
      </div>
    );
  }

  const { users = [] } = usersData || {};

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="row">
        <div className="col s12">
          <h4>
            <i className="material-icons left">people</i>
            User Management
          </h4>
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

      {/* Create User Button */}
      <div className="row">
        <div className="col s12">
          <button
            className="btn waves-effect waves-light teal"
            onClick={() => {
              setShowCreateForm(true);
              setEditingUser(null);
              setError('');
              setSuccess('');
            }}
          >
            <i className="material-icons left">person_add</i>
            Create New User
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="row">
          <div className="col s12 m8 offset-m2">
            <div className="card">
              <div className="card-content">
                <span className="card-title">
                  <i className="material-icons left">person_add</i>
                  Create New User
                </span>

                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <div className="row">
                    <div className="input-field col s12 m6">
                      <i className="material-icons prefix">account_circle</i>
                      <input
                        id="username"
                        type="text"
                        className={errors.username ? 'invalid' : ''}
                        {...register('username')}
                        disabled={createMutation.isLoading}
                      />
                      <label htmlFor="username">Username *</label>
                      {errors.username && (
                        <span className="helper-text red-text">
                          {errors.username.message}
                        </span>
                      )}
                    </div>

                    <div className="input-field col s12 m6">
                      <i className="material-icons prefix">person</i>
                      <input
                        id="fullName"
                        type="text"
                        className={errors.fullName ? 'invalid' : ''}
                        {...register('fullName')}
                        disabled={createMutation.isLoading}
                      />
                      <label htmlFor="fullName">Full Name</label>
                      {errors.fullName && (
                        <span className="helper-text red-text">
                          {errors.fullName.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="input-field col s12 m6">
                      <i className="material-icons prefix">phone</i>
                      <input
                        id="phone"
                        type="text"
                        className={errors.phone ? 'invalid' : ''}
                        {...register('phone')}
                        disabled={createMutation.isLoading}
                      />
                      <label htmlFor="phone">Phone</label>
                      {errors.phone && (
                        <span className="helper-text red-text">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>

                    <div className="input-field col s12 m6">
                      <select
                        className={errors.role ? 'invalid' : ''}
                        {...register('role')}
                        disabled={createMutation.isLoading}
                        defaultValue="recruiter"
                      >
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                      <label>Role *</label>
                      {errors.role && (
                        <span className="helper-text red-text">
                          {errors.role.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="input-field col s12">
                      <i className="material-icons prefix">lock</i>
                      <input
                        id="password"
                        type="password"
                        className={errors.password ? 'invalid' : ''}
                        {...register('password')}
                        disabled={createMutation.isLoading}
                      />
                      <label htmlFor="password">Password *</label>
                      {errors.password && (
                        <span className="helper-text red-text">
                          {errors.password.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col s12">
                      <button
                        type="submit"
                        className="btn waves-effect waves-light teal"
                        disabled={createMutation.isLoading}
                      >
                        {createMutation.isLoading ? (
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
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="material-icons left">person_add</i>
                            Create User
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-flat waves-effect ml-1"
                        onClick={() => {
                          setShowCreateForm(false);
                          reset();
                        }}
                        disabled={createMutation.isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="row">
          <div className="col s12 m8 offset-m2">
            <div className="card">
              <div className="card-content">
                <span className="card-title">
                  <i className="material-icons left">edit</i>
                  Edit User: {editingUser.username}
                </span>

                <form onSubmit={handleUpdateSubmit}>
                  <div className="row">
                    <div className="input-field col s12 m6">
                      <i className="material-icons prefix">person</i>
                      <input
                        id="editFullName"
                        type="text"
                        name="fullName"
                        defaultValue={editingUser.fullName || ''}
                        disabled={updateMutation.isLoading}
                      />
                      <label htmlFor="editFullName" className="active">Full Name</label>
                    </div>

                    <div className="input-field col s12 m6">
                      <i className="material-icons prefix">phone</i>
                      <input
                        id="editPhone"
                        type="text"
                        name="phone"
                        defaultValue={editingUser.phone || ''}
                        disabled={updateMutation.isLoading}
                      />
                      <label htmlFor="editPhone" className="active">Phone</label>
                    </div>
                  </div>

                  <div className="row">
                    <div className="input-field col s12">
                      <select
                        name="role"
                        defaultValue={editingUser.role}
                        disabled={updateMutation.isLoading}
                      >
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                      <label>Role</label>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col s12">
                      <button
                        type="submit"
                        className="btn waves-effect waves-light"
                        disabled={updateMutation.isLoading}
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
                            Update User
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-flat waves-effect ml-1"
                        onClick={() => setEditingUser(null)}
                        disabled={updateMutation.isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="row">
        <div className="col s12">
          <div className="card">
            <div className="card-content">
              <span className="card-title">All Users ({users.length})</span>

              {users.length === 0 ? (
                <div className="center-align" style={{ padding: '2rem' }}>
                  <i className="material-icons large grey-text">people_outline</i>
                  <p className="grey-text">No users found</p>
                </div>
              ) : (
                <table className="responsive-table highlight">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.username}</strong>
                        </td>
                        <td>{user.fullName || '-'}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <span className={`chip ${user.role === 'admin' ? 'red' : 'blue'} white-text`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <button
                            className="btn-flat btn-small"
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <i className="material-icons">edit</i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;