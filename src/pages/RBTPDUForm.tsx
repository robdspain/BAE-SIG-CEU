import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Award, CheckCircle, AlertTriangle } from "lucide-react";

export function RBTPDUForm() {
    const activeEvent = useQuery(api.events.getActive);
    const checkIn = useMutation(api.attendees.checkIn);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        rbtNumber: "",
        topics: [] as string[]
    });
    const [submitted, setSubmitted] = useState(false);

    const RBT_TOPICS = [
        "Measurement", "Assessment", "Skill Acquisition", 
        "Behavior Reduction", "Documentation and Reporting", "Professional Conduct"
    ];

    const toggleTopic = (topic: string) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.includes(topic) 
                ? prev.topics.filter(t => t !== topic)
                : [...prev.topics, topic]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeEvent) return;
        
        await checkIn({
            eventId: activeEvent._id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            rbtNumber: formData.rbtNumber,
            // We can store topics in secretWordAnswers or a new field if we want to be strict
            secretWordAnswers: formData.topics 
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <CheckCircle className="text-indigo-600 mx-auto mb-6" size={64} />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">PDU Recorded</h1>
                    <p className="text-gray-600 mb-8">Your RBT PDU record has been submitted and verified.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-10 text-white text-center">
                        <Award size={48} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold">RBT PDU Submission</h1>
                        <p className="text-indigo-100 mt-2">Professional Development Unit Tracking for {activeEvent?.title || "Active Event"}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                <input 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none"
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                <input 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none"
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">RBT Certification Number</label>
                            <input 
                                required
                                placeholder="e.g. RBT-22-XXXX"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none"
                                value={formData.rbtNumber}
                                onChange={e => setFormData({...formData, rbtNumber: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                Topics Covered <span className="text-xs font-normal text-gray-400">(Select all that apply)</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {RBT_TOPICS.map(topic => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => toggleTopic(topic)}
                                        className={`px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                                            formData.topics.includes(topic)
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                                        }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 flex gap-3">
                            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                            <p className="text-xs text-amber-800">
                                By submitting this form, I attest that I have attended the entirety of the training 
                                and that the information provided is accurate per the BACB Ethics Code.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                        >
                            Verify & Submit PDU
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
