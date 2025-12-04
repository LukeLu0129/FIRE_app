import { useState, useEffect } from 'react';
import { Activity, Settings } from 'lucide-react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { calculateAll } from './lib/api';
import { useDebounce } from './hooks/useDebounce';
import SettingsModal from './components/SettingsModal';
import IncomeTab from './components/IncomeTab';
import ExpenseTab from './components/ExpenseTab';
import MortgageTab from './components/MortgageTab';
import NetWorthTab from './components/NetWorthTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('income');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { state, setState, loading: stateLoading, profiles, setProfiles, currentProfileId, setCurrentProfileId } = useLocalStorageState();
  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  const debouncedState = useDebounce(state, 500);

  useEffect(() => {
    if (!debouncedState) return;

    const fetchData = async () => {
      setCalculating(true);
      setError(null);
      try {
        const res = await calculateAll(debouncedState);
        setResults(res);
      } catch (err) {
        console.error("Calculation failed", err);
        setError("Failed to connect to calculation engine.");
      } finally {
        setCalculating(false);
      }
    };

    fetchData();
  }, [debouncedState]);

  if (stateLoading || !results) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 animate-pulse">Loading Your FIRE Plan...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.userSettings}
        onUpdate={(s) => setState({ ...state, userSettings: s })}
        profiles={profiles}
        setProfiles={setProfiles}
        currentProfileId={currentProfileId}
        setCurrentProfileId={setCurrentProfileId}
      />

      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg"><Activity className="w-5 h-5 text-white" /></div>
          <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Start your FIRE <span className="text-xs font-normal text-slate-400 ml-1">v0.0.10</span></h1>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {['income', 'expense'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab}
            </button>
          ))}
          {!state.userSettings.isRenting && (
            <button onClick={() => setActiveTab('mortgage')} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === 'mortgage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Mortgage
            </button>
          )}
          <button onClick={() => setActiveTab('networth')} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === 'networth' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Net Worth
          </button>
        </div>

        <div className="flex items-center gap-2">
          {calculating && <span className="text-xs text-slate-400 animate-pulse">Syncing...</span>}
          {error && <span className="text-xs text-red-500">Offline</span>}
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full ml-2"><Settings className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'income' && <IncomeTab state={state} setState={setState} results={results} />}
        {activeTab === 'expense' && <ExpenseTab state={state} setState={setState} results={results} />}
        {activeTab === 'mortgage' && <MortgageTab state={state} setState={setState} results={results} />}
        {activeTab === 'networth' && <NetWorthTab state={state} setState={setState} results={results} />}
      </div>
    </div>
  );
}
