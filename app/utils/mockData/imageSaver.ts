/**
 * Utility for saving generated images to the local filesystem
 * and registering them in the image registry
 */
import fs from 'fs';
import path from 'path';
import { ImageCategory, ImageVariant } from './imagePrompts/types';
import { registerImage, getImagesByCategory, getSelectedImage } from './imageRegistry';
import { getPromptForCategory } from './imagePrompts';

// Ensure all directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generate a filename for a saved image
 */
export const generateImageFilename = (
  category: ImageCategory,
  variant?: ImageVariant,
  timestamp = new Date().getTime()
): string => {
  const variantSuffix = variant ? `-${variant}` : '';
  return `${category}${variantSuffix}-${timestamp}.png`;
};

/**
 * Get the path for storing images
 */
export const getImageSavePath = (
  category: ImageCategory,
  variant?: ImageVariant
): string => {
  // Base directory for saved images
  const baseDir = path.join(process.cwd(), 'public', 'generated-images');
  
  // Category-specific directory
  const categoryDir = path.join(baseDir, category);
  
  // Ensure directories exist
  ensureDirectoryExists(baseDir);
  ensureDirectoryExists(categoryDir);
  
  return categoryDir;
};

/**
 * Find an existing image or get the selected image for a category/variant
 * Returns the public URL path if found, null otherwise
 */
export const findExistingImage = (
  category: ImageCategory,
  variant?: ImageVariant
): string | null => {
  // First check if there's a selected image for this category/variant
  const selectedImage = getSelectedImage(category, variant);
  if (selectedImage) {
    return selectedImage.path;
  }
  
  // Otherwise, look for any existing images
  const existingImages = getImagesByCategory(category, variant);
  if (existingImages.length > 0) {
    // Sort by timestamp, newest first
    existingImages.sort((a, b) => b.timestamp - a.timestamp);
    return existingImages[0].path;
  }
  
  return null;
};

/**
 * Download and save an image from a URL
 */
export const saveImageFromUrl = async (
  imageUrl: string,
  category: ImageCategory,
  variant?: ImageVariant,
  originalUrl?: string
): Promise<string> => {
  try {
    // Get the save directory path
    const savePath = getImageSavePath(category, variant);
    
    // Generate a unique filename
    const filename = generateImageFilename(category, variant);
    const filePath = path.join(savePath, filename);
    
    // Download the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    // Get the image data as an array buffer
    const imageData = await response.arrayBuffer();
    
    // Save the image to the filesystem
    fs.writeFileSync(filePath, Buffer.from(imageData));
    
    // Get the public URL path (relative to /public)
    const publicPath = `/generated-images/${category}/${filename}`;
    
    // Register the image in our registry
    const prompt = getPromptForCategory(category, variant);
    registerImage(category, publicPath, originalUrl, variant, prompt);
    
    return publicPath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};
