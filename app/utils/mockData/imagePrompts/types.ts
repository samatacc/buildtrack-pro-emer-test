/**
 * Types for GPT-Image-1 mock image generation
 */

export type ImageCategory = 'project' | 'material' | 'report' | 'floorplan' | 'document';

export type ProjectVariant = 'residential' | 'commercial' | 'interior' | 'completed' | 'progress';
export type MaterialVariant = 'lumber' | 'concrete' | 'steel' | 'electrical' | 'plumbing' | 'tools';
export type ReportVariant = 'progress' | 'financial' | 'safety' | 'quality' | 'timeline';
export type FloorplanVariant = 'residential' | 'commercial' | 'blueprint' | 'markup' | '3d';
export type DocumentVariant = 'contract' | 'permit' | 'invoice' | 'specification' | 'manual';

export type ImageVariant = 
  | ProjectVariant 
  | MaterialVariant 
  | ReportVariant 
  | FloorplanVariant
  | DocumentVariant;

export type PromptMap = {
  [key in ImageVariant]: string;
};

export type CategoryPromptMap = {
  [key in ImageCategory]: PromptMap;
};

export interface GenerateMockImageOptions {
  category: ImageCategory;
  variant?: ImageVariant;
  size?: string;
  fallbackUrl?: string;
  forceNew?: boolean;
}

export interface ImageGenerationResponse {
  url: string;
  success: boolean;
  error?: string;
  originalUrl?: string; // Original OpenAI URL when image is saved locally
  warning?: string; // Warning message when image couldn't be saved
}
