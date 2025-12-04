import { Plus, Trash2, DollarSign } from 'lucide-react';
import { FREQ_LABELS, formatCurrency } from '../constants';

export default function IncomeTab({ state, setState, results }) {
    const { annual_summary } = results;

    return (
        <div className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-y-auto">
            <div className="w-full md:w-1/2 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">Income Streams</h3>
                        <button onClick={() => setState(s => ({ ...s, incomes: [...s.incomes, { id: Date.now().toString(), name: 'New Source', type: 'salary', amount: 0, freqValue: 1, freqUnit: 'year', taxTreatment: 'no-tft', salaryPackaging: 0, superRate: 11.5, paygOverride: null }] }))} className="text-blue-600 text-sm flex items-center"><Plus className="w-4 h-4 mr-1" /> Add</button>
                    </div>
                    <div className="space-y-4">
                        {state.incomes.map((inc, idx) => (
                            <div key={inc.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50 relative group">
                                <button onClick={() => setState(s => ({ ...s, incomes: s.incomes.filter(i => i.id !== inc.id) }))} className="absolute top-3 right-3 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>

                                <div className="space-y-3 pr-8">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input value={inc.name} onChange={e => {
                                            const newIncs = [...state.incomes]; newIncs[idx].name = e.target.value; setState({ ...state, incomes: newIncs });
                                        }} className="flex-1 font-semibold text-slate-700 border-b border-transparent focus:border-blue-300 outline-none w-full sm:w-auto" placeholder="Income Name" />
                                        <select value={inc.type} onChange={e => {
                                            const newIncs = [...state.incomes];
                                            newIncs[idx].type = e.target.value;
                                            if (e.target.value === 'abn') { newIncs[idx].taxTreatment = 'abn'; newIncs[idx].superRate = 0; }
                                            if (e.target.value === 'salary') { newIncs[idx].superRate = 11.5; }
                                            setState({ ...state, incomes: newIncs });
                                        }} className="text-xs border rounded bg-slate-50 px-2 py-1 w-full sm:w-auto">
                                            <option value="salary">Salary (PAYG)</option>
                                            <option value="abn">ABN (Contractor)</option>
                                            <option value="other">Other (Invest)</option>
                                        </select>
                                    </div>

                                    {/* Salary Packaging Section */}
                                    {inc.type === 'salary' && (
                                        <div className="bg-white border border-slate-200 rounded p-2 text-xs space-y-2">
                                            <p className="font-semibold text-slate-500">Salary Packaging (Maxxia/RemServ style)</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Packaging Amount (Yearly)</label>
                                                    <div className="relative">
                                                        <DollarSign className="w-3 h-3 absolute top-1.5 left-1 text-slate-400" />
                                                        <input type="number" className="w-full pl-4 py-1 border rounded" placeholder="e.g. 9010" value={inc.salaryPackaging} onChange={e => {
                                                            const newIncs = [...state.incomes]; newIncs[idx].salaryPackaging = Number(e.target.value); setState({ ...state, incomes: newIncs });
                                                        }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400">Admin Fee (Yearly)</label>
                                                    <div className="relative">
                                                        <DollarSign className="w-3 h-3 absolute top-1.5 left-1 text-slate-400" />
                                                        <input type="number" className="w-full pl-4 py-1 border rounded" placeholder="e.g. 250" value={inc.adminFee} onChange={e => {
                                                            const newIncs = [...state.incomes]; newIncs[idx].adminFee = Number(e.target.value); setState({ ...state, incomes: newIncs });
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <div className="relative flex-1 min-w-[120px]">
                                            <DollarSign className="w-3 h-3 absolute top-2 left-2 text-slate-400" />
                                            <input type="number" value={inc.amount} onChange={e => {
                                                const newIncs = [...state.incomes]; newIncs[idx].amount = Number(e.target.value); setState({ ...state, incomes: newIncs });
                                            }} className="w-full pl-6 py-1 text-sm border rounded" placeholder="Amount" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">per</span>
                                            <input type="number" className="w-12 py-1 border rounded text-center text-sm" value={inc.freqValue} onChange={e => {
                                                const newIncs = [...state.incomes]; newIncs[idx].freqValue = Number(e.target.value); setState({ ...state, incomes: newIncs });
                                            }} />
                                            <select value={inc.freqUnit} onChange={e => {
                                                const newIncs = [...state.incomes]; newIncs[idx].freqUnit = e.target.value; setState({ ...state, incomes: newIncs });
                                            }} className="text-sm border rounded px-1 py-1 flex-1">
                                                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs items-center">
                                        {inc.type !== 'other' && (
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border">
                                                <span className="text-slate-500">Super</span>
                                                <input type="number" value={inc.superRate} onChange={e => {
                                                    const newIncs = [...state.incomes]; newIncs[idx].superRate = Number(e.target.value); setState({ ...state, incomes: newIncs });
                                                }} className="w-12 border-b outline-none text-center bg-transparent font-semibold" />
                                                <span>%</span>
                                            </div>
                                        )}

                                        {inc.type !== 'abn' && inc.type !== 'other' && (
                                            <button onClick={() => {
                                                const newIncs = state.incomes.map((item, i) => i === idx ? { ...item, taxTreatment: item.taxTreatment === 'tft' ? 'no-tft' : 'tft' } : (item.taxTreatment === 'tft' ? { ...item, taxTreatment: 'no-tft' } : item));
                                                if (state.incomes[idx].taxTreatment !== 'tft') {
                                                    const tftExclusive = state.incomes.map((item, i) => ({ ...item, taxTreatment: i === idx ? 'tft' : (item.taxTreatment === 'tft' ? 'no-tft' : item.taxTreatment) }));
                                                    setState({ ...state, incomes: tftExclusive });
                                                } else {
                                                    const newIncs = [...state.incomes]; newIncs[idx].taxTreatment = 'no-tft'; setState({ ...state, incomes: newIncs });
                                                }
                                            }} className={`px-2 py-1 rounded border transition-colors ${inc.taxTreatment === 'tft' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                                {inc.taxTreatment === 'tft' ? 'Claims Tax-Free Threshold' : 'No Tax-Free Threshold'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-6">Annual Summary</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500">Gross Cash Income</span>
                            <span className="text-lg font-semibold">{formatCurrency(annual_summary.gross_income)}</span>
                        </div>
                        <div className="flex justify-between items-end text-sm text-blue-600">
                            <span>+ Super Contributions</span>
                            <span>{formatCurrency(annual_summary.super_contribution)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">Super is excluded from Net Income</p>
                        <div className="border-t border-slate-100 my-2"></div>
                        <div className="space-y-2 text-sm text-red-600">
                            <div className="flex justify-between"><span>Income Tax</span><span>-{formatCurrency(annual_summary.income_tax)}</span></div>
                            <div className="flex justify-between"><span>Medicare Levy</span><span>-{formatCurrency(annual_summary.medicare_levy)}</span></div>
                            {annual_summary.medicare_levy_surcharge > 0 && <div className="flex justify-between"><span>Medicare Levy Surcharge</span><span>-{formatCurrency(annual_summary.medicare_levy_surcharge)}</span></div>}
                            {annual_summary.hecs_repayment > 0 && <div className="flex justify-between text-orange-600"><span>HECS Repayment</span><span>-{formatCurrency(annual_summary.hecs_repayment)}</span></div>}
                        </div>
                        <div className="border-t-2 border-slate-100 my-4"></div>
                        <div className="flex justify-between items-end">
                            <div><span className="text-slate-500 font-bold block">Net Income</span><span className="text-xs text-slate-400">Cash in Hand</span></div>
                            <span className="text-3xl font-bold text-emerald-600">{formatCurrency(annual_summary.net_income)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Monthly: {formatCurrency(annual_summary.net_income / 12)}</span>
                            <span>Weekly: {formatCurrency(annual_summary.net_income / 52)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
