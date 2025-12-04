import React, { useState } from 'react';
import { X, Settings, BookOpen, Trash2 } from 'lucide-react';
import AdvancedVariablesModal from './AdvancedVariablesModal';

export default function SettingsModal({ isOpen, onClose, settings, onUpdate, profiles, setProfiles, currentProfileId, setCurrentProfileId }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');

    if (!isOpen) return null;

    return (
        <>
            <AdvancedVariablesModal isOpen={showAdvanced} onClose={() => setShowAdvanced(false)} />
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2"><Settings className="w-5 h-5" /> Global Settings</h2>
                        <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">

                        {/* Profile Manager */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Profiles</h3>
                            <div className="space-y-2">
                                {profiles.map((p) => (
                                    <div key={p.id} className={`flex justify-between items-center p-2 rounded border ${p.id === currentProfileId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                        <span className={`text-sm ${p.id === currentProfileId ? 'font-bold text-blue-700' : 'text-slate-700'}`}>{p.name}</span>
                                        {p.id !== currentProfileId && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentProfileId(p.id)} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Switch</button>
                                                {p.id !== 'default' && (
                                                    <button onClick={() => {
                                                        setProfiles(profiles.filter((pr) => pr.id !== p.id));
                                                    }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                )}
                                            </div>
                                        )}
                                        {p.id === currentProfileId && <span className="text-[10px] text-blue-400 font-medium">Active</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input
                                    placeholder="New Profile Name"
                                    className="flex-1 text-sm border rounded px-2 py-1"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        if (newProfileName) {
                                            const newId = Date.now().toString();
                                            setProfiles([...profiles, { id: newId, name: newProfileName }]);
                                            setCurrentProfileId(newId);
                                            setNewProfileName('');
                                        }
                                    }}
                                    className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                                >
                                    Create
                                </button>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <button onClick={() => setShowAdvanced(true)} className="w-full py-2 border border-slate-300 rounded text-slate-600 text-sm font-medium hover:bg-slate-50">
                            View Variables & Assumptions
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
