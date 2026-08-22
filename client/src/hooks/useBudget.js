import { useState, useCallback } from 'react';
import api from '../services/api';

export const useBudget = (tripId) => {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBudget = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await api.get(`/budget/trips/${tripId}/budget`);
      setBudget(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch budget');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const fetchExpenses = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await api.get(`/budget/trips/${tripId}/expenses`);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const addExpense = async (expenseData) => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await api.post(`/budget/trips/${tripId}/expenses`, expenseData);
      setExpenses((prev) => [...prev, data]);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to add expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/budget/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { budget, expenses, loading, error, fetchBudget, fetchExpenses, addExpense, deleteExpense };
};
