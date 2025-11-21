export enum ImageStyle {
  REALISTIC = 'Photorealistic',
  ILLUSTRATION = 'Vector Illustration',
  FUTURISTIC = 'Futuristic / Cyberpunk',
  MINIMALIST = 'Minimalist / Clean',
  DRAMATIC = 'Cinematic / Dramatic',
  SKETCH = 'Hand-drawn Sketch',
  PIXEL_ART = 'Pixel Art'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  originalContext?: string;
}

export interface GenerationState {
  status: 'idle' | 'generating' | 'editing' | 'success' | 'error';
  error: string | null;
  data: GeneratedImage | null;
}
