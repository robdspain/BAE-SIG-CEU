import { Link } from "react-router-dom";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useUserSync } from "../hooks/useUserSync";

export const BAE_SIG_LOGO = ({ className = "w-full h-auto" }: { className?: string }) => (
    <img src="/bae-sig-logo.png" alt="BAE SIG Logo" className={className} />
);

export function SiteLayout({ children }: { children: React.ReactNode }) {
    useUserSync(); // Automatically sync user data to Convex on login

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            {/* Top Bar - Premium Blue & Gold */}
            <nav className="w-full bg-[#002855] py-4 px-4 sm:px-8 border-b-4 border-[#FFB81C] flex justify-center sticky top-0 z-50 shadow-xl">
                <div className="max-w-7xl w-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
                        <div className="bg-white p-1 rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg group-hover:scale-105 transition-transform">
                            <BAE_SIG_LOGO className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#FFB81C] text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1">Special Interest Group</span>
                            <p className="text-white text-sm sm:text-base font-black uppercase tracking-tight">BAE SIG Registry</p>
                        </div>
                    </Link>
                    
                    <div className="flex items-center gap-4 sm:gap-6">
                        <nav className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
                            <Link to="/" className="hover:text-[#FFB81C] transition-colors">Home</Link>
                            <Link to="/dashboard" className="hover:text-[#FFB81C] transition-colors">My Certificates</Link>
                        </nav>

                        <SignedIn>
                            <div className="flex items-center gap-4">
                                <Link to="/admin" className="bg-[#FFB81C] text-[#002855] px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:scale-105 transition shadow-lg">
                                    Admin
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-white text-[#002855] px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#FFB81C] transition shadow-md border-b-2 border-slate-300">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="bg-white border-t border-slate-200 py-16 sm:py-20 px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Policy Notice */}
                    <div className="w-full bg-slate-50 py-4 px-6 rounded-2xl border border-slate-200 text-center mb-12">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">
                            <span className="text-[#002855] px-2 py-0.5 border border-[#002855]/20 rounded mr-2">Policy Notice</span>
                            CEUs are only available for live attendance. Recorded content is for professional development only.
                        </p>
                        <div className="flex justify-center gap-6">
                            <Link to="/privacy" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#002855] hover:underline">Privacy Policy</Link>
                            <Link to="/terms" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#002855] hover:underline">Terms of Service</Link>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 sm:h-16 sm:w-16">
                                <BAE_SIG_LOGO className="h-full w-full" />
                            </div>
                            <div className="flex flex-col text-left">
                                <p className="text-[#002855] text-base sm:text-lg font-black uppercase tracking-tight leading-none mb-1">BAE SIG Registry</p>
                                <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Authorized via California Association for Behavior Analysis</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link to="/dashboard" className="text-slate-400 hover:text-[#002855] text-[10px] font-bold uppercase tracking-widest transition underline underline-offset-4">
                                    My Certificates
                                </Link>
                                <Link to="/complaints" className="text-slate-400 hover:text-[#002855] text-[10px] font-bold uppercase tracking-widest transition underline underline-offset-4">
                                    Submit a Concern
                                </Link>
                            </div>
                        </div>
                        
                        <div className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-center md:text-right max-w-[200px] md:max-w-none">
                            © 2026 BAE SIG • California Association for Behavior Analysis
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}