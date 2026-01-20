import { SignInButton } from "@clerk/clerk-react";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
        <p className="text-gray-500 mb-8">Please sign in to manage the Registry.</p>
        
        <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                Sign In securely
            </button>
        </SignInButton>
        
        <div className="mt-6 border-t pt-6">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Kiosk Mode</a>
        </div>
      </div>
    </div>
  );
}
