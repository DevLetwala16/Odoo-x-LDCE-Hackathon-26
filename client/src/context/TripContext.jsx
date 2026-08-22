import React, { createContext, useReducer, useCallback } from 'react';
import { tripService } from '../services/tripService';

const initialState = {
  trips: [],
  currentTrip: null,
  loading: false,
  error: null,
};

function tripReducer(state, action) {
  switch (action.type) {
    case 'REQUEST_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TRIPS_SUCCESS':
      return { ...state, loading: false, trips: action.payload, error: null };
    case 'FETCH_TRIP_SUCCESS':
      return { ...state, loading: false, currentTrip: action.payload, error: null };
    case 'CREATE_TRIP_SUCCESS':
      return { ...state, loading: false, trips: [...state.trips, action.payload], error: null };
    case 'UPDATE_TRIP_SUCCESS':
      return {
        ...state,
        loading: false,
        trips: state.trips.map(trip => (trip.id === action.payload.id ? action.payload : trip)),
        currentTrip: state.currentTrip?.id === action.payload.id ? action.payload : state.currentTrip,
        error: null,
      };
    case 'DELETE_TRIP_SUCCESS':
      return {
        ...state,
        loading: false,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip,
        error: null,
      };
    case 'REQUEST_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const fetchTrips = useCallback(async (params) => {
    dispatch({ type: 'REQUEST_START' });
    try {
      const data = await tripService.getTrips(params);
      dispatch({ type: 'FETCH_TRIPS_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'REQUEST_FAIL', payload: error.message || 'Failed to fetch trips' });
    }
  }, []);

  const fetchTripById = useCallback(async (id) => {
    dispatch({ type: 'REQUEST_START' });
    try {
      const data = await tripService.getTripById(id);
      dispatch({ type: 'FETCH_TRIP_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'REQUEST_FAIL', payload: error.message || 'Failed to fetch trip' });
    }
  }, []);

  const createTrip = async (tripData) => {
    dispatch({ type: 'REQUEST_START' });
    try {
      const data = await tripService.createTrip(tripData);
      dispatch({ type: 'CREATE_TRIP_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'REQUEST_FAIL', payload: error.message || 'Failed to create trip' });
      throw error;
    }
  };

  const updateTrip = async (id, tripData) => {
    dispatch({ type: 'REQUEST_START' });
    try {
      const data = await tripService.updateTrip(id, tripData);
      dispatch({ type: 'UPDATE_TRIP_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'REQUEST_FAIL', payload: error.message || 'Failed to update trip' });
      throw error;
    }
  };

  const deleteTrip = async (id) => {
    dispatch({ type: 'REQUEST_START' });
    try {
      await tripService.deleteTrip(id);
      dispatch({ type: 'DELETE_TRIP_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'REQUEST_FAIL', payload: error.message || 'Failed to delete trip' });
      throw error;
    }
  };

  return (
    <TripContext.Provider value={{ ...state, fetchTrips, fetchTripById, createTrip, updateTrip, deleteTrip }}>
      {children}
    </TripContext.Provider>
  );
};
