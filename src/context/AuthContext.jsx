import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/profile/view', {
          withCredentials: true
        });
        setUser(response.data);
        
        // Get token from cookies
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        };
        
        const jwtToken = getCookie('token');
        setToken(jwtToken);
        
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Not authenticated');
        // Try to get from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (emailId, password) => {
    try {
      const response = await axios.post('http://localhost:3000/login', {
        emailId,
        password
      }, {
        withCredentials: true
      });
      
      const profileResponse = await axios.get('http://localhost:3000/profile/view', {
        withCredentials: true
      });
      
      setUser(profileResponse.data);
      localStorage.setItem('user', JSON.stringify(profileResponse.data));
      
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };
      
      const jwtToken = getCookie('token');
      setToken(jwtToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};