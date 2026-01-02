
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CampaignData, ImageAspectRatio, BrandDNA, GroundingSource } from "../types";

// Create a new instance for every call as per guidelines to ensure latest key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getMimeType = (base64: string): string => {
  const match = base64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

export const generateCampaign = async (prompt: string, brand: BrandDNA): Promise<CampaignData> => {
  const ai = getAI();
  
  const systemInstruction = `You are a world-class Marketing Strategist. 
  Brand Context:
  - Website: ${brand.url || 'Not provided'}
  - Brand Values: ${brand.description || 'Not provided'}
  
  Generate a Facebook ad campaign strategy for: ${prompt}. 
  Ensure the tone matches the brand's website and description.
  Return 3 distinct ad variants.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: systemInstruction,
    config: {
      tools: brand.url ? [{ googleSearch: {} }] : [],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING, description: "Max 40 chars high-impact headline" },
                bodyCopy: { type: Type.STRING, description: "Engaging primary text for a Facebook ad" },
                imagePrompt: { type: Type.STRING, description: "Visual description for AI image generation" },
                callToAction: { type: Type.STRING, description: "Short CTA like 'Shop Now'" }
              },
              required: ["headline", "bodyCopy", "imagePrompt", "callToAction"]
            }
          }
        },
        required: ["productName", "targetAudience", "variants"]
      }
    }
  });

  const data: CampaignData = JSON.parse(response.text || '{}');
  
  // Extract grounding links if available (Mandatory for Search Tool)
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    const urls: GroundingSource[] = [];
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        urls.push({
          title: chunk.web.title || 'Source',
          uri: chunk.web.uri
        });
      }
    });
    data.groundingUrls = Array.from(new Set(urls.map(u => u.uri))).map(uri => urls.find(u => u.uri === uri)!);
  }

  return data;
};

export const generateImage = async (
  prompt: string, 
  headline: string,
  productName: string,
  brand: BrandDNA,
  aspectRatio: ImageAspectRatio = ImageAspectRatio.SQUARE
): Promise<string> => {
  const ai = getAI();
  
  const textPrompt = `PRO PHOTO: A cinematic, high-end Facebook advertisement for "${productName}". 
  SUBJECT: ${prompt}. 
  IDENTITY: ${brand.description || ''}. 
  STYLE: Commercial photography, studio lighting, professional retouching. 
  TYPOGRAPHY: Bold text overlay saying "${headline}". 
  MANDATORY: High contrast, vibrant colors, premium marketing aesthetic. NO blurry backgrounds, sharp focus.`;

  const parts: any[] = [{ text: textPrompt }];
  
  if (brand.logoBase64) {
    parts.push({
      inlineData: {
        data: brand.logoBase64.split(',')[1],
        mimeType: getMimeType(brand.logoBase64)
      }
    });
    parts[0].text += " SUBTLE INTEGRATION: Incorporate the brand identity from the provided asset/logo into the scene composition.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated");
};

export const editImage = async (
  currentImageBase64: string,
  editInstruction: string,
  headline: string,
  productName: string,
  brand: BrandDNA
): Promise<string> => {
  const ai = getAI();
  
  const textPrompt = `AD REFINEMENT: Modify the existing campaign visual for "${productName}". 
  REQUEST: ${editInstruction}. 
  PRESERVE: The headline text "${headline}" and the professional composition. 
  OUTPUT: A high-quality revised marketing asset.`;

  const parts: any[] = [
    {
      inlineData: {
        data: currentImageBase64.split(',')[1],
        mimeType: 'image/png' // Usually edited images are returned as PNG/JPEG
      }
    },
    { text: textPrompt }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Image edit failed");
};

export const chatWithGemini = async (history: { role: 'user' | 'model', text: string }[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are the Banana Strategist. A creative director who provides concise, actionable marketing advice."
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};
