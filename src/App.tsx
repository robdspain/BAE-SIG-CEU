import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import CheckInApp from "./CheckInApp";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { EventDetail } from "./pages/admin/EventDetail";
import { CertificatePage } from "./pages/CertificatePage";
import { UserDashboard } from "./pages/UserDashboard";
import { EventWizard } from "./pages/admin/EventWizard";
import { EmailListManagement } from "./pages/admin/EmailListManagement";
import { BrandVoiceSettings } from "./pages/admin/BrandVoiceSettings";
import { SocialMediaArchitect } from "./pages/admin/SocialMediaArchitect";
import { AuditPortal } from "./pages/AuditPortal";
import { ComplaintPortal } from "./pages/ComplaintPortal";
import { RBTPDUForm } from "./pages/RBTPDUForm";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { SiteLayout } from "./layouts/SiteLayout";
import { LegacyEventLanding } from "./pages/LegacyEventLanding";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth();
    
    if (!isLoaded) return <div className="h-screen flex items-center justify-center">Loading Auth...</div>;
    if (!isSignedIn) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CheckInApp />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/event/:eventId" element={<LegacyEventLanding />} />
            <Route path="/audit" element={<AuditPortal />} />
            <Route path="/complaints" element={<ComplaintPortal />} />
            <Route path="/rbt" element={<RBTPDUForm />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <UserDashboard />
                </ProtectedRoute>
            } />

            <Route path="/certificate/:id" element={
                <ProtectedRoute>
                    <CertificatePage />
                </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/event/new" element={<Navigate to="/admin/events/new" replace />} />
            <Route path="/admin/event/:id" element={<Navigate to="/admin/events/:id" replace />} />
            <Route path="/admin/events/new" element={
                <ProtectedRoute>
                    <EventWizard />
                </ProtectedRoute>
            } />
            <Route path="/admin/events/:id" element={
                <ProtectedRoute>
                    <EventDetail />
                </ProtectedRoute>
            } />
            <Route path="/admin/events/:id/edit" element={
                <ProtectedRoute>
                    <EventWizard />
                </ProtectedRoute>
            } />
            <Route path="/admin/emails" element={
                <ProtectedRoute>
                    <EmailListManagement />
                </ProtectedRoute>
            } />
            <Route path="/admin/brand" element={
                <ProtectedRoute>
                    <BrandVoiceSettings />
                </ProtectedRoute>
            } />
            <Route path="/admin/architect" element={
                <ProtectedRoute>
                    <SocialMediaArchitect />
                </ProtectedRoute>
            } />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App;
