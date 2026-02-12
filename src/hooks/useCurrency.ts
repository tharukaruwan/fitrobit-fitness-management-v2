import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentCurrency, type Currency } from '@/store/currencySlice';

export function useCurrency() {
  const currency = useAppSelector(selectCurrentCurrency);

  const formatCurrency = useCallback(
    (amount: number, options?: { showDecimals?: boolean }): string => {
      const { showDecimals = true } = options || {};
      
      const decimals = showDecimals ? currency.decimals : 0;
      
      // Format the number with proper separators
      const parts = amount.toFixed(decimals).split('.');
      const integerPart = parts[0].replace(
        /\B(?=(\d{3})+(?!\d))/g,
        currency.thousandsSeparator
      );
      
      let formattedNumber = integerPart;
      if (decimals > 0 && parts[1]) {
        formattedNumber += currency.decimalSeparator + parts[1];
      }
      
      // Position the symbol
      if (currency.position === 'before') {
        return `${currency.symbol}${formattedNumber}`;
      } else {
        return `${formattedNumber}${currency.symbol}`;
      }
    },
    [currency]
  );

  const formatCompact = useCallback(
    (amount: number): string => {
      if (amount >= 1000000) {
        return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `${currency.symbol}${(amount / 1000).toFixed(1)}k`;
      }
      return formatCurrency(amount);
    },
    [currency, formatCurrency]
  );

  return {
    currency,
    formatCurrency,
    formatCompact,
    symbol: currency.symbol,
    code: currency.code,
  };
}

export type { Currency };
