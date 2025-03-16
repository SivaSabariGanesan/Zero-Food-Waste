import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'restaurant' | 'ngo' | 'orphanage';
  isVerified: boolean;
  address: string;
  phone: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRestaurant: boolean;
  isNGO: boolean;
  isOrphanage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const res = await axios.get(`${API_URL}/api/auth/me`, config);
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        console.error('Authentication error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Append all user data to formData
      Object.keys(userData).forEach(key => {
        if (key === 'documents' && userData[key]) {
          for (let i = 0; i < userData.documents.length; i++) {
            formData.append('documents', userData.documents[i]);
          }
        } else {
          formData.append(key, userData[key]);
        }
      });
      
      const res = await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Don't automatically log in after registration since verification is required
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isRestaurant = user?.role === 'restaurant';
  const isNGO = user?.role === 'ngo';
  const isOrphanage = user?.role === 'orphanage';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isRestaurant,
        isNGO,
        isOrphanage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};