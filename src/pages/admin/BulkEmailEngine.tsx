import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Send, CheckCircle } from "lucide-react";

export function BulkEmailEngine() {
    const events = useQuery(api.events.getAll);
    const [selectedEventId, setSelectedEventId] = useState("");
    const selectedEvent = events?.find(e => e._id === selectedEventId);
    
    const attendees = useQuery(api.attendees.getByEvent, selectedEventId ? { eventId: selectedEventId as any } : "skip");
    const [isSending, setIsSending] = useState(false);
    const [done, setDone] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sendSummary, setSendSummary] = useState<{ attempted: number; sent: number; failed: number; skipped: number } | null>(null);
    const sendCertificateEmails = useAction(api.emailActions.sendCertificateEmails);

    const handleSend = async () => {
        if (!selectedEventId) return;
        setIsSending(true);
        setSendError(null);
        setSendSummary(null);
        try {
            const result = await sendCertificateEmails({ eventId: selectedEventId as any });
            setSendSummary(result);
            setDone(true);
            setTimeout(() => setDone(false), 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send emails.";
            setSendError(message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-[#002855] uppercase tracking-tighter italic">Bulk Email Engine</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Deploy certificates to entire rosters.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Step 1: Target Event</label>
                    <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-[#002855] outline-none appearance-none"
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                    >
                        <option value="">Select Event...</option>
                        {events?.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                    </select>
                </div>

                {selectedEvent && (
                    <div className="lg:col-span-2 bg-[#002855] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 skew-x-[-20deg] transform translate-x-32 -translate-y-12"></div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#FFB81C] mb-4">Ready for Deployment</h3>
                            <div className="flex gap-12 mb-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-blue-300 mb-1">Target</p>
                                    <p className="text-2xl font-black italic">{attendees?.length || 0} Recipients</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-blue-300 mb-1">Status</p>
                                    <p className="text-2xl font-black italic">{selectedEvent.status}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSend}
                                disabled={isSending || !attendees?.length}
                                className="bg-[#FFB81C] text-[#002855] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                            >
                                {isSending ? "Launching Campaign..." : done ? "Campaign Deployed" : "Send Certificates"}
                                {done ? <CheckCircle size={18} /> : <Send size={18} />}
                            </button>
                            {sendSummary && (
                                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-100">
                                    Sent {sendSummary.sent}/{sendSummary.attempted} (Skipped {sendSummary.skipped}, Failed {sendSummary.failed})
                                </p>
                            )}
                            {sendError && (
                                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-200">
                                    {sendError}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedEvent && attendees && (
                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {attendees.map(a => (
                                <tr key={a._id}>
                                    <td className="px-8 py-5 font-bold text-[#002855]">{a.firstName} {a.lastName}</td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{a.email}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-[9px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-400">Pending</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
