import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Download, Calendar, User, ArrowLeft } from "lucide-react";

export function AuditPortal() {
    const navigate = useNavigate();
    const events = useQuery(api.events.getAll);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [isGenerating, setIsGenerating] = useState(false);

    const filteredEvents = useMemo(() => {
        return events?.filter(e => e.date.startsWith(selectedYear)) || [];
    }, [events, selectedYear]);

    const handleDownloadBundle = async () => {
        setIsGenerating(true);
        // In a real production app, this would call a Convex action 
        // that generates a signed PDF bundle from all event data.
        setTimeout(() => {
            alert("Audit Bundle generation initialized. In a live production environment, this would securely bundle all instructor CVs, learning objectives, and cryptographic logs for the selected cycle.");
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#002855] text-white p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <div className="bg-white p-3 rounded-2xl">
                            <img src="/bae-sig-logo.png" alt="BAE SIG" className="w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Compliance Portal</h1>
                            <p className="text-blue-300 font-bold uppercase tracking-widest text-[10px] mt-1">Authorized Audit Response System • 2026 Verified</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Return
                    </button>
                </div>

                {/* Main Action Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">Audit Cycle</label>
                        <select 
                            className="w-full bg-[#001835] border-2 border-white/10 rounded-2xl px-6 py-4 font-black text-[#FFB81C] outline-none appearance-none"
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            <option value="2024">2024 Cycle</option>
                            <option value="2025">2025 Cycle</option>
                            <option value="2026">2026 Cycle</option>
                        </select>
                    </div>

                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-[#002855] p-10 rounded-[3rem] shadow-2xl border border-white/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 skew-x-[-20deg] transform translate-x-32 -translate-y-12"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 italic">One-Click Audit Bundle</h2>
                            <p className="text-blue-100 mb-8 max-w-lg leading-relaxed font-medium">
                                Generate a unified compliance document containing all instructor evidence, behavioral learning objectives, and verified attendee timestamps for the {selectedYear} cycle.
                            </p>
                            <button 
                                onClick={handleDownloadBundle}
                                disabled={isGenerating}
                                className="bg-[#FFB81C] text-[#002855] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                            >
                                {isGenerating ? "Bundling Evidence..." : "Download Evidence Bundle"}
                                {!isGenerating && <Download size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Evidence Log */}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Verified Evidence Log</h3>
                        <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                            {filteredEvents.length} Events Logged
                        </span>
                    </div>

                    <div className="space-y-4">
                        {filteredEvents.map(event => (
                            <div key={event._id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-3 h-3 rounded-full ${event.learningObjectives?.length ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-rose-500'}`}></div>
                                    <div>
                                        <p className="font-black uppercase tracking-tight text-white group-hover:text-[#FFB81C] transition-colors">{event.title}</p>
                                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><User size={12}/> {event.instructorName}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400">
                                        OBJ: {event.learningObjectives?.length || 0}
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400">
                                        EXP: {event.instructorExpertise ? 'YES' : 'NO'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredEvents.length === 0 && (
                            <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest italic">
                                No records found for this cycle.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-16 text-center text-white/20 font-black uppercase tracking-[0.5em] text-[9px]">
                    BAE-SIG-REGISTRY-V2.5-AUDIT-READY
                </div>
            </div>
        </div>
    );
}
