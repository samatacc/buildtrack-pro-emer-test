import { NextRequest } from 'next/server';
import { GET } from '../../../app/api/mock-image/route';
import * as imageRegistry from '../../../app/utils/mockData/imageRegistry';
import * as imageSaver from '../../../app/utils/mockData/imageSaver';

// Mock the NextRequest
const createMockRequest = (params: Record<string, string>) => {
  const url = new URL('http://localhost:3000/api/mock-image');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return {
    url: url.toString(),
    nextUrl: url,
  } as unknown as NextRequest;
};

// Mock dependencies
jest.mock('../../../app/utils/mockData/imageRegistry', () => ({
  findExistingImage: jest.fn(),
  registerImage: jest.fn(),
  initializeRegistry: jest.fn(),
}));

jest.mock('../../../app/utils/mockData/imageSaver', () => ({
  saveImageFromUrl: jest.fn(),
}));

describe('Mock Image API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch to OpenAI
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [{ url: 'https://openai-generated.example.com/image.png' }]
      }),
    });
    
    // Mock image saving
    (imageSaver.saveImageFromUrl as jest.Mock).mockResolvedValue({
      success: true,
      path: '/generated-images/project/test-image.png'
    });
  });

  it('generates a new image when forceNew is true', async () => {
    const req = createMockRequest({ 
      category: 'project', 
      variant: 'blueprint',
      forceNew: 'true'
    });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBe('/generated-images/project/test-image.png');
    expect(data.reused).toBe(false);
    
    // Should call OpenAI
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/images/generations',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer'),
          'OpenAI-Organization': expect.any(String),
          'OpenAI-Beta': expect.stringContaining('assistants'),
        }),
      })
    );
    
    // Should save the image
    expect(imageSaver.saveImageFromUrl).toHaveBeenCalled();
    
    // Should register the image
    expect(imageRegistry.registerImage).toHaveBeenCalled();
  });

  it('reuses existing images when available', async () => {
    // Mock finding an existing image
    (imageRegistry.findExistingImage as jest.Mock).mockReturnValue({
      path: '/generated-images/project/existing-image.png',
      category: 'project',
      variant: 'blueprint',
      prompt: 'Existing prompt',
      timestamp: Date.now(),
    });
    
    const req = createMockRequest({ 
      category: 'project', 
      variant: 'blueprint'
    });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBe('/generated-images/project/existing-image.png');
    expect(data.reused).toBe(true);
    
    // Should NOT call OpenAI
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Should NOT save the image
    expect(imageSaver.saveImageFromUrl).not.toHaveBeenCalled();
  });

  it('handles errors from OpenAI API', async () => {
    // Mock a failed OpenAI request
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: jest.fn().mockResolvedValue({
        error: { message: 'Rate limit exceeded' }
      }),
    });
    
    const req = createMockRequest({ 
      category: 'project', 
      variant: 'blueprint',
      forceNew: 'true'
    });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('handles image saving errors', async () => {
    // Mock successful OpenAI request but failed image saving
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [{ url: 'https://openai-generated.example.com/image.png' }]
      }),
    });
    
    // Mock image saving failure
    (imageSaver.saveImageFromUrl as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to save image',
    });
    
    const req = createMockRequest({ 
      category: 'project', 
      variant: 'blueprint',
      forceNew: 'true'
    });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to save image');
  });

  it('uses the correct prompt based on category and variant', async () => {
    const req = createMockRequest({ 
      category: 'material', 
      variant: 'tools',
      forceNew: 'true'
    });
    
    await GET(req);
    
    // Verify the correct prompt was used in the OpenAI request
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/images/generations',
      expect.objectContaining({
        body: expect.stringContaining('tools'),
      })
    );
  });
});
