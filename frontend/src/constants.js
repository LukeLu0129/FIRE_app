export const FREQ_MULTIPLIERS = { week: 52, fortnight: 26, month: 12, quarter: 4, year: 1 };
export const FREQ_LABELS = { week: 'Week', fortnight: 'Fortnight (F/N)', month: 'Month', quarter: 'Quarter', year: 'Year' };
export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#64748b'];

export const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

export const formatLargeCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};
