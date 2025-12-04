import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Trash2, HelpCircle, Info } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatLargeCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};

export default function NetWorthTab({ state, setState, results }) {
    const simData = results.net_worth_projection;
    const fireYear = simData.find(d => d.netWorth >= d.fireTarget)?.year;

    // Get velocity from the first year of projection (or 0 if empty)
    const initialVelocity = simData.length > 0 ? simData[0].velocity : 0;

    // Use the fireTarget from the first year of projection as the current target display
    const currentFireTarget = simData.length > 0 ? simData[0].fireTarget : 0;

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
            <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Assets</h3>
                    <div className="space-y-2 mb-4">
                        {state.assets.map((item, idx) => (
                            <div key={item.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <input className="font-medium text-slate-700 bg-transparent border-b border-transparent focus:border-blue-300 outline-none text-sm w-1/2" value={item.name} onChange={e => {
                                        const newAssets = [...state.assets]; newAssets[idx].name = e.target.value; setState({ ...state, assets: newAssets });
                                    }} />
                                    <button onClick={() => setState({ ...state, assets: state.assets.filter(a => a.id !== item.id) })} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </div>
                                <div className="flex justify-between items-center text-sm gap-2">
                                    <div className="relative flex-1">
                                        <DollarSign className="w-3 h-3 absolute top-2 left-1 text-slate-400" />
                                        <input type="number" className="w-full pl-4 py-1 border rounded text-slate-700 font-bold" value={item.value} onChange={e => {
                                            const newAssets = [...state.assets]; newAssets[idx].value = Number(e.target.value); setState({ ...state, assets: newAssets });
                                        }} />
                                    </div>
                                    <select className="border rounded px-1 py-1 text-xs w-20" value={item.category} onChange={e => {
                                        const newAssets = [...state.assets]; newAssets[idx].category = e.target.value; setState({ ...state, assets: newAssets });
                                    }}>
                                        {state.assetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border w-24">
                                        <input type="number" step="0.1" className="w-full text-right outline-none font-semibold text-blue-600" value={item.growthRate} onChange={(e) => {
                                            const newAssets = [...state.assets]; newAssets[idx].growthRate = Number(e.target.value); setState({ ...state, assets: newAssets });
                                        }} />
                                        <span className="text-xs">%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <button onClick={() => {
                            setState({ ...state, assets: [...state.assets, { id: Date.now().toString(), name: 'New Asset', value: 0, category: 'Shares', growthRate: 7 }] });
                        }} className="w-full bg-blue-600 text-white py-2 rounded font-medium text-sm">Add Asset</button>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-2/3 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">FIRE & Net Worth</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-500">Target:</p>
                                <div className="relative w-32">
                                    <DollarSign className="w-3 h-3 absolute top-1.5 left-1 text-slate-400" />
                                    <input
                                        type="number"
                                        value={state.fireTargetOverride !== null ? state.fireTargetOverride : currentFireTarget}
                                        onChange={(e) => setState({ ...state, fireTargetOverride: Number(e.target.value) })}
                                        placeholder={currentFireTarget}
                                        className="w-full pl-4 py-0.5 border rounded text-sm font-bold text-orange-500 border-orange-200 bg-orange-50"
                                    />
                                </div>
                                <div className="group relative z-50">
                                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                    <div className="absolute right-0 top-6 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <p className="font-bold mb-1">The 4% Rule</p>
                                        <p className="mb-2">Standard FIRE assumes you can withdraw 4% of your portfolio annually. This requires a net worth of <strong>25x your annual expenses</strong>.</p>
                                        <p className="mb-1"><strong>Lean FIRE:</strong> &lt; $40k expenses (Target ~$1M)</p>
                                        <p><strong>Fat FIRE:</strong> &gt; $100k expenses (Target ~$2.5M+)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold">Time to FIRE</p>
                        <p className="text-2xl font-bold text-orange-500">{fireYear ? `${fireYear} Years` : '> 30 Years'}</p>
                    </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={simData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={formatLargeCurrency} />
                            <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                            <Legend />
                            <Area type="monotone" dataKey="netWorth" name="Net Worth (Assets + Prop - Debt)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
                            <Line type="monotone" dataKey="fireTarget" name="FIRE Target" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm text-slate-500">
                    <span className="text-xs">
                        Net Worth = (Property + Liquid Assets) - Mortgage Debt
                    </span>
                    {!state.userSettings.isRenting && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Wealth Velocity:</span>
                            <span className="font-bold text-emerald-700">{formatCurrency(initialVelocity)}/yr</span>
                            <div className="group relative">
                                <Info className="w-3 h-3 text-slate-400 cursor-help" />
                                <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                                    Your total annual wealth creation (Cash Surplus + Principal Paydown).
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
