import { useState, useEffect, useRef } from 'react';
import { fetchDefaults } from '../lib/api';

const FALLBACK_DEFAULTS = {
    userSettings: { name: '', isResident: true, hasPrivateHealth: false, hasHecsDebt: false, isRenting: false },
    incomes: [{ id: '1', name: 'Primary Salary', type: 'salary', amount: 120000, freqValue: 1, freqUnit: 'year', taxTreatment: 'tft', salaryPackaging: 0, adminFee: 0, superRate: 11.5, paygOverride: null }],
    deductions: [],
    expenses: [
        { id: '1', name: 'Mortgage Repayment', amount: 3500, freqValue: 1, freqUnit: 'month', category: 'Mortgage/Rent', isMortgageLink: true },
        { id: '2', name: 'Groceries', amount: 200, freqValue: 1, freqUnit: 'week', category: 'Food', isMortgageLink: false }
    ],
    expenseCategories: ['Mortgage/Rent', 'Food', 'Transport', 'Utilities', 'Insurance', 'Health', 'Entertainment', 'Debt', 'Savings', 'Other'],
    assets: [
        { id: '1', name: 'Vanguard ETF (VGS)', value: 50000, category: 'Shares', growthRate: 7.0 },
        { id: '2', name: 'Savings Account', value: 20000, category: 'Cash', growthRate: 4.5 }
    ],
    assetCategories: ['Shares', 'Cash', 'Crypto', 'Property (Inv)', 'Collectibles', 'Other'],
    mortgageParams: { principal: 500000, offsetBalance: 20000, interestRate: 6.0, loanTermYears: 30, userRepayment: null, repaymentFreq: 'month', propertyValue: 600000, growthRate: 3.0, useBudgetRepayment: true, useSurplus: false },
    fireTargetOverride: null
};

export function useLocalStorageState() {
    const [profiles, setProfiles] = useState([{ id: 'default', name: 'Default Profile' }]);
    const [currentProfileId, setCurrentProfileId] = useState('default');
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ref to track which profile is currently loaded in 'state'
    // This prevents the 'Save State' effect from overwriting a new profile with old data
    // during the transition period.
    const loadedProfileId = useRef(null);

    // Load Profiles
    useEffect(() => {
        const storedProfiles = localStorage.getItem('fire_planner_profiles');
        if (storedProfiles) setProfiles(JSON.parse(storedProfiles));

        const lastProfile = localStorage.getItem('fire_planner_current_profile_id');
        if (lastProfile) setCurrentProfileId(lastProfile);
    }, []);

    // Load State for Current Profile (Merged with Backend Defaults)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Important: Unset loaded profile so we don't save during fetch
            loadedProfileId.current = null;

            try {
                // 1. Fetch Defaults from Backend (or use Fallback)
                let defaults;
                try {
                    defaults = await fetchDefaults();
                } catch (err) {
                    console.warn("Backend defaults failed, using fallback:", err);
                    defaults = FALLBACK_DEFAULTS;
                }

                // 2. Load Local Storage
                const key = `fire_planner_data_${currentProfileId}`;
                const stored = localStorage.getItem(key);

                if (stored) {
                    const parsed = JSON.parse(stored);
                    // 3. Merge: Defaults provide structure, Local Storage provides values
                    setState({
                        ...defaults,
                        ...parsed,
                        userSettings: { ...defaults.userSettings, ...parsed.userSettings },
                        mortgageParams: { ...defaults.mortgageParams, ...parsed.mortgageParams }
                    });
                } else {
                    // No local data? Use defaults entirely
                    setState(defaults);
                }

                // Mark this profile as fully loaded
                loadedProfileId.current = currentProfileId;

            } catch (e) {
                console.error("Failed to load state:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentProfileId]);

    // Save State
    useEffect(() => {
        // Only save if not loading AND the state currently in memory belongs to the current profile
        if (!loading && state && loadedProfileId.current === currentProfileId) {
            localStorage.setItem(`fire_planner_data_${currentProfileId}`, JSON.stringify(state));
        }
    }, [state, currentProfileId, loading]);

    // Save Profiles
    useEffect(() => {
        localStorage.setItem('fire_planner_profiles', JSON.stringify(profiles));
        localStorage.setItem('fire_planner_current_profile_id', currentProfileId);
    }, [profiles, currentProfileId]);

    return { state, setState, loading, profiles, setProfiles, currentProfileId, setCurrentProfileId };
}
