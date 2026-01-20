import React from 'react';

export const BAE_SIG_LOGO = (className = "w-full h-auto") => (
  <img src="/bae-sig-logo.png" alt="BAE SIG Logo" className={className} />
);

export const CALABA_BRAND = (className?: string) => (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcgobNHw95adKCw6JOp8GH6ychDG6_zPbT-Q&s"
        alt="CalABA Association Affiliate"
        className="h-full w-auto object-contain max-h-12"
      />
    </div>
);

export const WATERMARK_SVG = (
    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 opacity-[0.05]">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M30,50 L70,50 M50,30 L50,70" stroke="currentColor" strokeWidth="0.5" />
    </svg>
);

export const CertificatePrintView = React.forwardRef<HTMLDivElement, {
    recipientName: string;
    courseTitle: string;
    date: string;
    hours: number;
    type: string;
    instructor: string;
    providerId: string;
    certId: string;
    bcbaNumber?: string;
    signatureUrl?: string;
    aceOrganizationName?: string;
    aceCoordinatorName?: string;
    aceProviderType?: 'Organization' | 'Individual';
    signerRole?: 'Instructor' | 'Coordinator';
}>((props, ref) => {
    const supervisionHours = props.type === 'Supervision' ? props.hours : 0;
    const ethicsHours = props.type === 'Ethics' ? props.hours : 0;

    const coordinatorSource = props.aceCoordinatorName || "Lusineh Gharapetian, PhD, BCBA-D";
    const [sigName, ...sigCreds] = coordinatorSource.split(',');
    const sigCredentialString = sigCreds.join(',').trim();
    const isOrgProvider = props.aceProviderType === 'Organization' || !!props.aceOrganizationName;
    const providerDisplayName = (isOrgProvider ? props.aceOrganizationName : props.instructor) || "Behavior Analysts in Education SIG";

    return (
        <div
            ref={ref}
            className="bg-white w-[1100px] h-[960px] flex flex-col relative mx-auto overflow-hidden font-serif print:shadow-none"
            style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
            }}
        >
            {/* Elegant Double Border Frame */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute inset-0 border-[12px] border-[#002855]"></div>
                <div className="absolute inset-[20px] border-[2px] border-[#FFB81C]"></div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.02]">
                <div className="scale-[3.5]">{WATERMARK_SVG}</div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-20 z-10 m-10">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFB81C]">
                    <path d="M0,0 L100,0 L100,8 L8,8 L8,100 L0,100 Z" fill="currentColor" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 z-10 m-10 rotate-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFB81C]">
                    <path d="M0,0 L100,0 L100,8 L8,8 L8,100 L0,100 Z" fill="currentColor" />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col h-full px-16 pt-12 pb-10">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="w-40">{BAE_SIG_LOGO("w-full h-auto mix-blend-multiply")}</div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mb-1">Official Registry Record</p>
                        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-mono text-[14px] font-bold text-[#002855]">
                            Ref: {props.certId}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <div className="mb-6">
                        <h1 className="text-4xl font-serif text-[#002855] tracking-[0.15em] mb-3 uppercase" style={{ fontVariant: 'small-caps' }}>
                            Certificate of Completion
                        </h1>
                        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-[#FFB81C] to-transparent mx-auto"></div>
                    </div>

                    <p className="text-lg text-slate-600 italic mb-6">
                        This approved continuing education provider hereby certifies that
                    </p>

                    {/* Participant Name */}
                    <div className="mb-8 flex flex-col items-center gap-2">
                        <h2 className="text-6xl font-bold text-[#002855] tracking-tight leading-none mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                            {props.recipientName}
                        </h2>
                        {props.bcbaNumber && (
                            <div className="inline-flex justify-center bg-[#FFF7E1] border border-[#FFB81C] px-6 py-1.5 rounded-full">
                                <p className="text-sm font-bold uppercase tracking-widest text-[#002855]">
                                    BACB Certificant No: {props.bcbaNumber}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-base text-slate-600 italic mb-4">
                        has successfully completed all professional requirements for
                    </p>

                    {/* Course Title */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-10 py-6 shadow-sm mb-8 max-w-4xl">
                        <h3 className="text-2xl font-bold text-[#002855] leading-tight italic">
                            {props.courseTitle}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10 w-full max-w-2xl">
                        <div className="bg-white border border-slate-200 rounded-xl px-6 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Instructor</p>
                            <p className="text-lg font-bold text-[#002855]">{props.instructor}</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl px-6 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Completion Date</p>
                            <p className="text-lg font-bold text-[#002855]">{new Date(props.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* CEU Breakdown */}
                    <div className="w-full max-w-4xl mb-12">
                        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-[#002855] text-white py-2 px-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-center">
                                    Continuing Education Unit Breakdown
                                </h4>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-slate-200">
                                <div className="py-4 text-center bg-amber-50/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total CEUs</p>
                                    <p className="text-4xl font-black text-[#002855]">{props.hours}</p>
                                </div>
                                <div className="py-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ethics</p>
                                    <p className="text-4xl font-black text-[#002855]">{ethicsHours}</p>
                                </div>
                                <div className="py-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Supervision</p>
                                    <p className="text-4xl font-black text-[#002855]">{supervisionHours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t-4 border-[#002855]/10 pt-8 mt-auto">
                    <div className="w-1/3 text-left">
                        <div className="h-10 mb-4 opacity-100 scale-125 origin-left">
                            {CALABA_BRAND()}
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                            ACE Provider {isOrgProvider ? 'Organization' : 'Individual'}
                        </p>
                        <p className="text-sm font-black text-[#002855] mb-3">{providerDisplayName}</p>
                        
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ACE Provider ID</p>
                        <p className="text-2xl font-black text-[#002855] leading-none">{props.providerId}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Authorized by California Association <br/> for Behavior Analysis</p>
                    </div>

                    <div className="w-1/3 text-center px-4 flex flex-col items-center">
                        <div className="mb-2 relative h-16 w-full flex items-center justify-center border-b border-slate-200">
                            {props.signatureUrl ? (
                                <img src={props.signatureUrl} alt="Signature" className="h-full w-auto object-contain" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-dancing text-[#002855] whitespace-nowrap">{sigName}</span>
                                    {sigCredentialString && <span className="text-xs text-slate-400 font-bold uppercase">{sigCredentialString}</span>}
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                            {props.signerRole === 'Instructor' ? 'Lead Instructor' : 'ACE Coordinator'}
                        </p>
                    </div>

                    <div className="w-1/3 text-right">
                        <div className="bg-[#002855] p-3 rounded-full inline-block border-4 border-[#FFB81C] shadow-xl mb-2">
                             <svg className="w-8 h-8 text-[#FFB81C]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 000.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Cryptographically sealed and verified <br/> by the BAE SIG Registry System.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});