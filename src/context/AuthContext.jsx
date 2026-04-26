import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('foodAppUser');
  });
  
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('foodAppUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);

  const login = async (username, password, hotelId) => {
    setLoading(true);
    try {
      // API call using fetch with credentials: "include"
      const response = await loginApi({ username, password, hotelId });
      
      if (response && response.success) {
        const userData = { 
          username: response.name || username, 
          hotelId: hotelId, 
          userImage: response.img || "",
          hotelName: response.hotel_name || "",
          hotelAddress: response.hotel_address || "",
          hotelLogo: response.hotellogo || "",
          role: 'admin' 
        };
        setIsAuthenticated(true);
        setUser(userData);
        // Persist safely in localStorage (No JWTs, just UI state)
        localStorage.setItem('foodAppUser', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Server error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear state
    setIsAuthenticated(false);
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('foodAppUser');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

