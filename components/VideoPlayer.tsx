import React from 'react';

interface VideoPlayerProps {
  src: string;
  onDownload: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onDownload }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      <video
        className="w-full max-h-[60vh] object-contain"
        controls
        autoPlay
        loop
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="w-full bg-zinc-900 p-4 border-t border-zinc-800 flex justify-between items-center">
        <span className="text-sm text-zinc-400 font-medium">Generated with Veo</span>
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h7.5" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;