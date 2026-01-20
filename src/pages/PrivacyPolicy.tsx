export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white py-20 px-4">
            <div className="max-w-3xl mx-auto prose prose-slate">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-600 mb-4">Last Updated: January 13, 2026</p>
                
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
                    <p>We collect participant names, email addresses, and certification numbers (BCBA/RBT) solely for the purpose of issuing continuing education certificates and maintaining a registry required by the BACB.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">2. ACE Provider Compliance</h2>
                    <p>As an ACE Provider, we are required to maintain records of attendance and certificate issuance for a minimum of 7 years. Your data is stored securely in our cloud registry for this purpose.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
                    <p>We do not sell your personal data. Your records may be shared with the Behavior Analyst Certification Board (BACB) only upon their official request for audit purposes.</p>
                </section>

                <div className="mt-20 pt-10 border-t text-sm text-gray-400">
                    Behavior Analysis and Enterprise Special Interest Group (BAE SIG)
                </div>
            </div>
        </div>
    );
}
