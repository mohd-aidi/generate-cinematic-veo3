import React, { useState, useRef } from 'react';
import ApiKeyGuard from './components/ApiKeyGuard';
import VideoPlayer from './components/VideoPlayer';
import LoadingOverlay from './components/LoadingOverlay';
import { generateVideo } from './services/geminiService';
import { GenerationState, VideoGenerationConfig } from './types';

const DEFAULT_PROMPT = "A 5-second cinematic video of a realistic grey tabby cat driving a Proton Persona on a Malaysian highway. The camera follows the car from outside, showing the cat holding the steering wheel. KLCC towers appear clearly in the background skyline. Smooth daylight lighting, stable motion, high detail, no shaking, no cartoon style.";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  const [state, setState] = useState<GenerationState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState({ status: 'generating', progressMessage: "Initializing request..." });

    try {
      const config: VideoGenerationConfig = {
        prompt,
        image: selectedImage,
        aspectRatio,
        resolution,
      };

      const videoUrl = await generateVideo(config, (msg) => {
        setState(prev => ({ ...prev, status: 'polling', progressMessage: msg }));
      });

      setState({ status: 'completed', videoUrl });
    } catch (error: any) {
      // If we encounter "Requested entity was not found", we should prompt to re-select key.
      // However, managing the ApiKeyGuard state from here is tricky without context or global state.
      // For now, show the error clearly.
      setState({ status: 'failed', error: error.message });
      
      if (error.message.includes("Requested entity was not found")) {
        // Simple alert to guide user, in a real app this would trigger the guard reset
        alert("API Key not found or invalid. Please refresh to select a new key.");
      }
    }
  };

  const handleDownload = () => {
    if (state.videoUrl) {
      const a = document.createElement('a');
      a.href = state.videoUrl;
      a.download = `veo-generation-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ApiKeyGuard>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Cinematic Veo Studio
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider hidden sm:block">Powered by Gemini Veo</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Prompt Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-400">Video Prompt</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm leading-relaxed text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-zinc-600 resize-none h-40"
                    placeholder="Describe your video in detail..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-zinc-600 font-mono">
                    {prompt.length} chars
                  </div>
                </div>
              </div>

              {/* Image Input Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-400">Reference Image (Optional)</label>
                {!selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group w-full h-32 border-2 border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-600 group-hover:text-purple-400 transition-colors mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-sm text-zinc-500 group-hover:text-zinc-300">Click to upload an image</span>
                  </div>
                ) : (
                  <div className="relative w-full h-32 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Preview" 
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={removeImage}
                        className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-transform hover:scale-105"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56-.172a6.022 6.022 0 01-1.383-1.147 2.25 2.25 0 01-4.244 0A6.022 6.022 0 019.5 7.427l-.56.172a.75.75 0 11-.49-1.478 48.816 48.816 0 013.878-.512V4.477a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25zM4.457 9.756a1.5 1.5 0 011.053-.906l1.21-.36a3.75 3.75 0 001.776-1.042l.063-.075.064.075a3.75 3.75 0 001.776 1.042l1.21.36c.42.126.784.444 1.053.906.51.874 1.026 2.055 1.488 3.518.52 1.65.918 3.444 1.157 5.253a1.5 1.5 0 01-1.486 1.638H5.978a1.5 1.5 0 01-1.486-1.638c.239-1.81.637-3.603 1.157-5.253.462-1.463.978-2.644 1.488-3.518z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden" 
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-500 uppercase">Aspect Ratio</label>
                  <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                        aspectRatio === '16:9' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      16:9
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                        aspectRatio === '9:16' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      9:16
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-500 uppercase">Resolution</label>
                   <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setResolution('720p')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                        resolution === '720p' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      720p
                    </button>
                    <button
                      onClick={() => setResolution('1080p')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                        resolution === '1080p' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      1080p
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {state.status === 'failed' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {state.error || "An unexpected error occurred."}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={state.status === 'generating' || state.status === 'polling' || !prompt.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] ${
                  state.status === 'generating' || state.status === 'polling'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                }`}
              >
                 {state.status === 'generating' || state.status === 'polling' ? 'Processing...' : 'Generate Video'}
              </button>

            </div>

            {/* Right Column: Preview / Result */}
            <div className="lg:col-span-8 min-h-[500px] lg:h-[calc(100vh-160px)] relative">
              
              {(state.status === 'generating' || state.status === 'polling') && (
                <LoadingOverlay message={state.progressMessage || 'Working magic...'} />
              )}

              {state.status === 'completed' && state.videoUrl ? (
                <VideoPlayer src={state.videoUrl} onDownload={handleDownload} />
              ) : (
                <div className="w-full h-full bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-zinc-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-2.625A1.125 1.125 0 0121.75 5.625v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25M12 10.5v3m0 0l-1.5-1.5m1.5 1.5l1.5-1.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-300 mb-2">Ready to Create</h3>
                  <p className="text-zinc-500 max-w-md">
                    Enter a prompt on the left, optionally upload an image, and click Generate to see the Veo model in action.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ApiKeyGuard>
  );
};

export default App;