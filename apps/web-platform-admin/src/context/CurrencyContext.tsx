'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'PEN' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  rateAgainstUsd: number; // 1 USD = X Currency
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  PEN: {
    code: 'PEN',
    name: 'Soles',
    symbol: 'S/',
    flag: '🇵🇪',
    rateAgainstUsd: 3.75,
    decimals: 2,
  },
  USD: {
    code: 'USD',
    name: 'Dólares',
    symbol: '$',
    flag: '🇺🇸',
    rateAgainstUsd: 1.0,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euros',
    symbol: '€',
    flag: '🇪🇺',
    rateAgainstUsd: 0.92,
    decimals: 2,
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  config: CurrencyConfig;
  configs: Record<CurrencyCode, CurrencyConfig>;
  updateExchangeRate: (code: CurrencyCode, newRate: number) => void;
  formatMoney: (amountInUsd: number, options?: { showDecimals?: boolean; customCurrency?: CurrencyCode }) => string;
  convertFromUsd: (amountInUsd: number, targetCurrency?: CurrencyCode) => number;
  convertToUsd: (amountInCurrency: number, sourceCurrency?: CurrencyCode) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({
    USD: 1.0,
    PEN: 3.75,
    EUR: 0.92,
  });

  // Load persisted preference if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cole_platform_currency');
      if (saved && (saved === 'PEN' || saved === 'USD' || saved === 'EUR')) {
        setCurrencyState(saved as CurrencyCode);
      }
      const savedRates = localStorage.getItem('cole_platform_rates');
      if (savedRates) {
        setRates(JSON.parse(savedRates));
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('cole_platform_currency', c);
    } catch { /* ignore */ }
  };

  const updateExchangeRate = (code: CurrencyCode, newRate: number) => {
    if (newRate <= 0) return;
    setRates((prev) => {
      const updated = { ...prev, [code]: newRate };
      try {
        localStorage.setItem('cole_platform_rates', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  };

  const currentConfig: CurrencyConfig = {
    ...CURRENCY_CONFIGS[currency],
    rateAgainstUsd: rates[currency] ?? CURRENCY_CONFIGS[currency].rateAgainstUsd,
  };

  const convertFromUsd = (amountInUsd: number, targetCurrency?: CurrencyCode): number => {
    const target = targetCurrency ?? currency;
    const rate = rates[target] ?? CURRENCY_CONFIGS[target].rateAgainstUsd;
    return amountInUsd * rate;
  };

  const convertToUsd = (amountInCurrency: number, sourceCurrency?: CurrencyCode): number => {
    const source = sourceCurrency ?? currency;
    const rate = rates[source] ?? CURRENCY_CONFIGS[source].rateAgainstUsd;
    if (rate === 0) return amountInCurrency;
    return amountInCurrency / rate;
  };

  const formatMoney = (
    amountInUsd: number,
    options?: { showDecimals?: boolean; customCurrency?: CurrencyCode }
  ): string => {
    const target = options?.customCurrency ?? currency;
    const targetCfg = CURRENCY_CONFIGS[target];
    const rate = rates[target] ?? targetCfg.rateAgainstUsd;
    const converted = amountInUsd * rate;
    const showDecimals = options?.showDecimals ?? (converted % 1 !== 0);

    const formattedNum = converted.toLocaleString('es-PE', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    });

    return `${targetCfg.symbol} ${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        config: currentConfig,
        configs: {
          PEN: { ...CURRENCY_CONFIGS.PEN, rateAgainstUsd: rates.PEN },
          USD: { ...CURRENCY_CONFIGS.USD, rateAgainstUsd: rates.USD },
          EUR: { ...CURRENCY_CONFIGS.EUR, rateAgainstUsd: rates.EUR },
        },
        updateExchangeRate,
        formatMoney,
        convertFromUsd,
        convertToUsd,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
