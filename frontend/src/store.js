import { create } from 'zustand'

export const useStore = create((set) => ({
    // --- State ---
    incomes: [],
    expenses: [],
    assets: [],
    mortgage: {
        principal: 500000,
        offset_balance: 0,
        interest_rate: 6.0,
        loan_term_years: 30,
        property_value: 750000,
        property_growth_rate: 5.0,
        repayment_strategy: "minimum", // minimum, budgeted, manual
        manual_repayment: 0,
        use_aggressive_paydown: false,
    },
    settings: {
        display_name: "User",
        is_resident: true,
        has_private_hospital_cover: false,
        has_hecs_debt: false,
        is_renting: false,
    },

    // --- Actions ---
    setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),

    addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
    updateIncome: (index, income) => set((state) => {
        const newIncomes = [...state.incomes]
        newIncomes[index] = income
        return { incomes: newIncomes }
    }),
    removeIncome: (index) => set((state) => ({ incomes: state.incomes.filter((_, i) => i !== index) })),

    addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
    updateExpense: (index, expense) => set((state) => {
        const newExpenses = [...state.expenses]
        newExpenses[index] = expense
        return { expenses: newExpenses }
    }),
    removeExpense: (index) => set((state) => ({ expenses: state.expenses.filter((_, i) => i !== index) })),

    addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
    updateAsset: (index, asset) => set((state) => {
        const newAssets = [...state.assets]
        newAssets[index] = asset
        return { assets: newAssets }
    }),
    removeAsset: (index) => set((state) => ({ assets: state.assets.filter((_, i) => i !== index) })),

    updateMortgage: (mortgage) => set((state) => ({ mortgage: { ...state.mortgage, ...mortgage } })),
}))
