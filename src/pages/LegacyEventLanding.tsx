import { useQuery } from "convex/react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { CertificatePrintView } from "../components/CertificateTemplate";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, ArrowLeft, ShieldCheck, Mail } from "lucide-react";

export function LegacyEventLanding() {
    const { eventId } = useParams();
    const [searchParams] = useSearchParams();
    
    // Parse legacy params
    const certId = searchParams.get('cert');
    const email = searchParams.get('email');
    const lastName = searchParams.get('last');

    // If we have an email and eventId, try to find the attendee record
    // First, find the event by its legacy ID (e.g. OP-04-0012)
    const event = useQuery(api.events.getByLegacyId, eventId ? { legacyId: eventId } : "skip");
    
    // Once we have the Convex event, find the attendee by email
    const attendee = useQuery(api.attendees.getAttendeeByEmail, (event && email) ? { 
        eventId: event._id, 
        email: email.toLowerCase().trim()
    } : "skip");

    // Fetch coordinator for signature
    const coordinator = useQuery(api.users.getByName, event?.aceCoordinatorName ? { 
        name: event.aceCoordinatorName 
    } : "skip");

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Certificate-${lastName || attendee?.lastName || 'BAE'}`,
    });

    // If no cert is requested, this is just a redirect to the main check-in
    if (!certId) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Event Registry</h1>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        It looks like you're trying to access an event. Please use our main check-in portal to register or claim credit.
                    </p>
                    <Link 
                        to="/"
                        className="block w-full py-4 bg-[#002855] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-[#003875] transition-all"
                    >
                        Go to Check-In
                    </Link>
                </div>
            </div>
        );
    }

    // If cert is requested but not found yet (Loading)
    if (event === undefined || attendee === undefined) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locating Certificate Record...</p>
                </div>
            </div>
        );
    }

    // Records not found
    if (event === null || attendee === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="text-red-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Record Not Found</h1>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        We couldn't locate a verified certificate for <strong>{email}</strong> at this event. 
                        Please ensure the link is correct or contact support if you believe this is an error.
                    </p>
                    <Link 
                        to="/"
                        className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-12 flex flex-col items-center gap-8">
            {/* Legacy Compatibility Toolbar */}
            <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6 w-full max-w-[1100px] border border-blue-100 print:hidden animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-xl text-green-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase italic leading-none">Verified Certificate</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Record Found</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handlePrint()}
                        className="bg-[#002855] hover:bg-[#003875] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                        <Printer size={18} />
                    </button>
                </div>
            </div>

            {/* Certificate Render */}
            <div className="shadow-2xl print:shadow-none animate-in fade-in zoom-in duration-700 delay-200 origin-top scale-[0.6] sm:scale-[0.8] md:scale-100">
                <CertificatePrintView 
                    ref={componentRef}
                    recipientName={`${attendee.firstName} ${attendee.lastName}`}
                    courseTitle={event.title}
                    date={event.date}
                    hours={event.hours}
                    type={event.type}
                    instructor={event.instructorName}
                    providerId={event.providerId}
                    certId={attendee._id}
                    bcbaNumber={attendee.bcbaNumber || attendee.rbtNumber}
                    aceCoordinatorName={event.aceCoordinatorName}
                    aceOrganizationName={event.aceOrganizationName}
                    aceProviderType={event.providerId === "OP-04-0012" ? "Organization" : "Individual"}
                    signatureUrl={coordinator?.signatureUrl}
                />
            </div>

            <div className="mt-8 text-center print:hidden">
                <Link to="/dashboard" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                    <ArrowLeft size={14} /> View All My Certificates
                </Link>
            </div>
        </div>
    );
}
