/**
 * Image Registry System
 * 
 * Manages the mapping between prompts and generated images
 * Provides persistence for selected/favorite images
 */
import fs from 'fs';
import path from 'path';
import { ImageCategory, ImageVariant } from './imagePrompts/types';

// Types for image registry
export interface ImageEntry {
  id: string;
  category: ImageCategory;
  variant?: ImageVariant;
  path: string;
  originalUrl?: string;
  prompt?: string;
  timestamp: number;
  favorite?: boolean;
}

export interface ImageRegistry {
  images: ImageEntry[];
  selectedImages: {
    [key: string]: string; // key = "category-variant", value = image id
  };
}

// File path for registry persistence
const REGISTRY_PATH = path.join(process.cwd(), 'data');
const REGISTRY_FILE = path.join(REGISTRY_PATH, 'image-registry.json');

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.mkdirSync(REGISTRY_PATH, { recursive: true });
  }
};

// Initialize or load the registry
export const getRegistry = (): ImageRegistry => {
  ensureDirectoryExists();
  
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading image registry:', error);
  }
  
  // Return empty registry if not found or error
  return {
    images: [],
    selectedImages: {}
  };
};

// Save the registry
export const saveRegistry = (registry: ImageRegistry): void => {
  ensureDirectoryExists();
  
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving image registry:', error);
  }
};

// Generate a key for category-variant combination
export const getImageKey = (category: ImageCategory, variant?: ImageVariant): string => {
  return variant ? `${category}-${variant}` : category;
};

// Add an image to the registry
export const registerImage = (
  category: ImageCategory,
  filePath: string,
  originalUrl?: string,
  variant?: ImageVariant,
  prompt?: string
): ImageEntry => {
  const registry = getRegistry();
  
  const id = path.basename(filePath).split('.')[0]; // Use filename without extension as ID
  const timestamp = Date.now();
  
  const entry: ImageEntry = {
    id,
    category,
    variant,
    path: filePath,
    originalUrl,
    prompt,
    timestamp,
    favorite: false
  };
  
  // Add to registry
  registry.images.push(entry);
  saveRegistry(registry);
  
  return entry;
};

// Get images by category and variant
export const getImagesByCategory = (
  category: ImageCategory,
  variant?: ImageVariant
): ImageEntry[] => {
  const registry = getRegistry();
  
  return registry.images.filter(img => 
    img.category === category && 
    (!variant || img.variant === variant)
  );
};

// Mark an image as favorite
export const markImageAsFavorite = (imageId: string, favorite: boolean = true): void => {
  const registry = getRegistry();
  
  const image = registry.images.find(img => img.id === imageId);
  if (image) {
    image.favorite = favorite;
    saveRegistry(registry);
  }
};

// Select an image for a specific category-variant combination
export const selectImageForUse = (
  category: ImageCategory,
  imageId: string,
  variant?: ImageVariant
): void => {
  const registry = getRegistry();
  const key = getImageKey(category, variant);
  
  registry.selectedImages[key] = imageId;
  saveRegistry(registry);
};

// Get the selected image for a category-variant combination
export const getSelectedImage = (
  category: ImageCategory,
  variant?: ImageVariant
): ImageEntry | undefined => {
  const registry = getRegistry();
  const key = getImageKey(category, variant);
  
  const selectedId = registry.selectedImages[key];
  if (!selectedId) return undefined;
  
  return registry.images.find(img => img.id === selectedId);
};

// Check if a category-variant has a selected image
export const hasSelectedImage = (
  category: ImageCategory,
  variant?: ImageVariant
): boolean => {
  return !!getSelectedImage(category, variant);
};
