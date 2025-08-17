import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Query to check current user
  const { isLoading } = useQuery(
    'currentUser',
    api.auth.me,
    {
      retry: false,
      onSuccess: (data) => {
        setUser(data.user);
        setLoading(false);
      },
      onError: () => {
        setUser(null);
        setLoading(false);
      }
    }
  );

  // Login mutation
  const loginMutation = useMutation(api.auth.login, {
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData('currentUser', data);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation(api.auth.logout, {
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      queryClient.setQueryData('currentUser', null);
    }
  });

  const login = async (credentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  const value = {
    user,
    loading: loading || isLoading,
    login,
    logout,
    isLoggingIn: loginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};