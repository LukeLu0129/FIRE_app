import { useState, useMemo } from 'react';
import { DollarSign, Edit2, Link as LinkIcon, Trash2, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { FREQ_MULTIPLIERS, FREQ_LABELS, COLORS, formatCurrency } from '../constants';

export default function ExpenseTab({ state, setState, results }) {
    const [displayPeriod, setDisplayPeriod] = useState('month');
    const [newExp, setNewExp] = useState({ name: '', amount: '', freqVal: '1', freqUnit: 'month', cat: 'Mortgage/Rent' });
    const [editingId, setEditingId] = useState(null);
    const [showCatManager, setShowCatManager] = useState(false);
    const [newCatName, setNewCatName] = useState('');

    const { annual_summary, expense_analysis } = results;
    const surplusAnnual = annual_summary.surplus;
    const totalExpenseAnnual = annual_summary.total_expenses;

    const getAnnualCost = (item) => (item.amount * FREQ_MULTIPLIERS[item.freqUnit]) / item.freqValue;
    const getDisplayedCost = (annualCost) => annualCost / FREQ_MULTIPLIERS[displayPeriod];
    const displayedSurplus = getDisplayedCost(surplusAnnual);

    const groupedExpenses = useMemo(() => {
        const groups = {};
        state.expenses.forEach(e => {
            if (!groups[e.category]) groups[e.category] = [];
            groups[e.category].push(e);
        });
        return groups;
    }, [state.expenses]);

    const pieData = expense_analysis.category_split;

    const handleEdit = (item) => {
        setNewExp({
            name: item.name,
            amount: item.amount.toString(),
            freqVal: item.freqValue.toString(),
            freqUnit: item.freqUnit,
            cat: item.category
        });
        setEditingId(item.id);
    };

    const handleCancelEdit = () => {
        setNewExp({ name: '', amount: '', freqVal: '1', freqUnit: 'month', cat: 'Mortgage/Rent' });
        setEditingId(null);
    };

    return (
        <div className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-y-auto">
            <div className="w-full md:w-1/3 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">{editingId ? 'Update Expense' : 'Add Expense'}</h3>
                        {editingId && (
                            <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:underline">Cancel</button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <input placeholder="Description" className="w-full border rounded px-3 py-2 text-sm" value={newExp.name} onChange={e => setNewExp({ ...newExp, name: e.target.value })} />
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="relative flex-1 min-w-[100px]">
                                <DollarSign className="w-3 h-3 absolute top-3 left-2 text-slate-400" />
                                <input type="number" placeholder="0" className="w-full border rounded pl-6 pr-2 py-2 text-sm" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">per</span>
                                <input type="number" className="w-12 border rounded px-1 py-2 text-center text-sm" value={newExp.freqVal} onChange={e => setNewExp({ ...newExp, freqVal: e.target.value })} />
                                <select className="border rounded px-1 py-2 text-sm" value={newExp.freqUnit} onChange={e => setNewExp({ ...newExp, freqUnit: e.target.value })}>
                                    {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-semibold text-slate-500">Category</label>
                                <button onClick={() => setShowCatManager(!showCatManager)} className="text-[10px] text-blue-500 hover:underline">{showCatManager ? 'Done' : 'Manage'}</button>
                            </div>
                            {showCatManager ? (
                                <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                                    <div className="flex gap-2 mb-2">
                                        <input placeholder="New Category" className="flex-1 text-xs border rounded px-2" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                                        <button onClick={() => {
                                            if (newCatName && !state.expenseCategories.includes(newCatName)) {
                                                setState(s => ({ ...s, expenseCategories: [...s.expenseCategories, newCatName] }));
                                                setNewCatName('');
                                            }
                                        }} className="bg-blue-600 text-white px-2 rounded text-xs">Add</button>
                                    </div>
                                    <div className="max-h-20 overflow-y-auto space-y-1">
                                        {state.expenseCategories.map(c => (
                                            <div key={c} className="flex justify-between text-xs px-1">
                                                <span>{c}</span>
                                                {!['Mortgage/Rent', 'Food'].includes(c) && <button onClick={() => setState(s => ({ ...s, expenseCategories: s.expenseCategories.filter(cat => cat !== c) }))}><X className="w-3 h-3 text-red-400" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <select className="w-full border rounded px-3 py-2 text-sm" value={newExp.cat} onChange={e => setNewExp({ ...newExp, cat: e.target.value })}>
                                    {state.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                        </div>

                        <button onClick={() => {
                            if (!newExp.name || !newExp.amount) return;

                            if (editingId) {
                                const updatedExpenses = state.expenses.map(e => e.id === editingId ? {
                                    ...e,
                                    name: newExp.name,
                                    amount: parseFloat(newExp.amount),
                                    freqValue: parseFloat(newExp.freqVal),
                                    freqUnit: newExp.freqUnit,
                                    category: newExp.cat,
                                    isMortgageLink: newExp.cat === 'Mortgage/Rent'
                                } : e);
                                setState(s => ({ ...s, expenses: updatedExpenses }));
                                setEditingId(null);
                            } else {
                                setState(s => ({
                                    ...s, expenses: [...s.expenses, {
                                        id: Date.now().toString(), name: newExp.name, amount: parseFloat(newExp.amount), freqValue: parseFloat(newExp.freqVal), freqUnit: newExp.freqUnit, category: newExp.cat, isMortgageLink: newExp.cat === 'Mortgage/Rent'
                                    }]
                                }));
                            }
                            setNewExp({ ...newExp, name: '', amount: '', freqVal: '1' });
                        }} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">
                            {editingId ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 h-[300px]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase text-center mb-2">Category Split (% of Total Expenses)</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="w-full md:w-2/3 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">Expense List</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">View as:</span>
                        <select className="text-xs border rounded px-2 py-1" value={displayPeriod} onChange={e => setDisplayPeriod(e.target.value)}>
                            {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>

                {/* Mortgage Link Explainer - ADDED FROM USER REQUEST */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded mb-4 flex gap-3">
                    <LinkIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-emerald-800">Mortgage Repayment Link</p>
                        <p className="text-[10px] text-emerald-700 whitespace-normal">Expenses with this icon are automatically summed as your <strong>Actual Repayment</strong> in the Mortgage Tab (if "Link from Expenses" is selected). This lets you itemize payments (e.g. standard repayment + offset contributions) separately here but project them together.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {Object.entries(groupedExpenses).map(([category, items]) => {
                        const catTotalAnnual = items.reduce((acc, i) => acc + getAnnualCost(i), 0);
                        const catPercentIncome = annual_summary.net_income > 0 ? (catTotalAnnual / annual_summary.net_income) * 100 : 0;

                        return (
                            <div key={category}>
                                <div className="flex justify-between items-center mb-2 px-2 bg-slate-50 py-1 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{catPercentIncome.toFixed(1)}% of Net Income</span>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{category}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{formatCurrency(getDisplayedCost(catTotalAnnual))} total</span>
                                </div>
                                <div className="space-y-1 pl-2">
                                    {items.map(item => {
                                        const annualItemCost = getAnnualCost(item);
                                        const itemPercent = annual_summary.net_income > 0 ? (annualItemCost / annual_summary.net_income) * 100 : 0;

                                        return (
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border-b border-slate-100 last:border-0 group hover:bg-slate-50 gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-800 text-xs whitespace-normal">{item.name}</p>
                                                        {item.isMortgageLink && <LinkIcon className="w-3 h-3 text-emerald-500 shrink-0" title="Linked to Mortgage Projector" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-blue-400 font-medium">{itemPercent.toFixed(2)}% of Net</span>
                                                        <span className="text-[10px] text-slate-400">• ${item.amount} / {item.freqValue > 1 ? item.freqValue + ' ' : ''}{item.freqUnit}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-semibold text-slate-600 text-xs">{formatCurrency(getDisplayedCost(annualItemCost))}</p>
                                                    <button onClick={() => handleEdit(item)} className="p-1 rounded transition-colors text-slate-300 hover:text-blue-500" title="Edit">
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => {
                                                        const newExps = state.expenses.map(e => e.id === item.id ? { ...e, isMortgageLink: !e.isMortgageLink } : e);
                                                        setState({ ...state, expenses: newExps });
                                                    }} className={`p-1 rounded transition-colors ${item.isMortgageLink ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`} title="Toggle Mortgage Link">
                                                        <LinkIcon className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== item.id) }))} className="text-slate-300 hover:text-red-500">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded">
                        <p className="text-xs text-red-600 uppercase font-bold">Total Expenses ({FREQ_LABELS[displayPeriod]})</p>
                        <p className="text-xl font-bold text-red-800">{formatCurrency(getDisplayedCost(totalExpenseAnnual))}</p>
                    </div>
                    <div className={`p-3 rounded ${surplusAnnual > 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                        <p className={`text-xs uppercase font-bold ${surplusAnnual > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>Surplus ({FREQ_LABELS[displayPeriod]})</p>
                        <p className={`text-xl font-bold ${surplusAnnual > 0 ? 'text-emerald-800' : 'text-orange-800'}`}>{formatCurrency(displayedSurplus)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
