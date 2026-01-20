import { useQuery } from "convex/react";
import { useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { CertificatePrintView } from "../components/CertificateTemplate";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

export function CertificatePage() {
    const { id } = useParams();
    // In a real app we'd have a specific query for "get certificate by ID" 
    // but for now we'll fetch the attendee and their event
    const attendee = useQuery(api.attendees.getById, { id: id as any });
    const event = useQuery(api.events.get, attendee ? { id: attendee.eventId } : "skip");

    // Fetch coordinator for signature
    const coordinator = useQuery(api.users.getByName, event?.aceCoordinatorName ? { 
        name: event.aceCoordinatorName 
    } : "skip");

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Certificate-${attendee?.lastName}`,
    });

    if (!attendee || !event) return <div className="p-12 text-center">Loading certificate data...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 print:hidden">
                <button 
                    onClick={() => window.history.back()}
                    className="text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                    Back
                </button>
                <button 
                    onClick={() => handlePrint()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
                >
                    <Printer size={20} />
                    Print / Save to PDF
                </button>
            </div>

            {/* Preview Area */}
            <div className="shadow-2xl print:shadow-none">
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
        </div>
    );
}
