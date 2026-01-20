import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AlertCircle, Send, CheckCircle2 } from "lucide-react";

export function ComplaintPortal() {
    const events = useQuery(api.events.getAll);
    const submitComplaint = useMutation(api.complaints.submit);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        eventId: "",
        concern: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitComplaint({
            name: formData.name,
            email: formData.email,
            eventId: formData.eventId as any || undefined,
            concern: formData.concern
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Complaint Received</h1>
                    <p className="text-slate-600 mb-8">
                        Our ACE Coordinator has been notified. We review all concerns within 48 business hours.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                        Back to Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex p-3 bg-red-100 rounded-2xl mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Complaint & Resolution Portal</h1>
                    <p className="text-slate-500 mt-2">Professional, ethical, and timely resolution for all learners.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Related Event (Optional)</label>
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all bg-white"
                                value={formData.eventId}
                                onChange={e => setFormData({...formData, eventId: e.target.value})}
                            >
                                <option value="">General SIG Concern</option>
                                {events?.map(e => (
                                    <option key={e._id} value={e._id}>{e.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description of Concern</label>
                            <textarea 
                                required
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="Please provide as much detail as possible..."
                                value={formData.concern}
                                onChange={e => setFormData({...formData, concern: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit"
                            className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-100"
                        >
                            <Send size={18} />
                            Submit Complaint
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-slate-400 text-sm">
                    Your privacy is protected. Complaints are handled directly by the BAE SIG Board.
                </div>
            </div>
        </div>
    );
}
