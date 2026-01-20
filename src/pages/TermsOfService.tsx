export function TermsOfService() {
    return (
        <div className="min-h-screen bg-white py-20 px-4">
            <div className="max-w-3xl mx-auto prose prose-slate">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-gray-600 mb-4">Last Updated: January 13, 2026</p>
                
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. Attendance Verification</h2>
                    <p>To receive CEU credit, participants must check in and, if applicable, provide secret verification words or pass a quiz as required by the specific event configuration.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">2. Certificate Issuance</h2>
                    <p>Certificates are issued electronically. It is the responsibility of the learner to ensure their email and certification numbers are entered correctly at the time of check-in.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">3. Refund & Complaint Policy</h2>
                    <p>Concerns regarding specific events should be submitted via our official Complaint Portal within 30 days of the event date.</p>
                </section>

                <div className="mt-20 pt-10 border-t text-sm text-gray-400">
                    Behavior Analysis and Enterprise Special Interest Group (BAE SIG)
                </div>
            </div>
        </div>
    );
}
