import { BookOpen, X } from 'lucide-react';

export default function AdvancedVariablesModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Advanced Variables & Assumptions</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-2">Income Tax (Resident) 2024-25</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead><tr className="bg-slate-100 text-left"><th className="p-2 border">Threshold</th><th className="p-2 border">Rate</th></tr></thead>
                            <tbody>
                                <tr><td className="p-2 border">$0 - $18,200</td><td className="p-2 border">0%</td></tr>
                                <tr><td className="p-2 border">$18,201 - $45,000</td><td className="p-2 border">16%</td></tr>
                                <tr><td className="p-2 border">$45,001 - $135,000</td><td className="p-2 border">30%</td></tr>
                                <tr><td className="p-2 border">$135,001 - $190,000</td><td className="p-2 border">37%</td></tr>
                                <tr><td className="p-2 border">$190,001+</td><td className="p-2 border">45%</td></tr>
                            </tbody>
                        </table>
                        <p className="text-[10px] text-slate-400 mt-1">Source: ATO Individual Income Tax Rates 2024-25</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-2">Medicare Levy Surcharge</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead><tr className="bg-slate-100 text-left"><th className="p-2 border">Income (Adj for MLS)</th><th className="p-2 border">Rate</th></tr></thead>
                            <tbody>
                                <tr><td className="p-2 border">&lt; $97,000</td><td className="p-2 border">0%</td></tr>
                                <tr><td className="p-2 border">$97,001 - $113,000</td><td className="p-2 border">1.0%</td></tr>
                                <tr><td className="p-2 border">$113,001 - $151,000</td><td className="p-2 border">1.25%</td></tr>
                                <tr><td className="p-2 border">$151,001+</td><td className="p-2 border">1.5%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
