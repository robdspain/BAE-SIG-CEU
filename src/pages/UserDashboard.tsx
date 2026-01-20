import { useUser, UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileText, Calendar, Download } from "lucide-react";
import { Link } from "react-router-dom";

export function UserDashboard() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    
    const certificates = useQuery(api.certificates.getMyCertificates, 
        email ? { email } : "skip"
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded text-white">
                                <FileText size={20} />
                            </div>
                            <span className="font-bold text-xl text-gray-800">My Certificates</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">Event Check-In</Link>
                            <UserButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
                    <p className="text-gray-500">Manage and download your continuing education certificates.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Certificate History</h2>
                        {certificates && (
                            <span className="text-sm text-gray-500">
                                Total CEUs: {certificates.reduce((acc, curr) => acc + (curr.hours || 0), 0)}
                            </span>
                        )}
                    </div>

                    {!certificates ? (
                        <div className="p-12 text-center text-gray-400">Loading your history...</div>
                    ) : certificates.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No certificates found</h3>
                            <p className="text-gray-500 mt-2">
                                If you checked in with a different email ({email}),<br/>
                                please contact support to merge your records.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {certificates.map((cert) => (
                                <div key={cert._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                cert.type === 'Ethics' ? 'bg-amber-100 text-amber-800' :
                                                cert.type === 'Supervision' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {cert.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(cert.eventDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{cert.eventTitle}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Instructor: {cert.instructor}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-2xl font-bold text-gray-900">{cert.hours}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">CE Hours</div>
                                        </div>
                                        
                                        <Link 
                                            to={`/certificate/${cert._id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                                        >
                                            <Download size={16} />
                                            Download
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
