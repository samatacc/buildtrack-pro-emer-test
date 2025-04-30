/**
 * Index file for GPT-Image-1 image prompts
 * Exports all prompt categories and helper functions
 */
import { projectPrompts } from './projects';
import { materialPrompts } from './materials';
import { reportPrompts } from './reports';
import { floorplanPrompts } from './floorplans';
import { documentPrompts } from './documents';
import { CategoryPromptMap, ImageCategory, ImageVariant } from './types';

// Combine all prompt categories into a single map
export const promptMap: CategoryPromptMap = {
  project: projectPrompts,
  material: materialPrompts,
  report: reportPrompts,
  floorplan: floorplanPrompts,
  document: documentPrompts,
};

/**
 * Get prompt for a specific category and variant
 * Falls back to first variant if the requested variant is not found
 */
export function getPromptForCategory(
  category: ImageCategory,
  variant?: ImageVariant
): string {
  const categoryPrompts = promptMap[category];
  
  if (!categoryPrompts) {
    throw new Error(`Invalid category: ${category}`);
  }

  // If variant is specified and exists in the category, use it
  if (variant && variant in categoryPrompts) {
    return categoryPrompts[variant as keyof typeof categoryPrompts];
  }
  
  // Otherwise, use the first variant in the category
  const firstVariant = Object.keys(categoryPrompts)[0] as keyof typeof categoryPrompts;
  return categoryPrompts[firstVariant];
}

// Export all prompt categories and types
export * from './types';
export * from './projects';
export * from './materials';
export * from './reports';
export * from './floorplans';
export * from './documents';
