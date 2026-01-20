import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface PremiumInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    icon: LucideIcon;
    placeholder?: string;
    type?: string;
    className?: string;
    isTextarea?: boolean;
    options?: { label: string, value: string }[]; // For selects
}

export default function PremiumInput({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    placeholder, 
    type = "text", 
    className, 
    isTextarea,
    options
}: PremiumInputProps) {
    const hasValue = !!value;

    return (
        <div className={cn("flex flex-col gap-2 group", className)}>
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#002855] transition-colors">
                    {label}
                </label>
            </div>
            
            <div className={cn(
                "relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md",
                hasValue ? "border-blue-100 bg-blue-50/10" : "bg-white",
                "focus-within:border-[#002855] focus-within:ring-4 focus-within:ring-[#002855]/5 focus-within:bg-white"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        hasValue ? "bg-[#002855] text-white shadow-lg shadow-blue-900/10" : "bg-slate-100 text-slate-400 border border-slate-100"
                    )}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        {options ? (
                            <select
                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-[#002855] outline-none appearance-none cursor-pointer"
                                value={value}
                                onChange={e => onChange(e.target.value)}
                            >
                                {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : isTextarea ? (
                            <textarea
                                className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300 min-h-[80px] resize-none"
                                value={value}
                                onChange={e => onChange(e.target.value)}
                                placeholder={placeholder}
                            />
                        ) : (
                            <input 
                                type={type}
                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-[#002855] outline-none placeholder:text-slate-300"
                                value={value}
                                onChange={e => onChange(e.target.value)}
                                placeholder={placeholder}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
