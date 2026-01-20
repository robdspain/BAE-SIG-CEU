import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Upload, Cloud, X, CheckCircle2, Loader2, ExternalLink, Paperclip } from "lucide-react";
import { isDriveUrl } from "../../hooks/useDrive";
import { cn } from "../../lib/utils";

interface DocumentFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    subText?: string;
}

export default function DocumentField({ label, value, onChange, placeholder, subText }: DocumentFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const isDrive = isDriveUrl(value);
    const isConvex = value.startsWith("convex://");
    const hasValue = !!value;

    const triggerSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!result.ok) throw new Error("Upload failed");
            const { storageId } = await result.json();
            onChange(`convex://storage/${storageId}`); 
            triggerSuccess();
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDriveClick = () => {
        const url = prompt("Paste Google Drive Share Link:");
        if (url) {
            if (isDriveUrl(url)) {
                onChange(url);
                triggerSuccess();
            }
            else alert("Invalid Google Drive URL");
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {label}
                </label>
                {hasValue && (
                    <button 
                        onClick={() => onChange("")} 
                        className="text-[9px] font-black text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                        <X size={10} strokeWidth={3} /> Clear
                    </button>
                )}
            </div>
            
            <div className={cn(
                "relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-500",
                "shadow-sm hover:shadow-md",
                hasValue && isDrive && "border-blue-200 bg-blue-50/20",
                hasValue && isConvex && "border-emerald-200 bg-emerald-50/20",
                showSuccess && "border-emerald-400 bg-emerald-50 ring-4 ring-emerald-500/10"
            )}>
                {/* Success Overlay Flash */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-emerald-500/5 z-20 pointer-events-none animate-in fade-in out-fade-out duration-1000" />
                )}

                {/* Content Area */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                        hasValue ? "bg-[#002855] text-white shadow-lg shadow-blue-900/10" : "bg-slate-100 text-slate-400",
                        hasValue && isDrive && "bg-blue-600 shadow-blue-500/20",
                        hasValue && isConvex && "bg-emerald-600 shadow-emerald-500/20",
                        showSuccess && "bg-emerald-500 scale-110 rotate-[360deg]"
                    )}>
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : 
                         showSuccess ? <CheckCircle2 size={20} strokeWidth={3} /> :
                         isDrive ? <Cloud size={18} strokeWidth={2.5} /> : 
                         isConvex ? <CheckCircle2 size={18} strokeWidth={2.5} /> : 
                         <Paperclip size={18} strokeWidth={2.5} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-colors duration-500",
                                showSuccess ? "text-emerald-600" : isDrive ? "text-blue-600" : isConvex ? "text-emerald-600" : "text-slate-400"
                            )}>
                                {showSuccess ? "Success! Ready for Audit" : isDrive ? "Google Drive" : isConvex ? "Verified File" : "No Attachment"}
                            </span>
                            {hasValue && value.startsWith("http") && !showSuccess && (
                                <a href={value} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <ExternalLink size={10} strokeWidth={3} />
                                </a>
                            )}
                        </div>
                        <input 
                            className="w-full bg-transparent border-none p-0 text-xs font-bold text-[#002855] outline-none placeholder:text-slate-300 truncate"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder || "Link or Upload..."}
                        />
                    </div>
                </div>

                {/* Fixed-Width Actions */}
                <div className="grid grid-cols-2 gap-2 relative z-30">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 h-9 px-2 bg-[#002855] text-white rounded-xl font-black uppercase tracking-widest text-[8px] whitespace-nowrap hover:bg-[#003875] transition-all disabled:opacity-50 active:scale-95",
                            showSuccess && "bg-emerald-600 hover:bg-emerald-700"
                        )}
                    >
                        <Upload size={12} strokeWidth={3} />
                        {uploading ? "..." : "Local Upload"}
                    </button>
                    <button 
                        type="button"
                        onClick={handleDriveClick}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 h-9 px-2 bg-white border border-slate-200 text-[#002855] rounded-xl font-black uppercase tracking-widest text-[8px] whitespace-nowrap hover:border-blue-200 hover:bg-blue-50/50 transition-all active:scale-95",
                            showSuccess && "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                        )}
                    >
                        <Cloud size={12} strokeWidth={2.5} className={cn("text-blue-500", showSuccess && "text-emerald-500")} />
                        Drive Link
                    </button>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" />
            </div>
            {subText && <span className="px-1 text-[9px] text-slate-400 font-medium italic">{subText}</span>}
        </div>
    );
}



