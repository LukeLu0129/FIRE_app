import { useState } from 'react';
import { Settings, DollarSign, CreditCard, Home, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import SettingsModal from './SettingsModal';
import clsx from 'clsx';

export default function Layout({ children, activeTab, onTabChange }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { settings } = useStore();

    const tabs = [
        { id: 'income', label: 'Income', icon: DollarSign },
        { id: 'expense', label: 'Expense', icon: CreditCard },
        { id: 'mortgage', label: 'Mortgage', icon: Home, hidden: settings.is_renting },
        { id: 'networth', label: 'Net Worth', icon: TrendingUp },
    ].filter(t => !t.hidden);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <TrendingUp className="text-white h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Start your FIRE</h1>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Settings size={24} />
                    </button>
                </div>

                {/* Mobile/Desktop Tabs */}
                <div className="max-w-5xl mx-auto px-4">
                    <nav className="flex space-x-1 overflow-x-auto no-scrollbar" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={clsx(
                                        'flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                                        isActive
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    )}
                                >
                                    <Icon className={clsx('mr-2 h-4 w-4', isActive ? 'text-blue-600' : 'text-gray-400')} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4">
                {children}
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}
