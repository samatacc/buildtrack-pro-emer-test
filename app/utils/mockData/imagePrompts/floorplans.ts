/**
 * Floorplan-related image prompts for GPT-Image-1
 */
import { PromptMap } from './types';

export const floorplanPrompts: PromptMap = {
  residential: 'A detailed residential floor plan showing room layouts, dimensions, and architectural elements. Include furniture placement, door swings, and room labels. The style should be clean and professional with a white background and the BuildTrack Pro blue for lines and annotations. Include elements like bathrooms, kitchens, bedrooms, and living spaces with appropriate symbols.',
  
  commercial: 'A detailed commercial floor plan showing office spaces, meeting rooms, common areas, and utilities. Include furniture layouts, doorways, and room labels. The style should be clean and professional with a white background and the BuildTrack Pro blue for lines and annotations. Include elements like reception areas, workstations, conference rooms, and service areas with appropriate symbols.',
  
  blueprint: 'A technical blueprint-style floor plan with detailed measurements, structural elements, and building systems. Use the classic blueprint blue background with white lines. Include architectural symbols, dimension lines, and technical annotations. The plan should show structural elements, electrical systems, plumbing, and HVAC components with industry-standard symbols.',
  
  markup: 'A floor plan with construction markup annotations showing areas for modification, demolition, and new construction. Use color coding to indicate different types of work (red for demolition, green for new construction, blue for modifications). Include revision clouds, construction notes, and reference symbols. The base plan should be faded with the markup elements highlighted for clarity.',
  
  '3d': 'A 3D rendered floor plan showing spatial relationships and volumetric elements. The rendering should show walls with height, ceiling elements, and key fixtures. Use subtle shadows and lighting to enhance the 3D effect. Include furniture elements and architectural features rendered in a clean, modern style with the BuildTrack Pro color palette. The view should be an angled birds-eye perspective showing the entire layout.'
}
