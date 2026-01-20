import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ErrorBoundary } from './components/ErrorBoundary';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("App Bootstrapping:", { hasConvexUrl: !!convexUrl, hasClerkKey: !!clerkKey });

try {
    const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
            {clerkKey ? (
                <ClerkProvider publishableKey={clerkKey}>
                    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                        <App />
                    </ConvexProviderWithClerk>
                </ClerkProvider>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-red-800 font-bold">
                    VITE_CLERK_PUBLISHABLE_KEY is missing. Check your .env.local file.
                </div>
            )}
        </ErrorBoundary>
      </StrictMode>,
    )
} catch (err) {
    console.error("Critical Bootstrap Error:", err);
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Critical Error</h1><p>${err instanceof Error ? err.message : String(err)}</p></div>`;
}
