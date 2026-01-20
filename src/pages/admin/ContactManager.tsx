import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, Mail, Download, Trash2, Building2, UserPlus } from "lucide-react";

export function ContactManager() {
    const contacts = useQuery(api.contacts.getAll);
    const removeContact = useMutation(api.contacts.remove);
    const batchUpsert = useMutation(api.contacts.batchUpsert);
    
    const [searchTerm, setSearchTerm] = useState("");

    const filteredContacts = contacts?.filter(c => 
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.organization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n");
            
            const toImport = lines.slice(1).filter(l => l.trim()).map(line => {
                const values = line.split(",");
                // Basic CSV mapping - adjust based on actual CSV structure
                return {
                    email: values[0]?.trim(),
                    firstName: values[1]?.trim() || "Imported",
                    lastName: values[2]?.trim() || "User",
                    organization: values[3]?.trim(),
                    source: "manual-import",
                    tags: ["csv-import"]
                };
            }).filter(c => c.email && c.email.includes("@"));

            if (toImport.length > 0) {
                const res = await batchUpsert({ contacts: toImport as any });
                alert(`Imported ${res.success} contacts (${res.failed} failed).`);
            }
        };
        reader.readAsText(file);
    };

    const downloadCSV = () => {
        if (!contacts) return;
        const headers = ["Email", "First Name", "Last Name", "Organization", "Cert #", "Status", "Subscribed At"];
        const rows = contacts.map(c => [
            c.email,
            c.firstName,
            c.lastName,
            c.organization || "",
            c.certificationNumber || "",
            c.status,
            c.subscribedAt
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BAE_SIG_Contacts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[#002855] uppercase tracking-tighter italic">Contact Matrix</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Global Learner & Attendee CRM</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={downloadCSV}
                        className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <label className="bg-[#002855] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#003875] transition-all flex items-center gap-2 cursor-pointer shadow-xl shadow-blue-100">
                        <UserPlus size={16} /> Import CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Database</p>
                    <p className="text-4xl font-black text-[#002855] italic">{contacts?.length || 0}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Subscribers</p>
                    <p className="text-4xl font-black text-emerald-600 italic">{contacts?.filter(c => c.status === 'active').length || 0}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Represented Orgs</p>
                    <p className="text-4xl font-black text-blue-600 italic">
                        {new Set(contacts?.map(c => c.organization).filter(Boolean)).size}
                    </p>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search by name, email, or organization..."
                    className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 font-bold text-[#002855] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#002855] text-white">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Learner Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Organization</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Tags & Source</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredContacts?.map(contact => (
                                <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black italic">
                                                {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#002855] uppercase tracking-tight italic">{contact.firstName} {contact.lastName}</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Mail size={12} /> {contact.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {contact.organization ? (
                                            <div className="flex items-center gap-2 text-sm font-black text-slate-600 uppercase tracking-tight">
                                                <Building2 size={14} className="text-slate-300" />
                                                {contact.organization}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Not Specified</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-500 border border-slate-200">
                                                {contact.source}
                                            </span>
                                            {contact.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-blue-50 rounded-lg text-[9px] font-black uppercase text-blue-600 border border-blue-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => {
                                                if(confirm("Delete this contact?")) removeContact({ id: contact._id });
                                            }}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
