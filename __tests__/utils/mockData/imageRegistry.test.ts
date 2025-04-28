import fs from 'fs';
import {
  getRegistry,
  saveRegistry,
  registerImage,
  getImagesByCategory,
  getSelectedImage,
  selectImageForUse,
  markImageAsFavorite
} from '../../../app/utils/mockData/imageRegistry';

jest.mock('fs');

describe('Image Registry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock empty registry initially
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ images: [], selectedImages: {} }));
  });

  it('initializes registry correctly', () => {
    expect(getRegistry().images).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
  });

  it('registers a new image correctly', () => {
    const category = 'project';
    const variant = 'blueprint';
    const filePath = '/generated-images/project/test-image.png';
    const originalUrl = 'https://example.com/image.png';
    const prompt = 'A construction blueprint';

    const result = registerImage(category, filePath, originalUrl, variant, prompt);
    
    expect(result.category).toBe(category);
    expect(result.variant).toBe(variant);
    expect(result.path).toBe(filePath);
    expect(result.originalUrl).toBe(originalUrl);
    expect(result.prompt).toBe(prompt);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('retrieves images by category and variant', () => {
    // Register multiple images
    registerImage('project', '/generated-images/project/bp1.png', undefined, 'blueprint', 'A construction blueprint');
    registerImage('project', '/generated-images/project/com1.png', undefined, 'commercial', 'A commercial building');
    registerImage('material', '/generated-images/material/tools1.png', undefined, 'tools', 'Construction tools');
    
    // Mock registry with these images for getImagesByCategory
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ 
      images: [
        { id: 'bp1', category: 'project', variant: 'blueprint', path: '/generated-images/project/bp1.png', timestamp: Date.now() },
        { id: 'com1', category: 'project', variant: 'commercial', path: '/generated-images/project/com1.png', timestamp: Date.now() },
        { id: 'tools1', category: 'material', variant: 'tools', path: '/generated-images/material/tools1.png', timestamp: Date.now() }
      ],
      selectedImages: {}
    }));
    
    // Test filtering by category only
    const projectImages = getImagesByCategory('project');
    expect(projectImages).toHaveLength(2);
    
    // Test filtering by category and variant
    const blueprintImages = getImagesByCategory('project', 'blueprint');
    expect(blueprintImages).toHaveLength(1);
    expect(blueprintImages[0].path).toBe('/generated-images/project/bp1.png');
  });

  it('selects an image for a category-variant combination', () => {
    // Register an image
    const filePath = '/generated-images/project/unique-path.png';
    const result = registerImage('project', filePath, undefined, 'blueprint', 'A construction blueprint');
    
    // Select this image for the project-blueprint category
    selectImageForUse('project', result.id, 'blueprint');
    
    // Mock the registry to return this image when checked
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      images: [{
        id: result.id,
        category: 'project',
        variant: 'blueprint',
        path: filePath,
        timestamp: Date.now()
      }],
      selectedImages: {
        'project-blueprint': result.id
      }
    }));
    
    // Should be able to retrieve the selected image
    const selectedImage = getSelectedImage('project', 'blueprint');
    expect(selectedImage).toBeDefined();
    expect(selectedImage?.id).toBe(result.id);
    
    // Should not find an image for a different category
    const notFoundImage = getSelectedImage('material', 'tools');
    expect(notFoundImage).toBeUndefined();
  });

  it('saves registry data to disk', () => {
    const mockRegistry = {
      images: [
        {
          id: 'financial1',
          category: 'report',
          variant: 'financial',
          prompt: 'Financial report',
          path: '/generated-images/report/financial.png',
          timestamp: Date.now()
        }
      ],
      selectedImages: {}
    };
    
    saveRegistry(mockRegistry);
    
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(mockRegistry, null, 2),
      'utf8'
    );
  });
});
