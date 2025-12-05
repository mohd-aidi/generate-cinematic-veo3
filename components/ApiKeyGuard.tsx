import React, { useEffect, useState } from 'react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for dev environments where window.aistudio might not exist (though strictly required by prompt)
        console.warn("window.aistudio not found. Assuming dev environment or missing extension.");
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success as per instructions to avoid race conditions
        setHasKey(true);
      } catch (e) {
        console.error("Error selecting key:", e);
        // Reset state on error if needed, but instructions say assume success
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse">Checking permissions...</div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <div className="max-w-md space-y-8 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Cinematic Veo Studio
            </h1>
            <p className="text-zinc-400">
              To generate high-quality videos, please select a paid API key from a Google Cloud Project.
            </p>
          </div>

          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c-1.067.322-2.02.854-2.864 1.552l-5.5 5.5a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06 0l1.09-1.092a.463.463 0 01.318-.137h2.175c.252 0 .493-.09.689-.255l2.695-2.277a6.75 6.75 0 104.428-14.509zm0 9a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" clipRule="evenodd" />
            </svg>
            Select API Key
          </button>

          <div className="text-xs text-zinc-500 pt-4 border-t border-zinc-800">
            <p>
              Need help? View the{' '}
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                billing documentation
              </a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeyGuard;