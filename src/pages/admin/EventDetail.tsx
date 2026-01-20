import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Mail, CheckCircle, XCircle, Users, Search, Send } from "lucide-react";
import { useState } from "react";
import { StarRating } from "../../components/StarRating";

export function EventDetail() {
    const { id } = useParams();
    const eventId = id as any; 
    
    const event = useQuery(api.events.get, (id && id !== "new") ? { id: eventId } : "skip");
    const attendees = useQuery(api.attendees.getByEvent, (id && id !== "new") ? { eventId } : "skip");
    const feedback = useQuery(api.feedback.getByEvent, (id && id !== "new") ? { eventId } : "skip");

    const [filter, setFilter] = useState("");
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'done'>('idle');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSummary, setEmailSummary] = useState<{ attempted: number; sent: number; failed: number; skipped: number } | null>(null);
    const sendCertificateEmails = useAction(api.emailActions.sendCertificateEmails);

    if (!event) return <div className="p-8 text-center">Loading...</div>;

    const handleSendBulkEmail = async () => {
        setEmailStatus('sending');
        setEmailError(null);
        setEmailSummary(null);
        try {
            const result = await sendCertificateEmails({ eventId: event._id });
            setEmailSummary(result);
            setEmailStatus('done');
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send emails.";
            setEmailError(message);
            setEmailStatus('idle');
        }
    };

    const filteredAttendees = attendees?.filter(a => 
        a.lastName.toLowerCase().includes(filter.toLowerCase()) || 
        a.email.toLowerCase().includes(filter.toLowerCase())
    ) || [];

    const avgRating = feedback && feedback.length > 0 
        ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
        : "N/A";

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Link to="/admin" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-6">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Event Stats */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{event.title}</h1>
                            <div className="flex gap-4 text-sm font-bold text-gray-500">
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="text-blue-600">{event.hours} CEUs</span>
                                <span>•</span>
                                <span>{event.instructorName}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all">
                                <Download size={18} /> Export
                            </button>
                            <button 
                                onClick={() => setIsEmailModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#002855] hover:bg-[#003875] text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-100"
                            >
                                <Mail size={18} /> Bulk Email
                            </button>
                        </div>
                    </div>

                    {/* Quick Analytics */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 text-center">
                        <div className="text-xs font-black text-gray-400 uppercase mb-2">Event Rating</div>
                        <div className="text-4xl font-black text-amber-500 mb-1">{avgRating}</div>
                        <div className="flex justify-center mb-2">
                             <StarRating rating={Math.round(Number(avgRating))} readonly />
                        </div>
                        <div className="text-xs text-gray-500">{feedback?.length || 0} Evaluations</div>
                    </div>
                </div>

                {/* Email Preview Modal */}
                {isEmailModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] shadow-3xl max-w-2xl w-full overflow-hidden border border-slate-100">
                            <div className="bg-[#002855] p-10 text-white relative">
                                <button onClick={() => setIsEmailModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                                    <XCircle size={24} />
                                </button>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#FFB81C] mb-2">Email Architect</h3>
                                <h2 className="text-3xl font-black italic uppercase tracking-tight">Bulk Delivery Engine</h2>
                            </div>
                            
                            <div className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Audience</label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">{attendees?.length || 0} Verified Participants</span>
                                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase tracking-widest">Selected</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Line</label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#002855]">
                                            {event.emailSubject || "Your CEU Certificate is Ready!"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Template Preview</label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs text-slate-600 font-medium leading-relaxed max-h-40 overflow-y-auto italic">
                                            {event.marketingCopy?.email || "No custom template defined. Using standard BAE SIG certificate delivery format."}
                                        </div>
                                    </div>
                                    {emailSummary && (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-700 font-bold">
                                            Sent {emailSummary.sent} of {emailSummary.attempted} (Skipped {emailSummary.skipped}, Failed {emailSummary.failed})
                                        </div>
                                    )}
                                    {emailError && (
                                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-600 font-bold">
                                            {emailError}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex gap-4">
                                    <button 
                                        onClick={() => setIsEmailModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSendBulkEmail}
                                        disabled={emailStatus !== 'idle'}
                                        className="flex-1 py-4 bg-[#002855] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100"
                                    >
                                        {emailStatus === 'sending' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : emailStatus === 'done' ? (
                                            <>
                                                <CheckCircle size={18} />
                                                All Emails Sent
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Launch Campaign
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 font-black text-gray-700">
                            <Users size={20} className="text-blue-500" />
                            ROSTER ({attendees?.length || 0})
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search attendee..." 
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-4">Participant</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Check-in</th>
                                <th className="px-8 py-4">BCBA/RBT #</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttendees.map(attendee => (
                                <tr key={attendee._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900 leading-none mb-1">{attendee.lastName}, {attendee.firstName}</div>
                                        <div className="text-xs text-gray-400">{attendee.email}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {attendee.feedbackSubmitted ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-full">
                                                <CheckCircle size={10} /> FEEDBACK OK
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-gray-400 font-bold text-[10px] bg-gray-50 px-2 py-0.5 rounded-full">
                                                PENDING FEEDBACK
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-gray-500 font-medium">
                                        {attendee.checkInTime ? new Date(attendee.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                    </td>
                                    <td className="px-8 py-5 text-gray-400 font-mono text-xs tracking-tighter">
                                        {attendee.bcbaNumber || attendee.rbtNumber || '-'}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link 
                                            to={`/certificate/${attendee._id}`}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all"
                                        >
                                            VIEW CERT
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
