export interface VideoGenerationConfig {
  prompt: string;
  image?: File | null;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface VideoResult {
  uri: string;
  mimeType: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'polling' | 'completed' | 'failed';

export interface GenerationState {
  status: GenerationStatus;
  progressMessage?: string;
  videoUrl?: string;
  error?: string;
}

// Augment the global AIStudio interface to include the necessary methods.
// The window.aistudio property is already defined in the environment with type AIStudio.
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}