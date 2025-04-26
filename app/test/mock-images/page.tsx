'use client';

import React, { useState } from 'react';
import { MockImage } from '../../components/ui/MockImage';
import { ImageCategory, ImageVariant } from '../../utils/mockData/imagePrompts/types';
import { promptMap } from '../../utils/mockData/imagePrompts';

/**
 * Test page for GPT-Image-1 mock image generation
 * This page allows testing different categories and variants
 */
export default function MockImagesTestPage() {
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('project');
  const [selectedVariant, setSelectedVariant] = useState<ImageVariant | undefined>(undefined);
  const [imageSize, setImageSize] = useState<string>('1024x1024');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [regenerateKey, setRegenerateKey] = useState<number>(0);

  // Get available variants for the selected category
  const availableVariants = Object.keys(promptMap[selectedCategory] || {}) as ImageVariant[];

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as ImageCategory;
    setSelectedCategory(newCategory);
    setSelectedVariant(undefined); // Reset variant when category changes
  };

  // Handle variant change
  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVariant = e.target.value;
    // Only set as ImageVariant if it's not 'none'
    setSelectedVariant(newVariant === 'none' ? undefined : newVariant as ImageVariant);
  };

  // Handle regenerate click
  const handleRegenerate = () => {
    setIsLoading(true);
    // Change the key to force the MockImage component to rerender
    setRegenerateKey(prev => prev + 1);
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[rgb(24,62,105)]">
            GPT-Image-1 Mock Image Test
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Test the mock image generation system with different categories and variants
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                {Object.keys(promptMap).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Selection */}
            <div>
              <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-2">
                Variant
              </label>
              <select
                id="variant"
                value={selectedVariant || 'none'}
                onChange={handleVariantChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                <option value="none">Default</option>
                {availableVariants.map((variant) => (
                  <option key={variant} value={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Selection */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                id="size"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
              >
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1024x1792">Portrait (1024x1792)</option>
                <option value="1792x1024">Landscape (1792x1024)</option>
              </select>
            </div>

            {/* Regenerate Button */}
            <div className="flex items-end">
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="w-full bg-[rgb(236,107,44)] hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate Image'}
              </button>
            </div>
          </div>
        </div>

        {/* Image Display */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[rgb(24,62,105)]">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                {selectedVariant && ` - ${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)}`}
              </h2>
            </div>
            <div className="relative flex justify-center p-6 bg-gray-50">
              <MockImage
                key={regenerateKey}
                category={selectedCategory}
                variant={selectedVariant}
                size={imageSize}
                width={imageSize === '1024x1024' ? 512 : imageSize === '1024x1792' ? 400 : 700}
                height={imageSize === '1024x1024' ? 512 : imageSize === '1024x1792' ? 700 : 400}
                alt={`${selectedCategory} ${selectedVariant || ''} mock image`}
                className="rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[rgb(24,62,105)] mb-4">Current Prompt</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">
              {promptMap[selectedCategory]?.[selectedVariant as keyof typeof promptMap[typeof selectedCategory]] || 
               promptMap[selectedCategory]?.[Object.keys(promptMap[selectedCategory])[0] as keyof typeof promptMap[typeof selectedCategory]]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
