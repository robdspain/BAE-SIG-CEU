import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Download, Mail, Filter, Search } from "lucide-react";

export function EmailListManagement() {
    const events = useQuery(api.events.getAll);
    const [selectedEventId, setSelectedEventId] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // In a real app, we'd have a specific "get all attendees" query
    // For now, we'll fetch them per event if selected, or we'd need a global query
    // Let's assume we want to export emails for a specific event or all.
    
    // We'll add a 'getAllAttendees' query to Convex next.
    const allAttendees = useQuery(api.attendees.getAllGlobal);

    const filtered = allAttendees?.filter(a => {
        const matchesEvent = selectedEventId === "all" || a.eventId === selectedEventId;
        const matchesSearch = a.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             a.lastName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesEvent && matchesSearch;
    });

    const exportEmails = () => {
        if (!filtered) return;
        const csvContent = "Email,First Name,Last Name,BCBA Number\n" + 
            filtered.map(a => `${a.email},${a.firstName},${a.lastName},${a.bcbaNumber || ""}`).join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registry-emails-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Mail className="text-blue-600" /> Email List Management
                    </h1>
                    <button 
                        onClick={exportEmails}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Download size={20} /> Export CSV
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[300px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search attendees..."
                                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-400" />
                            <select 
                                className="px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={selectedEventId}
                                onChange={e => setSelectedEventId(e.target.value)}
                            >
                                <option value="all">All Events</option>
                                {events?.map(e => (
                                    <option key={e._id} value={e._id}>{e.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-6 py-4">Participant</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4">Certification</th>
                                <th className="px-6 py-4">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered?.map(a => (
                                <tr key={a._id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{a.lastName}, {a.firstName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{a.email}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{a.bcbaNumber || a.rbtNumber || "N/A"}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {a.checkInTime ? new Date(a.checkInTime).toLocaleDateString() : "Imported"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {!filtered && <div className="p-20 text-center text-gray-400">Loading registry...</div>}
                    {filtered?.length === 0 && <div className="p-20 text-center text-gray-400">No records found.</div>}
                </div>
            </div>
        </div>
    );
}
