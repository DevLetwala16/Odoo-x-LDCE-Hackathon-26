import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      const payload = action.payload?.data || action.payload;
      const token = payload?.token;
      const user = payload?.user;
      if (token) {
        localStorage.setItem('token', token);
      }
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: user || null,
        token: token || null,
      };
    }
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    case 'USER_LOADED': {
      const user = action.payload?.data?.user || action.payload?.user || action.payload;
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: user,
      };
    }
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    case 'UPDATE_PROFILE': {
      const updatedUser = action.payload?.data?.user || action.payload?.user || action.payload;
      return {
        ...state,
        user: { ...state.user, ...updatedUser },
      };
    }
    default:
      return state;
  }
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getMe();
          dispatch({ type: 'USER_LOADED', payload: res });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };
    loadUser();
  }, []);

  const login = async (credentialsOrUsername, maybePassword) => {
    try {
      const payload = typeof credentialsOrUsername === 'string'
        ? { username: credentialsOrUsername, password: maybePassword }
        : credentialsOrUsername;
      
      const res = await authService.login(payload);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res });
      return res;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res });
      return res;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (formData) => {
    try {
      const res = await authService.updateProfile(formData);
      dispatch({ type: 'UPDATE_PROFILE', payload: res });
      return res;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
