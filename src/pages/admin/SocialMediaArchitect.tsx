import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Instagram, Linkedin, Send, Wand2 } from "lucide-react";

export function SocialMediaArchitect() {
    const events = useQuery(api.events.getAll);
    const generateCopy = useAction(api.ai.generateMarketingCopy);
    const updateEvent = useMutation(api.events.update);
    
    const [selectedEventId, setSelectedEventId] = useState("");
    const selectedEvent = events?.find(e => e._id === selectedEventId);

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!selectedEvent) return;
        setIsGenerating(true);
        try {
            const igCopy = await generateCopy({
                eventTitle: selectedEvent.title,
                instructor: selectedEvent.instructorName,
                hours: selectedEvent.hours,
                platform: "instagram"
            });
            
            const liCopy = await generateCopy({
                eventTitle: selectedEvent.title,
                instructor: selectedEvent.instructorName,
                hours: selectedEvent.hours,
                platform: "linkedin"
            });

            // Save back to DB
            await updateEvent({
                ...selectedEvent,
                id: selectedEvent._id,
                marketingCopy: {
                    ...selectedEvent.marketingCopy,
                    instagram: igCopy,
                    linkedin: liCopy
                }
            });
            
            alert("AI has architected your marketing copy!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <Sparkles className="text-purple-600" /> AI Social Media Architect
                        </h1>
                        <p className="text-gray-500 mt-2">Generate high-converting marketing assets for your CEU events.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Event Selection */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Step 1: Select Event</label>
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white font-bold"
                                value={selectedEventId}
                                onChange={e => setSelectedEventId(e.target.value)}
                            >
                                <option value="">Select an event...</option>
                                {events?.map(e => (
                                    <option key={e._id} value={e._id}>{e.title}</option>
                                ))}
                            </select>
                        </div>

                        {selectedEvent && (
                            <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 animate-in fade-in slide-in-from-left-4">
                                <h3 className="font-bold text-purple-900 mb-2">Event Context</h3>
                                <div className="text-sm text-purple-700 space-y-2">
                                    <p>📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
                                    <p>⏱️ {selectedEvent.hours} Hours ({selectedEvent.type})</p>
                                    <p>👨‍🏫 {selectedEvent.instructorName}</p>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                >
                                    <Wand2 size={18} />
                                    {isGenerating ? 'Architecting...' : 'Generate Assets'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Asset Generation */}
                    <div className="lg:col-span-2 space-y-8">
                        {!selectedEvent ? (
                            <div className="h-96 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-3xl text-gray-300">
                                <Sparkles size={64} className="mb-4 opacity-20" />
                                <p className="font-bold">Select an event to start building assets</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
                                {/* Instagram */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-pink-600 font-black text-xs uppercase tracking-widest mb-4">
                                        <Instagram size={16} /> Instagram Post
                                    </div>
                                    <div className="aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-gray-400 italic text-xs p-4 text-center">
                                        {selectedEvent.imagePrompt || "AI will generate a visual based on your event title and brand voice..."}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {selectedEvent.marketingCopy?.instagram || "Click 'Generate' to architect copy..."}
                                    </p>
                                </div>

                                {/* LinkedIn */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-widest mb-4">
                                        <Linkedin size={16} /> LinkedIn Professional
                                    </div>
                                    <div className="h-40 bg-gray-50 rounded-2xl mb-4 p-4 text-sm text-gray-700 leading-relaxed overflow-hidden">
                                        {selectedEvent.marketingCopy?.linkedin || "Architecting professional summary..."}
                                    </div>
                                    <button className="text-blue-600 text-xs font-bold hover:underline">Copy to Clipboard</button>
                                </div>

                                {/* Promotional Email */}
                                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest mb-4">
                                        <Send size={16} /> Promotional Email Template
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-700">
                                            Subject: Join us for {selectedEvent.title}!
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 whitespace-pre-wrap">
                                            {selectedEvent.marketingCopy?.email || "Click generate to draft a professional invitation email."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
