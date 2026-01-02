
export interface AdVariant {
  headline: string;
  bodyCopy: string;
  imagePrompt: string;
  callToAction: string;
}

export interface BrandDNA {
  url?: string;
  description?: string;
  logoBase64?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CampaignData {
  productName: string;
  targetAudience: string;
  variants: AdVariant[];
  groundingUrls?: GroundingSource[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}
