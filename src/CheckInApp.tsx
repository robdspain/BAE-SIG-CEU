import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link } from 'react-router-dom';
import { Clock, Calendar, User, Award, CheckCircle, ChevronRight, Play, ArrowRight, FileText } from 'lucide-react';
import { StarRating } from './components/StarRating';

// Shared Components
const BAE_SIG_LOGO = ({ className = "w-full h-auto" }: { className?: string }) => (
    <img src="/bae-sig-logo.png" alt="BAE SIG Logo" className={className} />
);

function CheckInApp() {
  const events = useQuery(api.events.getAll);
  const activeEvent = useQuery(api.events.getActive);
  const allAttendees = useQuery(api.attendees.getAllGlobal);
  const checkIn = useMutation(api.attendees.checkIn);
  const submitFeedback = useMutation(api.feedback.submit);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bcbaNumber: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'feedback' | 'form'>('idle');
  const [flowMode, setFlowMode] = useState<'check-in' | 'retrieval'>('check-in');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = useMemo(() => 
    events?.find(e => e._id === selectedEventId) || activeEvent, 
    [events, selectedEventId, activeEvent]
  );

  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
      const timer = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    if (!allAttendees || !events) return { ceus: 0, participants: 0, events: 0 };
    const totalCEUs = allAttendees.reduce((sum, a) => {
        const event = events.find(e => e._id === a.eventId);
        return sum + (event?.hours || 0);
    }, 0);
    return {
        ceus: Math.round(totalCEUs),
        participants: allAttendees.length,
        events: events.length
    };
  }, [allAttendees, events]);

  const categorizedEvents = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const published = events.filter(e => e.status === 'published' || e.status === 'completed');
    
    return {
        upcoming: published.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        past: published.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }, [events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setStatus('submitting');
    try {
      const res = await checkIn({
        eventId: selectedEvent._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bcbaNumber: formData.bcbaNumber || undefined,
      });
      
      setAttendeeId(res.id);

      if (flowMode === 'check-in' && selectedEvent.requiresFeedback) {
          setStatus('feedback');
      } else {
          setStatus('success');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process request. Please try again.');
      setStatus('form');
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEvent || !attendeeId) return;
      
      await submitFeedback({
          eventId: selectedEvent._id,
          attendeeId: attendeeId as any,
          rating,
          comments
      });
      setStatus('success');
  };

  const openCheckIn = (eventId: string, mode: 'check-in' | 'retrieval' = 'check-in') => {
      setSelectedEventId(eventId);
      setFlowMode(mode);
      setStatus('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If we are in the middle of a check-in flow, show the form/status
  if (status !== 'idle') {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                     <button onClick={() => setStatus('idle')} className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <ChevronRight className="rotate-180" size={16} /> Back to Home
                    </button>
                    <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Clock size={16} className="text-blue-500" />
                        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
                
                <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden mb-8 border border-slate-100 animate-in fade-in zoom-in duration-500">
                    {selectedEvent && (
                        <div className="bg-[#002855] p-10 text-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB81C]/10 skew-x-[-20deg] transform translate-x-12 -translate-y-8"></div>
                             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#FFB81C] mb-2">
                                {flowMode === 'check-in' ? 'Check-In Active' : 'Certificate Retrieval'}
                             </h2>
                             <h1 className="text-3xl font-black uppercase tracking-tight italic leading-tight">{selectedEvent.title}</h1>
                        </div>
                    )}

                    <div className="p-10">
                        {status === 'form' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">First Name</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-blue-500 outline-none transition-all font-bold"
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Last Name</label>
                                        <input
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-blue-500 outline-none transition-all font-bold"
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-blue-500 outline-none transition-all font-bold"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">BCBA Number (Optional)</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                        value={formData.bcbaNumber}
                                        onChange={e => setFormData({...formData, bcbaNumber: e.target.value})}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#FFB81C] text-[#002855] rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    {flowMode === 'check-in' ? 'Verify & Check In' : 'Find My Certificate'}
                                </button>
                            </form>
                        )}

                        {status === 'feedback' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center">
                                    <div className="inline-flex p-3 bg-amber-50 rounded-2xl mb-4">
                                        <Award className="text-[#FFB81C]" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase italic">Training Feedback</h2>
                                    <p className="text-slate-500 text-sm mt-2">{selectedEvent?.feedbackPrompt || "Please rate your experience to unlock your certificate."}</p>
                                </div>
                                
                                <form onSubmit={handleFeedback} className="space-y-8">
                                    <div className="flex justify-center">
                                        <StarRating rating={rating} setRating={setRating} />
                                    </div>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-500 outline-none resize-none font-medium"
                                        placeholder="Any additional comments for the board?"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={rating === 0}
                                        className="w-full py-4 bg-[#002855] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-[#003875] transition-all disabled:opacity-50"
                                    >
                                        Submit & Issue Certificate
                                    </button>
                                </form>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="text-green-500" size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-[#002855] uppercase italic mb-2">
                                    {flowMode === 'check-in' ? 'Success!' : 'Certificate Found!'}
                                </h2>
                                <p className="text-slate-500 mb-8">
                                    {flowMode === 'check-in' 
                                        ? <>You have been verified for <br/> <strong>{selectedEvent?.title}</strong>.</>
                                        : <>We found your record for <br/> <strong>{selectedEvent?.title}</strong>.</>
                                    }
                                </p>
                                <div className="space-y-4">
                                    <Link 
                                        to="/dashboard"
                                        className="block w-full py-4 bg-[#002855] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
                                    >
                                        {flowMode === 'check-in' ? 'Go to My Certificates' : 'Download Certificate'}
                                    </Link>
                                    <button onClick={() => setStatus('idle')} className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // MAIN LANDING PAGE VIEW
  return (
    <div className="animate-in fade-in duration-700">
        {/* Hero Section */}
        <div className="bg-[#002855] py-20 sm:py-32 px-6 sm:px-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full sm:w-[50%] h-full bg-[#FFB81C]/10 skew-x-[-20deg] transform translate-x-32 hidden lg:block"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFB81C]/5 rounded-full blur-3xl -mb-48 -ml-48"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-center lg:text-left animate-in slide-in-from-left-10 duration-1000">
                    <div className="inline-block bg-[#FFB81C] text-[#002855] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-8 shadow-glow">
                        Authorized via CalABA
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic leading-[0.85] text-balance">
                        Behavior Analysts <br/>
                        in Education <br/>
                        <span className="text-[#FFB81C]">CEU Registry</span>
                    </h1>
                    <p className="text-slate-300 text-lg font-medium lg:max-w-xl mx-auto lg:mx-0 leading-relaxed mb-12">
                        Modern, real-time continuing education tracking for school-based behavior analysts. Verified by BAE SIG.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                        <a href="#active-events" className="bg-[#FFB81C] text-[#002855] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition shadow-2xl flex items-center justify-center gap-3 animate-pulse-glow">
                            Join Active Event
                            <ArrowRight size={20} />
                        </a>
                        <Link to="/dashboard" className="glass-card px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white border border-white/20 hover:bg-white/10 transition flex items-center justify-center gap-3">
                            <FileText size={20} /> My History
                        </Link>
                    </div>
                </div>
                
                <div className="hidden lg:flex justify-end animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
                    <div className="bg-white p-16 rounded-[4rem] shadow-2xl transform rotate-3 border-4 border-[#FFB81C] hover:rotate-0 transition-all duration-700 animate-float">
                        <div className="h-48 w-48"><BAE_SIG_LOGO /></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-b border-slate-100 py-16">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-12">
                <div className="text-center">
                    <p className="text-5xl font-black text-[#002855] mb-2">{stats.events}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Trainings Hosted</p>
                </div>
                <div className="text-center border-x border-slate-100">
                    <p className="text-5xl font-black text-[#FFB81C] mb-2">{stats.ceus}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">CEUs Distributed</p>
                </div>
                <div className="text-center">
                    <p className="text-5xl font-black text-[#002855] mb-2">{stats.participants}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Learners Served</p>
                </div>
            </div>
        </div>

        {/* Events Section */}
        <section id="active-events" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 space-y-24">
            {/* Upcoming Events */}
            <div>
                <div className="flex items-center gap-6 mb-16">
                    <h2 className="text-4xl font-black text-[#002855] uppercase tracking-tighter italic whitespace-nowrap">Upcoming Events</h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                </div>

                {!events ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1,2,3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
                    </div>
                ) : categorizedEvents.upcoming.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {categorizedEvents.upcoming.map((event) => (
                            <div key={event._id} className="glass-card p-10 rounded-[3rem] shadow-premium border border-slate-100/50 group hover-lift flex flex-col h-full relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <span className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-[#002855] tracking-widest border border-slate-100 group-hover:bg-[#FFB81C] group-hover:border-[#FFB81C] transition-colors">
                                        {event.type}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-[#002855] uppercase tracking-widest">{event.hours} CEUs</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{event.modality || 'Online'}</p>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[#002855] uppercase tracking-tight mb-8 italic leading-none">{event.title}</h3>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-sm font-black text-[#002855] uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><User size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Instructor</p>
                                            <p className="text-sm font-black text-[#002855] uppercase">{event.instructorName}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => openCheckIn(event._id, 'check-in')}
                                    className="w-full mt-auto bg-[#002855] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#003875] transition-all flex items-center justify-center gap-2"
                                >
                                    Register / Check In <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100">
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em]">No events currently active for registration.</p>
                    </div>
                )}
            </div>

            {/* Past Events */}
            {categorizedEvents.past.length > 0 && (
                <div>
                    <div className="flex items-center gap-6 mb-16">
                        <h2 className="text-4xl font-black text-[#002855] uppercase tracking-tighter italic whitespace-nowrap">Past Events</h2>
                        <div className="h-1 flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {categorizedEvents.past.map((event) => (
                            <div key={event._id} className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 group flex flex-col h-full relative overflow-hidden transition-all duration-500 hover-lift">
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <span className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-[#002855] tracking-widest border border-slate-100 group-hover:bg-[#FFB81C] group-hover:border-[#FFB81C] transition-colors">
                                        {event.type}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-[#002855] uppercase tracking-widest">{event.hours} CEUs</p>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[#002855] uppercase tracking-tight mb-8 italic leading-none">{event.title}</h3>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-sm font-black text-[#002855] uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-auto">
                                    <button 
                                        onClick={() => openCheckIn(event._id, 'retrieval')}
                                        className="w-full bg-slate-100 text-[#002855] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        Retrieve Certificate
                                    </button>
                                    {event.recordingUrl && (
                                        <a 
                                            href={event.recordingUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/10"
                                        >
                                            <Play size={14} fill="currentColor" /> Watch on YouTube
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    </div>
  );
}

export default CheckInApp;
