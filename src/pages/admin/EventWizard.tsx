import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
    Info, 
    ShieldCheck, 
    Megaphone, 
    FileEdit, 
    PlayCircle, 
    Mail, 
    CheckCircle, 
    Database,
    ArrowLeft,
    Save,
    Calendar,
    Clock,
    ChevronDown,
    Settings,
    Plus,
    Trash2,
    XCircle,
    ExternalLink
} from "lucide-react";
import DocumentField from "../../components/editor/DocumentField";
import PremiumInput from "../../components/editor/PremiumInput";
import { cn } from "../../lib/utils";
import { isDriveUrl } from "../../hooks/useDrive";

type ArchitectTab = 'core' | 'rbt' | 'marketing' | 'registration' | 'feedback' | 'verification' | 'email' | 'finalize' | 'data';

export function EventWizard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === "new";
    const existingEvent = useQuery(api.events.get, (isNew || !id) ? "skip" : { id: id as any });
    
    const createEvent = useMutation(api.events.create);
    const updateEvent = useMutation(api.events.update);

    const [activeTab, setActiveTab] = useState<ArchitectTab>('core');
    const [newDocUrl, setNewDocUrl] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "12:00 PM",
        endTime: "01:15 PM",
        hours: 1.0,
        type: "Ethics" as "Learning" | "Ethics" | "Supervision",
        modality: "Online Synchronous" as any,
        instructorName: "",
        instructorExpertise: "",
        instructorProviderId: "",
        aceCoordinatorName: "",
        aceOrganizationName: "Behavior Analysts in Education SIG",
        aceProviderType: "Organization" as "Organization" | "Individual",
        providerId: "OP-04-0012",
        syllabusUrl: "",
        instructorCVUrl: "",
        instructorSlidesUrl: "",
        slideUrl: "",
        zoomUrl: "",
        recordingUrl: "",
        documents: [] as { id: string, name: string, url: string, fileType: string, uploadedAt: string }[],
        learningObjectives: ["", "", ""],
        monitoringProcedures: "",
        quiz: [] as any[],
        secretWords: ["", ""],
        verificationMode: "flexible" as "strict" | "flexible",
        requiresFeedback: true,
        feedbackPrompt: "How would you rate this training?",
        marketingCopy: { instagram: "", linkedin: "", facebook: "", email: "" },
        emailSubject: "Your CEU Certificate is Ready!",
        imagePrompt: "",
        status: "draft" as "draft" | "published" | "completed",
        isArchived: false
    });

    useEffect(() => {
        if (existingEvent) {
            setFormData({
                ...formData,
                ...existingEvent,
                date: existingEvent.date.split('T')[0],
                learningObjectives: existingEvent.learningObjectives || ["", "", ""],
                secretWords: existingEvent.secretWords || ["", ""],
                marketingCopy: {
                    instagram: existingEvent.marketingCopy?.instagram || "",
                    linkedin: existingEvent.marketingCopy?.linkedin || "",
                    facebook: existingEvent.marketingCopy?.facebook || "",
                    email: existingEvent.marketingCopy?.email || ""
                },
                documents: existingEvent.documents || [],
                quiz: existingEvent.quiz || []
            });
        }
    }, [existingEvent]);

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                date: new Date(formData.date).toISOString()
            };
            if (isNew) {
                await createEvent(payload as any);
            } else {
                await updateEvent({ id: id as any, ...payload } as any);
            }
            alert("Event architected successfully!");
            navigate("/admin");
        } catch (err) {
            console.error(err);
            alert("Error saving architect changes.");
        }
    };

    const NavItem = ({ tab, label, icon: Icon }: { tab: ArchitectTab, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 ${activeTab === tab 
                ? 'bg-[#002855] text-white shadow-lg translate-x-2 rounded-xl' 
                : 'text-slate-500 hover:bg-slate-100 rounded-xl'}`}
        >
            <Icon size={20} className={activeTab === tab ? 'text-[#FFB81C]' : 'text-slate-400'} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-[#002855] uppercase tracking-tighter italic leading-none mb-1">Event Architect</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{formData.title || "Untitled Masterpiece"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <div className="flex gap-1">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="w-4 h-1 bg-blue-600 rounded-full"></div>)}
                                {[7,8].map(i => <div key={i} className="w-4 h-1 bg-slate-200 rounded-full"></div>)}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">6 / 8 Audit Ready Steps</span>
                        </div>
                        <button 
                            onClick={handleSave}
                            className="bg-[#002855] text-white px-10 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#003875] transition-all shadow-xl shadow-blue-100"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex max-w-[1600px] mx-auto w-full p-8 gap-12">
                {/* Sidebar */}
                <aside className="w-80 flex flex-col gap-2">
                    <NavItem tab="core" label="Core Info" icon={Info} />
                    <NavItem tab="rbt" label="RBT & PDUs" icon={ShieldCheck} />
                    <NavItem tab="marketing" label="Marketing" icon={Megaphone} />
                    <NavItem tab="registration" label="Registration" icon={FileEdit} />
                    <NavItem tab="feedback" label="Feedback" icon={PlayCircle} />
                    <NavItem tab="verification" label="CEU Verification" icon={ShieldCheck} />
                    <NavItem tab="email" label="CEU Confirmation Email" icon={Mail} />
                    <NavItem tab="finalize" label="Finalize" icon={CheckCircle} />
                    <NavItem tab="data" label="Data" icon={Database} />
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Drive Audit Alert */}
                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-full bg-amber-100/30 skew-x-[-20deg] transform translate-x-16"></div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-2">Drive Audit</div>
                            <h3 className="text-lg font-bold text-amber-900 mb-4 tracking-tight">Found 1 non-Drive attachments. Reupload to Drive before go-live.</h3>
                            <div className="inline-flex px-4 py-1 bg-white border border-amber-200 rounded-full text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                Instructor CV
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'core' && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">01</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">Core Event Details</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                                    <div className="col-span-full">
                                        <PremiumInput 
                                            label="Course Title"
                                            value={formData.title}
                                            onChange={val => setFormData({...formData, title: val})}
                                            icon={FileEdit}
                                            placeholder="Enter compelling course title..."
                                            className="italic"
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <PremiumInput 
                                            label="Description"
                                            value={formData.description}
                                            onChange={val => setFormData({...formData, description: val})}
                                            icon={Info}
                                            placeholder="What will learners achieve in this session?"
                                            isTextarea
                                        />
                                    </div>

                                    <PremiumInput 
                                        label="Instructor Name"
                                        value={formData.instructorName}
                                        onChange={val => setFormData({...formData, instructorName: val})}
                                        icon={CheckCircle}
                                        placeholder="e.g. Dr. Jane Smith, BCBA-D"
                                    />

                                    <PremiumInput 
                                        label="Instructor Expertise"
                                        value={formData.instructorExpertise}
                                        onChange={val => setFormData({...formData, instructorExpertise: val})}
                                        icon={ShieldCheck}
                                        placeholder="e.g. 5+ Years Clinical Practice"
                                    />

                                    <PremiumInput 
                                        label="Event Date"
                                        value={formData.date}
                                        onChange={val => setFormData({...formData, date: val})}
                                        icon={Calendar}
                                        type="date"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <PremiumInput 
                                            label="Start Time"
                                            value={formData.startTime}
                                            onChange={val => setFormData({...formData, startTime: val})}
                                            icon={Clock}
                                            placeholder="12:00 PM"
                                        />
                                        <PremiumInput 
                                            label="End Time"
                                            value={formData.endTime}
                                            onChange={val => setFormData({...formData, endTime: val})}
                                            icon={Clock}
                                            placeholder="01:15 PM"
                                        />
                                    </div>

                                    <PremiumInput 
                                        label="Main Category"
                                        value={formData.type}
                                        onChange={val => setFormData({...formData, type: val as any})}
                                        icon={ChevronDown}
                                        options={[
                                            { label: "Learning", value: "Learning" },
                                            { label: "Ethics", value: "Ethics" },
                                            { label: "Supervision", value: "Supervision" }
                                        ]}
                                    />

                                    <PremiumInput 
                                        label="Modality"
                                        value={formData.modality}
                                        onChange={val => setFormData({...formData, modality: val as any})}
                                        icon={PlayCircle}
                                        options={[
                                            { label: "Online Synchronous", value: "Online Synchronous" },
                                            { label: "In-Person", value: "In-Person" },
                                            { label: "Online Asynchronous", value: "Online Asynchronous" }
                                        ]}
                                    />

                                    <PremiumInput 
                                        label="ACE Provider Type"
                                        value={formData.aceProviderType || "Organization"}
                                        onChange={val => setFormData({...formData, aceProviderType: val as any})}
                                        icon={Settings}
                                        options={[
                                            { label: "Organization", value: "Organization" },
                                            { label: "Individual", value: "Individual" }
                                        ]}
                                    />

                                    <PremiumInput 
                                        label="ACE Organization Name"
                                        value={formData.aceOrganizationName || ""}
                                        onChange={val => setFormData({...formData, aceOrganizationName: val})}
                                        icon={Database}
                                        placeholder="e.g. Behavior Analysts in Education SIG"
                                    />

                                    <PremiumInput 
                                        label="ACE Coordinator Name"
                                        value={formData.aceCoordinatorName}
                                        onChange={val => setFormData({...formData, aceCoordinatorName: val})}
                                        icon={CheckCircle}
                                        placeholder="e.g. Lusineh Gharapetian, PhD, BCBA-D"
                                    />

                                    <PremiumInput 
                                        label="ACE Provider ID"
                                        value={formData.providerId}
                                        onChange={val => setFormData({...formData, providerId: val})}
                                        icon={ShieldCheck}
                                        placeholder="OP-XX-XXXX"
                                    />

                                    <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                        <DocumentField 
                                            label="Instructor CV"
                                            value={formData.instructorCVUrl || ""}
                                            onChange={val => setFormData({...formData, instructorCVUrl: val})}
                                            placeholder="Link or upload CV..."
                                        />
                                        <DocumentField 
                                            label="Course Syllabus"
                                            value={formData.syllabusUrl || ""}
                                            onChange={val => setFormData({...formData, syllabusUrl: val})}
                                            placeholder="Link or upload syllabus..."
                                        />
                                        <DocumentField 
                                            label="Instructor Slides"
                                            value={formData.instructorSlidesUrl || ""}
                                            onChange={val => setFormData({...formData, instructorSlidesUrl: val})}
                                            placeholder="Link or upload slides..."
                                        />
                                    </div>

                                    <div className="col-span-full pt-6 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Additional Audit Documents</label>
                                            {newDocUrl && (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newDoc = {
                                                            id: Math.random().toString(36).substr(2, 9),
                                                            name: newDocUrl.startsWith("convex://") ? "Uploaded File" : (isDriveUrl(newDocUrl) ? "Google Drive Doc" : "External Link"),
                                                            url: newDocUrl,
                                                            fileType: newDocUrl.startsWith("convex://") ? "Convex" : "Link",
                                                            uploadedAt: new Date().toISOString()
                                                        };
                                                        setFormData({...formData, documents: [...(formData.documents || []), newDoc]});
                                                        setNewDocUrl("");
                                                    }}
                                                    className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/10 animate-in fade-in zoom-in duration-300"
                                                >
                                                    + Add to Audit List
                                                </button>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <DocumentField 
                                                label="New Attachment"
                                                value={newDocUrl}
                                                onChange={setNewDocUrl}
                                                placeholder="Paste Drive link or upload file to add to audit list..."
                                            />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {(formData.documents || []).map((doc, idx) => (
                                                <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                            <FileEdit size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#002855] uppercase tracking-widest">{doc.name}</p>
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline">View Document</a>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const newDocs = formData.documents.filter((_, i) => i !== idx);
                                                            setFormData({...formData, documents: newDocs});
                                                        }}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-full group/zoom">
                                        <div className="flex items-center justify-between px-1 mb-2.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within/zoom:text-[#002855] transition-colors">
                                                Zoom Registration URL (Optional)
                                            </label>
                                            {formData.zoomUrl && (
                                                <button 
                                                    onClick={() => setFormData({...formData, zoomUrl: ""})} 
                                                    className="text-[9px] font-black text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover/zoom:opacity-100"
                                                >
                                                    <Trash2 size={10} strokeWidth={3} /> Clear
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className={cn(
                                            "relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md",
                                            formData.zoomUrl && "border-blue-100 bg-blue-50/20 shadow-blue-50",
                                            "focus-within:border-[#002855] focus-within:ring-4 focus-within:ring-[#002855]/5"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                    formData.zoomUrl ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 text-slate-400 border border-slate-100"
                                                )}>
                                                    <PlayCircle size={20} strokeWidth={2.5} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            formData.zoomUrl ? "text-blue-600" : "text-slate-400"
                                                        )}>
                                                            {formData.zoomUrl ? "Live Session Link Active" : "No Meeting Link Provided"}
                                                        </span>
                                                        {formData.zoomUrl && (
                                                            <a href={formData.zoomUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                                                <ExternalLink size={10} strokeWidth={3} />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <input 
                                                        className="w-full bg-transparent border-none p-0 text-xs font-bold text-[#002855] outline-none placeholder:text-slate-300 truncate tracking-tight"
                                                        value={formData.zoomUrl}
                                                        onChange={e => setFormData({...formData, zoomUrl: e.target.value})}
                                                        placeholder="https://us06web.zoom.us/meeting/register/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 px-1 text-[9px] text-slate-400 font-medium italic">Learners will be redirected here after successful check-in.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'marketing' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-black">03</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">Marketing Architect</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">LinkedIn Copy</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none min-h-[150px]"
                                                value={formData.marketingCopy.linkedin}
                                                onChange={e => setFormData({...formData, marketingCopy: {...formData.marketingCopy, linkedin: e.target.value}})}
                                                placeholder="Professional networking post..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Instagram Copy</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none min-h-[150px]"
                                                value={formData.marketingCopy.instagram}
                                                onChange={e => setFormData({...formData, marketingCopy: {...formData.marketingCopy, instagram: e.target.value}})}
                                                placeholder="Visual storytelling post..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Email Template</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:bg-white focus:border-blue-500 transition-all outline-none min-h-[340px]"
                                                value={formData.marketingCopy.email}
                                                onChange={e => setFormData({...formData, marketingCopy: {...formData.marketingCopy, email: e.target.value}})}
                                                placeholder="Invitation email content..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'verification' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex flex-col gap-12">
                                    {/* Secret Words Section */}
                                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-12 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-12">
                                            <h2 className="text-3xl font-black text-[#002855] uppercase italic tracking-tighter">Secret Verification Words</h2>
                                            <button 
                                                onClick={() => setFormData({...formData, secretWords: [...formData.secretWords, ""]})}
                                                className="bg-slate-50 border-2 border-slate-100 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-600 hover:bg-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Add Word
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formData.secretWords.map((word, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="w-12 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">#{i+1}</div>
                                                    <div className="relative flex-1">
                                                        <input 
                                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-[#002855] focus:bg-white focus:border-blue-500 transition-all outline-none"
                                                            value={word}
                                                            onChange={e => {
                                                                const newWords = [...formData.secretWords];
                                                                newWords[i] = e.target.value;
                                                                setFormData({...formData, secretWords: newWords});
                                                            }}
                                                            placeholder={`Enter secret word ${i+1}...`}
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const newWords = formData.secretWords.filter((_, idx) => idx !== i);
                                                                setFormData({...formData, secretWords: newWords});
                                                            }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Standard events require 2-4 secret words for compliance.</p>
                                    </div>

                                    {/* Knowledge Quiz Section */}
                                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-12">
                                        <div className="flex justify-between items-center mb-12">
                                            <h2 className="text-3xl font-black text-[#002855] uppercase italic tracking-tighter">Knowledge Quiz</h2>
                                            <button 
                                                onClick={() => {
                                                    const newQuiz = [...(formData.quiz || [])];
                                                    newQuiz.push({
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        question: "",
                                                        options: ["", "", "", ""],
                                                        correctAnswer: "",
                                                        type: "multiple_choice"
                                                    });
                                                    setFormData({...formData, quiz: newQuiz});
                                                }}
                                                className="bg-slate-50 border-2 border-slate-100 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-600 hover:bg-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Add Question
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            {formData.quiz?.map((q, i) => (
                                                <div key={q.id} className="p-8 rounded-[2rem] border-2 border-slate-50 bg-slate-50/30 relative">
                                                    <button 
                                                        onClick={() => {
                                                            const newQuiz = formData.quiz?.filter((_, idx) => idx !== i);
                                                            setFormData({...formData, quiz: newQuiz});
                                                        }}
                                                        className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-all"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                    
                                                    <div className="grid grid-cols-3 gap-6 mb-6">
                                                        <div className="col-span-2">
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Question {i+1}</label>
                                                            <input 
                                                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-[#002855] focus:border-blue-500 outline-none"
                                                                value={q.question}
                                                                onChange={e => {
                                                                    const newQuiz = [...(formData.quiz || [])];
                                                                    newQuiz[i].question = e.target.value;
                                                                    setFormData({...formData, quiz: newQuiz});
                                                                }}
                                                                placeholder="Enter question text..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                                            <select className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-[#002855] outline-none appearance-none">
                                                                <option>Multiple Choice</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {q.options?.map((opt: string, optIdx: number) => (
                                                            <div key={optIdx} className="flex items-center gap-3">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`correct-${q.id}`} 
                                                                    checked={q.correctAnswer === opt && opt !== ""}
                                                                    onChange={() => {
                                                                        const newQuiz = [...(formData.quiz || [])];
                                                                        newQuiz[i].correctAnswer = opt;
                                                                        setFormData({...formData, quiz: newQuiz});
                                                                    }}
                                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                                />
                                                                <input 
                                                                    className="flex-1 bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 focus:border-blue-500 outline-none"
                                                                    value={opt}
                                                                    onChange={e => {
                                                                        const newQuiz = [...(formData.quiz || [])];
                                                                        newQuiz[i].options![optIdx] = e.target.value;
                                                                        setFormData({...formData, quiz: newQuiz});
                                                                    }}
                                                                    placeholder={`Option ${optIdx + 1}...`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-12 flex justify-end">
                                            <button onClick={handleSave} className="bg-[#002855] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg">
                                                <Save size={16} /> Save Event Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-black">05</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">Feedback & Evaluation</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <div>
                                                <p className="text-sm font-bold text-[#002855]">Require Feedback</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mandatory for CEU Issuance</p>
                                            </div>
                                            <button 
                                                onClick={() => setFormData({...formData, requiresFeedback: !formData.requiresFeedback})}
                                                className={`w-14 h-8 rounded-full p-1 transition-all ${formData.requiresFeedback ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.requiresFeedback ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Feedback Prompt</label>
                                            <input 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-[#002855] focus:bg-white focus:border-amber-500 transition-all outline-none"
                                                value={formData.feedbackPrompt}
                                                onChange={e => setFormData({...formData, feedbackPrompt: e.target.value})}
                                                placeholder="e.g. How would you rate this training?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rbt' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-black">02</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">RBT & PDU Requirements</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Learning Objectives</h4>
                                            <div className="space-y-4">
                                                {formData.learningObjectives.map((obj, i) => (
                                                    <textarea 
                                                        key={i}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-600 focus:border-rose-500 outline-none"
                                                        value={obj}
                                                        onChange={e => {
                                                            const newObj = [...formData.learningObjectives];
                                                            newObj[i] = e.target.value;
                                                            setFormData({...formData, learningObjectives: newObj});
                                                        }}
                                                        placeholder={`Objective ${i+1}...`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Monitoring Procedures</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:bg-white focus:border-rose-500 transition-all outline-none min-h-[150px]"
                                                value={formData.monitoringProcedures}
                                                onChange={e => setFormData({...formData, monitoringProcedures: e.target.value})}
                                                placeholder="How will attendance be monitored? (e.g. Active response prompts, secret words)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'registration' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">04</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">Registration Logic</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Status</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {(['draft', 'published', 'completed'] as const).map(status => (
                                                    <button 
                                                        key={status}
                                                        onClick={() => setFormData({...formData, status})}
                                                        className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border-2 transition-all ${formData.status === status ? 'bg-[#002855] text-white border-[#002855]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">07</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">CEU Delivery Email</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Email Subject Line</label>
                                            <input 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-[#002855] focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                                value={formData.marketingCopy.email || ''} 
                                                onChange={e => setFormData({...formData, marketingCopy: {...formData.marketingCopy, email: e.target.value}})}
                                                placeholder="Your CEU Certificate is Ready!"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">This email will be automatically sent when a learner successfully completes verification.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'finalize' && (
                            <div className="space-y-12 animate-in fade-in duration-500 text-center py-12">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle className="text-blue-600" size={48} />
                                </div>
                                <h2 className="text-4xl font-black text-[#002855] uppercase tracking-tighter italic">Ready for Launch?</h2>
                                <p className="text-slate-500 max-w-md mx-auto font-medium">Review all sections before publishing. Once published, the event will appear on the public landing page for registration.</p>
                                <div className="flex justify-center gap-6 mt-12">
                                    <button 
                                        onClick={handleSave}
                                        className="bg-[#002855] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all"
                                    >
                                        Save & Finalize Architect
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">09</div>
                                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tight italic">Event Data Vault</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Legacy Export</p>
                                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Download JSON</button>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attendee Roster</p>
                                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Download CSV</button>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Audit</p>
                                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Generate PDF</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab !== 'core' && activeTab !== 'marketing' && activeTab !== 'verification' && activeTab !== 'feedback' && activeTab !== 'rbt' && activeTab !== 'registration' && activeTab !== 'email' && activeTab !== 'finalize' && activeTab !== 'data') && (
                            <div className="h-[500px] flex flex-col items-center justify-center text-slate-300">
                                <div className="w-20 h-20 border-4 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4">
                                    <Settings size={32} className="animate-spin-slow" />
                                </div>
                                <p className="font-black uppercase tracking-widest italic">Architect View {activeTab} Loading...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        );
    }
    