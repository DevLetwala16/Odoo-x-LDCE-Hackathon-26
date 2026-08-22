import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

export const CurrencyProvider = ({ children }) => {
  // Available currencies: USD, EUR, INR
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('musafir_currency');
    return saved || 'INR';
  });

  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    INR: 83.5
  };

  const symbols = {
    USD: '$',
    EUR: '€',
    INR: '₹'
  };

  useEffect(() => {
    localStorage.setItem('musafir_currency', currency);
  }, [currency]);

  // Convert from INR (base for this project) to target currency
  const formatAmount = (amountInINR) => {
    if (!amountInINR) return `${symbols[currency]}0`;
    
    // Convert to USD first (base), then to target
    const amountInUSD = amountInINR / exchangeRates.INR;
    const finalAmount = amountInUSD * exchangeRates[currency];
    
    return `${symbols[currency]}${Math.round(finalAmount).toLocaleString()}`;
  };

  const convertAmount = (amountInINR) => {
    if (!amountInINR) return 0;
    const amountInUSD = amountInINR / exchangeRates.INR;
    return Math.round(amountInUSD * exchangeRates[currency]);
  };

  const value = {
    currency,
    setCurrency,
    formatAmount,
    convertAmount,
    symbols,
    availableCurrencies: ['INR', 'USD', 'EUR']
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
