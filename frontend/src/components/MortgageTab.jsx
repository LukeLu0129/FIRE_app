import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, AlertTriangle, RefreshCcw } from 'lucide-react';
import { FREQ_LABELS } from '../constants';

const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatLargeCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};

export default function MortgageTab({ state, setState, results }) {
    const { principal, offsetBalance, interestRate, userRepayment, propertyValue, growthRate, loanTermYears, repaymentFreq } = state.mortgageParams;

    // Use backend calculated mechanics
    const { min_repayment, budget_repayment, actual_repayment, first_period_interest, max_capacity } = results.mortgage_mechanics;
    const simData = results.mortgage_projection;

    const sliderMin = min_repayment;
    const sliderMax = Math.max(min_repayment * 1.1, max_capacity);

    const isBelowInterest = actual_repayment < first_period_interest;

    const payoffActual = simData.find(d => d.balanceActual === 0)?.year || loanTermYears;
    const payoffStandard = simData.find(d => d.balanceStandard === 0)?.year || loanTermYears;

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
            <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto shrink-0">
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Home className="w-5 h-5" /> Loan Details</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mortgage Balance</label>
                            <input type="number" value={principal} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, principal: Number(e.target.value) } })} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Offset / Redraw Balance</label>
                            <input type="number" value={offsetBalance} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, offsetBalance: Number(e.target.value) } })} className="w-full border rounded px-3 py-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold" />
                            <p className="text-[10px] text-slate-400 mt-1">Reduces interest charged immediately.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rate (%)</label>
                            <input type="number" step="0.1" value={interestRate} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, interestRate: Number(e.target.value) } })} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Term (Yrs)</label>
                            <input type="number" value={loanTermYears} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, loanTermYears: Number(e.target.value) } })} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>

                    {/* Repayment Slider Control */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Repayment</span>
                            <select
                                className="text-[10px] border rounded px-1 py-0.5 bg-white"
                                value={repaymentFreq}
                                onChange={(e) => {
                                    const newFreq = e.target.value;
                                    // Reset user repayment to null when changing freq to force recalculation/default to budget
                                    setState({ ...state, mortgageParams: { ...state.mortgageParams, repaymentFreq: newFreq, userRepayment: null } });
                                }}
                            >
                                <option value="week">Weekly</option>
                                <option value="fortnight">Fortnightly</option>
                                <option value="month">Monthly</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <p className="text-2xl font-bold text-slate-700">{formatCurrency(actual_repayment)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Minimum: {formatCurrency(min_repayment)}
                            </p>
                        </div>

                        <input
                            type="range"
                            min={sliderMin}
                            max={sliderMax}
                            step={10}
                            value={Math.max(sliderMin, actual_repayment)}
                            onChange={(e) => setState({ ...state, mortgageParams: { ...state.mortgageParams, userRepayment: Number(e.target.value) } })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />

                        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                            <span>Min</span>
                            <span>Max ({formatCurrency(max_capacity)})</span>
                        </div>

                        {isBelowInterest && (
                            <div className="flex items-start gap-2 p-2 mt-3 bg-red-100 rounded border border-red-200 text-red-700 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Warning: Below Interest ({formatCurrency(first_period_interest)})</span>
                            </div>
                        )}

                        <div className="mt-3 text-center">
                            <button
                                onClick={() => setState({ ...state, mortgageParams: { ...state.mortgageParams, userRepayment: budget_repayment } })}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-center"
                            >
                                <RefreshCcw className="w-3 h-3" /> Reset to Budgeted Amount ({formatCurrency(budget_repayment)})
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Property Value (Current)</label>
                        <input type="number" value={propertyValue} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, propertyValue: Number(e.target.value) } })} className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Property Growth (%) p.a.</label>
                        <input type="number" value={growthRate} onChange={e => setState({ ...state, mortgageParams: { ...state.mortgageParams, growthRate: Number(e.target.value) } })} className="w-20 border rounded px-3 py-2" />
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Mortgage Trajectory</h3>
                        <p className="text-sm text-slate-500">Equity & Offset Projection</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Mortgage Free In</p>
                            <p className="text-xl font-bold text-blue-600">{payoffActual} Years</p>
                            {payoffActual < payoffStandard && <p className="text-[10px] text-emerald-500">Saved {payoffStandard - payoffActual} years</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Projected Equity (30y)</p>
                            <p className="text-xl font-bold text-emerald-600">{formatLargeCurrency(simData[simData.length - 1]?.equity || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={simData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                            <YAxis tickFormatter={formatLargeCurrency} />
                            <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                            <Legend />
                            <Area type="monotone" dataKey="property" name="Property Value" stroke="#10b981" fill="url(#equityGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="balanceStandard" name="Minimum Schedule" stroke="#94a3b8" fill="none" strokeDasharray="5 5" strokeWidth={2} />
                            <Area type="monotone" dataKey="balanceActual" name="Your Trajectory" stroke="#ef4444" fill="none" strokeWidth={3} />
                            <Area type="monotone" dataKey="redraw" name="Accrued Redraw/Offset" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={0} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </main>
        </div>
    );
}
