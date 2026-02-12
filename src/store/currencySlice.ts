import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const supportedCurrencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before', decimals: 2, thousandsSeparator: '.', decimalSeparator: ',' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before', decimals: 0, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', position: 'before', decimals: 0, thousandsSeparator: '.', decimalSeparator: ',' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', position: 'before', decimals: 2, thousandsSeparator: ' ', decimalSeparator: ',' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', position: 'before', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.' },
];

// Get initial currency from localStorage or default to USD
const getInitialCurrency = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('currency');
    if (saved && supportedCurrencies.find(c => c.code === saved)) {
      return saved;
    }
  }
  return 'USD';
};

interface CurrencyState {
  currentCurrency: string;
}

const initialState: CurrencyState = {
  currentCurrency: getInitialCurrency(),
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currentCurrency = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currency', action.payload);
      }
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;

// Selector to get current currency object
export const selectCurrentCurrency = (state: { currency: CurrencyState }): Currency => {
  return supportedCurrencies.find(c => c.code === state.currency.currentCurrency) || supportedCurrencies[0];
};
