import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const LoginPage = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data);
      navigate('/resumes');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ marginTop: '5rem' }}>
      <div className="row">
        <div className="col s12 m6 offset-m3 l4 offset-l4">
          <div className="card">
            <div className="card-content">
              <div className="center-align mb-2">
                <i className="material-icons large teal-text">description</i>
                <h4 className="teal-text">RMS</h4>
                <p className="grey-text">Resume Management System</p>
              </div>

              {(error || loginError) && (
                <div className="error-message">
                  {error || loginError?.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-field">
                  <i className="material-icons prefix">account_circle</i>
                  <input
                    id="username"
                    type="text"
                    className={errors.username ? 'invalid' : ''}
                    {...register('username')}
                    disabled={isLoggingIn}
                  />
                  <label htmlFor="username">Username</label>
                  {errors.username && (
                    <span className="helper-text red-text">
                      {errors.username.message}
                    </span>
                  )}
                </div>

                <div className="input-field">
                  <i className="material-icons prefix">lock</i>
                  <input
                    id="password"
                    type="password"
                    className={errors.password ? 'invalid' : ''}
                    {...register('password')}
                    disabled={isLoggingIn}
                  />
                  <label htmlFor="password">Password</label>
                  {errors.password && (
                    <span className="helper-text red-text">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="center-align mt-2">
                  <button
                    type="submit"
                    className="btn waves-effect waves-light teal"
                    disabled={isLoggingIn}
                    style={{ width: '100%' }}
                  >
                    {isLoggingIn ? (
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
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="material-icons left">login</i>
                        Login
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="card-action center-align">
                <small className="grey-text">
                  Demo credentials:<br />
                  Admin: admin / admin123<br />
                  Recruiter: recruiter1 / recruiter123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;