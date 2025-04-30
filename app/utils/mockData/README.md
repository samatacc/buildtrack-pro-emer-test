# Mock Image Generation System

## Overview

This system utilizes OpenAI's GPT-Image-1 API to generate realistic mock images for BuildTrack Pro during development. These images are used as placeholders for projects, materials, reports, floorplans, and documents to enhance the development experience.

## Features

- **Development-Only**: Image generation is restricted to development environments (or when explicitly enabled)
- **Category-Based**: Generate images for specific construction categories with appropriate prompts
- **Caching**: Generated images are cached to reduce API calls and associated costs
- **Fallbacks**: Built-in fallback system when API calls fail or API key is missing
- **React Component**: Easy-to-use React component for displaying mock images

## Usage

### Basic Usage

```tsx
import { MockImage } from '@/app/components/ui/MockImage';

export function ProjectCard() {
  return (
    <div className="project-card">
      <MockImage 
        category="project" 
        variant="residential" 
        width={500} 
        height={300} 
        alt="Residential project" 
      />
      <h3>Residential Project</h3>
    </div>
  );
}
```

### Available Categories and Variants

#### Projects
- residential
- commercial
- interior
- completed
- progress

#### Materials
- lumber
- concrete
- steel
- electrical
- plumbing
- tools

#### Reports
- progress
- financial
- safety
- quality
- timeline

#### Floorplans
- residential
- commercial
- blueprint
- markup
- 3d

#### Documents
- contract
- permit
- invoice
- specification
- manual

### Direct API Usage

If you need more control, you can use the utility function directly:

```tsx
import { generateMockImage } from '@/app/utils/mockData/imageGeneration';

async function loadProjectImage() {
  const imageUrl = await generateMockImage({
    category: 'project',
    variant: 'commercial',
    size: '1024x1024'
  });
  
  // Use the image URL as needed
}
```

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```
# OpenAI API Key for GPT-Image-1
OPENAI_API_KEY=your_api_key_here

# Enable mock images in non-development environments (optional)
ENABLE_MOCK_IMAGES=true
```

## Best Practices

1. **Limit API Calls**: Use the MockImage component which implements caching
2. **Use Appropriate Categories**: Select the most relevant category and variant for your use case
3. **Consider Performance**: Pregenerate images for critical UI components with `pregenerateImages()`
4. **Handle Fallbacks**: Always provide fallback URLs for production environments

## Technical Details

- Images are generated server-side via a Next.js API route
- The OpenAI API key is never exposed to the client
- Generated images are cached for 24 hours to minimize API costs
- When the app is in production mode, only fallback images are used unless explicitly enabled
