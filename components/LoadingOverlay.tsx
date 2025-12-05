import React from 'react';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 rounded-xl">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-zinc-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Generating Video</h3>
      <p className="text-zinc-400 text-center max-w-sm animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingOverlay;