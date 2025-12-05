import { GoogleGenAI } from "@google/genai";
import { VideoGenerationConfig } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateVideo = async (
  config: VideoGenerationConfig,
  onProgress: (msg: string) => void
): Promise<string> => {
  // Always create a new instance to ensure we have the latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'veo-3.1-fast-generate-preview';

  onProgress("Initializing generation...");

  let imagePart = undefined;
  if (config.image) {
    const base64Data = await fileToBase64(config.image);
    imagePart = {
      imageBytes: base64Data,
      mimeType: config.image.type,
    };
  }

  try {
    // Initial generation request
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: config.prompt,
      image: imagePart,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio,
      },
    });

    onProgress("Video generation started. This may take a few minutes...");

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      onProgress("Still processing... Creating your cinematic masterpiece...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Unknown error during video generation");
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from the API.");
    }

    // Append API key to the URL for access
    const authenticatedUrl = `${videoUri}&key=${process.env.API_KEY}`;
    
    // We need to fetch the blob to serve it locally or just return the authenticated URL
    // Returning the authenticated URL directly is usually fine for <video src="..."> 
    // but fetching it ensures we can handle any immediate auth errors.
    
    onProgress("Finalizing download...");
    
    // Verify accessibility
    const response = await fetch(authenticatedUrl);
    if (!response.ok) {
       throw new Error(`Failed to fetch generated video: ${response.statusText}`);
    }
    
    // Create a blob URL for smoother playback within the app session
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Video generation error:", error);
    throw new Error(error.message || "Failed to generate video");
  }
};