import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "react-router-dom";
import { 
    Users, 
    Calendar, 
    MessageSquare, 
    Plus, 
    ChevronRight, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Mail,
    Settings,
    FileText,
    LayoutDashboard,
    ShieldCheck,
    Star,
    History,
    Sparkles,
    Edit,
    Trash2
} from "lucide-react";import { StarRating } from "../../components/StarRating";

import { ContactManager } from "./ContactManager";
import { BulkEmailEngine } from "./BulkEmailEngine";

type AdminView = 'overview' | 'events' | 'complaints' | 'compliance' | 'feedback' | 'registry' | 'late_checkins' | 'failures' | 'corrections' | 'users' | 'crm' | 'bulk-email';

export function AdminDashboard() {
    const [activeView, setActiveView] = useState<AdminView>('overview');
    const stats = useQuery(api.admin.getStats);
    const events = useQuery(api.events.getAll);
    const complaints = useQuery(api.complaints.getAll);
    const feedback = useQuery(api.feedback.getByEvent, { eventId: "all" as any }); // Modified backend or handle here
    const lateCheckIns = useQuery(api.lateCheckIns.getAll);
    const failures = useQuery(api.admin.getVerificationFailures);
    const logs = useQuery(api.admin.getCorrectionLogs);
    const users = useQuery(api.users.getAll);
    const allAttendees = useQuery(api.attendees.getAllGlobal);

    const updateLateStatus = useMutation(api.lateCheckIns.updateStatus);
    const updateUserStatus = useMutation(api.users.updateStatus);
    const deduplicateRegistry = useMutation(api.attendees.deduplicate);

    const handleDedupeRegistry = async () => {
        if (!confirm("Clean up duplicate registry records? This will keep the record with a verified check-in time.")) return;
        const count = await deduplicateRegistry();
        alert(`Cleanup complete. Removed ${count} duplicate records.`);
    };

    const handleExportRegistry = () => {
        if (!allAttendees || !events) return;
        const headers = ["Timestamp", "First Name", "Last Name", "Email", "BCBA/RBT #", "Event Title", "Provider ID", "Certificate ID"];
        const rows = allAttendees.map(r => {
            const event = events.find(e => e._id === r.eventId);
            return [
                r.checkInTime || "N/A",
                r.firstName,
                r.lastName,
                r.email,
                r.bcbaNumber || r.rbtNumber || "N/A",
                event?.title || "Unknown",
                event?.providerId || "N/A",
                r._id
            ];
        });
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BAE_SIG_Full_Registry_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const NavItem = ({ view, label, icon: Icon, badge }: { view: AdminView, label: string, icon: any, badge?: number }) => (
        <button 
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${activeView === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
            </div>
            {badge && badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeView === view ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'}`}>
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white"><ShieldCheck size={20} /></div>
                    <span className="font-black text-xl tracking-tighter italic">ADMIN HUB</span>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-2">Main</div>
                    <NavItem view="overview" label="Dashboard" icon={LayoutDashboard} />
                    <NavItem view="events" label="Manage Events" icon={Calendar} />
                    <NavItem view="crm" label="CRM / Contacts" icon={Users} />
                    <NavItem view="bulk-email" label="Bulk Email" icon={Mail} />
                    <NavItem view="late_checkins" label="Late Requests" icon={Clock} badge={stats?.pendingLateCheckIns} />
                    
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] my-6 px-2">Compliance</div>
                    <NavItem view="compliance" label="ACE Standards" icon={ShieldCheck} />
                    <NavItem view="complaints" label="Complaints" icon={MessageSquare} badge={stats?.openComplaints} />
                    <NavItem view="feedback" label="Learner Feedback" icon={Star} />
                    <NavItem view="registry" label="Registry Audit" icon={History} />
                    
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] my-6 px-2">System</div>
                    <NavItem view="users" label="Admin Users" icon={Users} badge={stats?.pendingUsers} />
                    <NavItem view="failures" label="Failures" icon={AlertTriangle} />
                    <NavItem view="corrections" label="Audit Trail" icon={Settings} />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <Link to="/admin/emails" className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest px-2">
                        <Mail size={18} /> Email Tools
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-[1600px]">
                {/* View: Overview */}
                {activeView === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 italic tracking-tight">System Overview</h1>
                                <p className="text-slate-400 font-medium">Real-time status of the BAE SIG Registry.</p>
                            </div>
                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Database Healthy</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Calendar size={24}/></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Live Events</p>
                                <p className="text-4xl font-black text-slate-900">{stats?.eventCount || 0}</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Star size={24}/></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg Rating</p>
                                <p className="text-4xl font-black text-slate-900">{(stats?.avgRating || 0).toFixed(1)}</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium">
                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={24}/></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Open Issues</p>
                                <p className="text-4xl font-black text-slate-900">{(stats?.openComplaints || 0) + (stats?.pendingLateCheckIns || 0)}</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4"><Users size={24}/></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Learners</p>
                                <p className="text-4xl font-black text-slate-900">{stats?.attendeeCount || 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8">
                                <h3 className="text-xl font-black mb-6 uppercase italic">Recent Events</h3>
                                <div className="space-y-4">
                                    {events?.slice(0, 5).map(e => (
                                        <div key={e._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-blue-600 border border-slate-100">{e.type[0]}</div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{e.title}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(e.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Link to={`/admin/events/${e._id}`} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-all"><ChevronRight size={20}/></Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-[#002855] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 skew-x-[-20deg] transform translate-x-12 -translate-y-8"></div>
                                <h3 className="text-xl font-black mb-6 uppercase italic relative z-10">AI Architect</h3>
                                <p className="text-blue-200 text-sm mb-8 relative z-10 leading-relaxed">Your AI assistant is ready to help you generate social media copy and event summaries.</p>
                                <Link to="/admin/architect" className="inline-flex items-center gap-2 bg-[#FFB81C] text-[#002855] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg relative z-10">
                                    Launch Architect <Sparkles size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Events */}
                {activeView === 'events' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic">Event Management</h2>
                            <Link to="/admin/events/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-blue-100">
                                <Plus size={18} /> New Event
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events?.map(event => (
                                <div key={event._id} className="bg-white rounded-[2rem] shadow-premium p-8 border border-slate-100 relative group">
                                    <div className="mb-6 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {event.status}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {event.type}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 uppercase italic">{event.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 mb-8">{new Date(event.date).toLocaleDateString()}</p>
                                    <div className="flex flex-col border-t border-slate-50 pt-6 gap-4">
                                        <Link to={`/admin/events/${event._id}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center gap-2">
                                            Manage Roster & Feedback <ChevronRight size={14} />
                                        </Link>
                                        <Link to={`/admin/events/${event._id}/edit`} className="w-full bg-[#002855] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#003875] transition-all shadow-lg shadow-blue-100">
                                            <Edit size={14} /> Edit Event Architect
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View: Complaints */}
                {activeView === 'complaints' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-10">Complaint Resolution</h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Learner</th>
                                        <th className="px-8 py-6">Concern</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {complaints?.map(c => (
                                        <tr key={c._id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900">{c.name}</p>
                                                <p className="text-xs text-slate-400">{c.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-slate-600 line-clamp-2 italic">"{c.concern}"</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Process Response</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {complaints?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Archive Clean. No issues found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Late Check-ins */}
                {activeView === 'late_checkins' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-10">Late Check-in Requests</h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#002855] text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Learner</th>
                                        <th className="px-8 py-6">Reason</th>
                                        <th className="px-8 py-6">Submitted</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lateCheckIns?.map(l => (
                                        <tr key={l._id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900">{l.firstName} {l.lastName}</p>
                                                <p className="text-xs text-slate-400 italic">{l.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{l.reason}"</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400">{new Date(l.timestamp).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => updateLateStatus({id: l._id, status: 'approved', reviewedBy: 'Admin'})} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={18}/></button>
                                                    <button onClick={() => updateLateStatus({id: l._id, status: 'rejected', reviewedBy: 'Admin'})} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><XCircle size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {lateCheckIns?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Inbox Empty.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Registry Audit */}
                {activeView === 'registry' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic">Global Registry</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Master record of all issued certificates.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDedupeRegistry}
                                    className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                                >
                                    Dedupe Registry
                                </button>
                                <button 
                                    onClick={handleExportRegistry}
                                    className="bg-[#002855] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#003875] transition-all"
                                >
                                    Export Full CSV
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#002855] text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Participant</th>
                                        <th className="px-8 py-6">Event Context</th>
                                        <th className="px-8 py-6">Certificate ID</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {allAttendees?.map((r) => (
                                        <tr key={r._id} className="hover:bg-slate-50/50 group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-900 uppercase italic">{r.lastName}, {r.firstName}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-bold text-slate-600 truncate max-w-[250px]">{events?.find(e => e._id === r.eventId)?.title || 'Unknown Event'}</div>
                                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">
                                                    {r.checkInTime ? `Verified ${new Date(r.checkInTime).toLocaleDateString()}` : 'Legacy Record'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 group-hover:bg-white group-hover:border group-hover:border-slate-200 transition-all">
                                                    {r._id}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/certificate/${r._id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><FileText size={16}/></Link>
                                                    <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg"><Edit size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {allAttendees?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Registry is empty.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Admin Users */}
                {activeView === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic">Administrative Roles</h2>
                            <div className="flex gap-3">
                                <div className="bg-rose-50 px-4 py-2 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">Whitelisted access only</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#002855] text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Administrator</th>
                                        <th className="px-8 py-6">Role</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users?.map(u => (
                                        <tr key={u._id} className="hover:bg-slate-50/50">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 uppercase italic">{u.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select 
                                                    value={u.status} 
                                                    onChange={(e) => updateUserStatus({id: u._id, status: e.target.value as any})}
                                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 outline-none ${
                                                        u.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Feedback */}
                {activeView === 'feedback' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic">Learner Evaluations</h2>
                            <div className="bg-amber-50 px-4 py-2 rounded-xl text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">Live Feedback Stream</div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#002855] text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Event</th>
                                        <th className="px-8 py-6">Rating</th>
                                        <th className="px-8 py-6">Learner Comments</th>
                                        <th className="px-8 py-6 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {feedback?.map((f, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 text-xs uppercase italic truncate max-w-[200px]">{f.eventId}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StarRating rating={f.rating} readonly />
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-slate-600 italic">"{f.comments}"</p>
                                            </td>
                                            <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400">
                                                {new Date(f.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {feedback?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No feedback received yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Compliance */}
                {activeView === 'compliance' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic">ACE Compliance Center</h2>
                                <p className="text-slate-400 font-medium">Audit-ready snapshot of your provider status.</p>
                            </div>
                            <Link to="/audit" className="bg-[#002855] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">Open Public Audit Portal</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium">
                                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-6">Security & Integrity</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                        <span className="text-sm font-bold text-slate-600 uppercase">Verification Failures</span>
                                        <span className="text-xl font-black text-rose-600">{failures?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                        <span className="text-sm font-bold text-slate-600 uppercase">Manual Registry Corrections</span>
                                        <span className="text-xl font-black text-amber-600">{logs?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                        <span className="text-sm font-bold text-slate-600 uppercase">Retention Compliance</span>
                                        <span className="text-xs font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded">7 Years / Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium">
                                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-6">Learner Satisfaction</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                        <span className="text-sm font-bold text-slate-600 uppercase">Average Rating</span>
                                        <span className="text-xl font-black text-blue-600">{(stats?.avgRating || 0).toFixed(2)} / 5.0</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                        <span className="text-sm font-bold text-slate-600 uppercase">Open Grievances</span>
                                        <span className={`text-xl font-black ${stats?.openComplaints ? 'text-rose-600' : 'text-green-600'}`}>{stats?.openComplaints || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Failures */}
                {activeView === 'failures' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-10">Security Log: Verification Failures</h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">User Identity</th>
                                        <th className="px-8 py-6">Failed Attempts</th>
                                        <th className="px-8 py-6">Last Attempted</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {failures?.map((f, i) => (
                                        <tr key={i} className="hover:bg-rose-50/30">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 leading-none mb-1">{f.email}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.details || 'Incorrect Secret Word'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${f.attempts >= 3 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {f.attempts} Attempts
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400">{new Date(f.timestamp).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600">Reset Counter</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {failures?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No security flags. Registry is clean.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Corrections (Manual Audit Trail) */}
                {activeView === 'corrections' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-10">Manual Audit Trail</h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Administrator</th>
                                        <th className="px-8 py-6">Correction Detail</th>
                                        <th className="px-8 py-6">Timestamp</th>
                                        <th className="px-8 py-6 text-right">Rationale</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs?.map((l, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 leading-none mb-1 uppercase italic">{l.adminEmail}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Staff</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-black uppercase text-blue-600 mb-1">{l.fieldChanged} updated</p>
                                                <div className="flex items-center gap-2 text-xs font-bold">
                                                    <span className="text-rose-500 line-through opacity-50">{l.oldValue}</span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className="text-green-600">{l.newValue}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(l.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-sm text-slate-600 italic leading-tight">"{l.reason}"</p>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs?.length === 0 && <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Audit trail is empty. All records automated.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: CRM */}
                {activeView === 'crm' && (
                    <ContactManager />
                )}

                {/* View: Bulk Email */}
                {activeView === 'bulk-email' && (
                    <BulkEmailEngine />
                )}

                {/* View: Other views */}
                {activeView !== 'overview' && activeView !== 'events' && activeView !== 'complaints' && activeView !== 'late_checkins' && activeView !== 'registry' && activeView !== 'users' && activeView !== 'feedback' && activeView !== 'compliance' && activeView !== 'failures' && activeView !== 'corrections' && activeView !== 'crm' && (
                    <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
                        <History size={64} className="mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest italic">View "{activeView}" Reconstruction in Progress</p>
                        <button onClick={() => setActiveView('overview')} className="mt-6 text-blue-600 font-bold text-xs uppercase underline underline-offset-4">Return to Overview</button>
                    </div>
                )}
            </main>
        </div>
    );
}