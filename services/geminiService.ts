import { GoogleGenAI } from "@google/genai";
import { ImageStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStyleDescription = (style: ImageStyle): string => {
  switch (style) {
    case ImageStyle.REALISTIC: return 'Photorealistic, professional corporate photography, depth of field, 8k resolution';
    case ImageStyle.ILLUSTRATION: return 'Modern vector illustration, vibrant colors, tech aesthetic, flat design, trending on dribbble';
    case ImageStyle.FUTURISTIC: return 'Cyberpunk lite, neon accents, holographic interfaces, dark mode aesthetic, glowing elements';
    case ImageStyle.MINIMALIST: return 'Clean, white background, abstract shapes, corporate memphis style, soft pastel colors, negative space';
    case ImageStyle.DRAMATIC: return 'High contrast, cinematic lighting, intense atmosphere, detailed textures, ray tracing';
    case ImageStyle.SKETCH: return 'Black and white pencil sketch, architectural drawing style, rough lines';
    case ImageStyle.PIXEL_ART: return '16-bit pixel art, retro aesthetic, vibrant palette';
    default: return '';
  }
};

/**
 * Generates or Edits an image.
 * If sourceImageBase64 is provided, it performs an edit.
 * Otherwise, it generates a new image.
 */
export const generateOrEditImage = async (
  params: {
    postContext?: string;
    imageDescription: string;
    style?: ImageStyle;
    sourceImageBase64?: string; // For editing
  }
): Promise<string> => {
  const { postContext, imageDescription, style, sourceImageBase64 } = params;
  
  try {
    const parts: any[] = [];

    // 1. Handle Editing (Image + Text)
    if (sourceImageBase64) {
      // Strip the data URL prefix to get just the base64 string
      const base64Data = sourceImageBase64.split(',')[1];
      
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      });
      
      parts.push({
        text: `Edit this image. Instructions: ${imageDescription}. Maintain the original aspect ratio and high quality.`
      });
    } 
    // 2. Handle New Generation (Text only)
    else {
      let fullPrompt = `Create a professional image for a LinkedIn post.\n\n`;
      
      if (postContext) {
        fullPrompt += `POST CONTEXT (The image should be relevant to this topic):\n"${postContext}"\n\n`;
      }
      
      fullPrompt += `IMAGE DESCRIPTION (Specific visual content):\n${imageDescription}\n\n`;
      
      if (style) {
        fullPrompt += `VISUAL STYLE: ${getStyleDescription(style)}\n\n`;
      }

      fullPrompt += `REQUIREMENTS:
      - Aspect Ratio: Square (1:1)
      - No text inside the image usually, unless specified.
      - High quality, detailed, safe for work.`;

      parts.push({ text: fullPrompt });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        // For standard generation, config is optional or specific to other models.
        // gemini-2.5-flash-image defaults work well.
      }
    });

    // Extract image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image returned from Gemini.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
