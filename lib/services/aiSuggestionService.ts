/**
 * AI Suggestion Service
 * 
 * Provides intelligent suggestions for various project attributes
 * based on natural language processing of user inputs.
 */

import { ProjectType } from '@/lib/types/project';

interface TypeSuggestion {
  type: ProjectType;
  confidence: number; // 0 to 1
  reason: string;
}

/**
 * Analyzes project name and description to suggest appropriate project types.
 * 
 * @param name Project name
 * @param description Project description
 * @returns Array of suggested project types with confidence scores
 */
export const suggestProjectType = (name: string, description: string): TypeSuggestion[] => {
  // Combine name and description for analysis, lowercase for consistency
  const text = `${name} ${description}`.toLowerCase();
  
  // Keywords that suggest different project types
  const typeKeywords: Record<ProjectType, string[]> = {
    [ProjectType.RESIDENTIAL]: [
      'house', 'home', 'apartment', 'condo', 'condominium', 'residential', 
      'housing', 'dwelling', 'townhouse', 'villa', 'cabin', 'cottage',
      'residence', 'living'
    ],
    [ProjectType.COMMERCIAL]: [
      'office', 'retail', 'store', 'shop', 'mall', 'commercial', 'business',
      'restaurant', 'hotel', 'corporate', 'workspace', 'headquarters'
    ],
    [ProjectType.INDUSTRIAL]: [
      'factory', 'plant', 'warehouse', 'industrial', 'manufacturing', 'production',
      'assembly', 'storage', 'distribution', 'processing', 'facility'
    ],
    [ProjectType.INFRASTRUCTURE]: [
      'road', 'bridge', 'highway', 'tunnel', 'railway', 'pipeline', 'utility',
      'infrastructure', 'public', 'transit', 'transportation', 'power', 'water',
      'dam', 'airport', 'station'
    ],
    [ProjectType.RENOVATION]: [
      'renovation', 'remodel', 'refurbish', 'update', 'restore', 'modernize',
      'upgrade', 'repair', 'retrofit', 'rehab', 'revitalize', 'conversion'
    ],
    [ProjectType.OTHER]: []  // No specific keywords, will be used as fallback
  };
  
  // Calculate scores for each project type based on keyword matches
  const suggestions: TypeSuggestion[] = [];
  
  // Special case: Check for renovation keywords first since they should take priority
  // when explicitly mentioned, regardless of building type (office, house, etc.)
  const renovationKeywords = typeKeywords[ProjectType.RENOVATION];
  let isRenovationProject = false;
  const renovationMatches: string[] = [];
  
  renovationKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      isRenovationProject = true;
      renovationMatches.push(keyword);
    }
  });
  
  // If renovation keywords are found prominently in the project name, prioritize RENOVATION type
  if (isRenovationProject && name.toLowerCase().includes('renovation')) {
    const confidence = Math.min(renovationMatches.length / 2 + 0.3, 1); // Higher base confidence
    suggestions.push({
      type: ProjectType.RENOVATION,
      confidence,
      reason: `Contains renovation keywords: ${renovationMatches.join(', ')}`
    });
  }
  
  // Process all project types
  Object.entries(typeKeywords).forEach(([projectType, keywords]) => {
    const type = projectType as ProjectType;
    
    // Skip OTHER type in initial scoring and skip RENOVATION if already added
    if (type === ProjectType.OTHER || (type === ProjectType.RENOVATION && isRenovationProject && name.toLowerCase().includes('renovation'))) {
      return;
    }
    
    let matchCount = 0;
    const matchedKeywords: string[] = [];
    
    // Count keyword matches
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    });
    
    // Only include types with matches
    if (matchCount > 0) {
      // Calculate confidence (normalize by number of keywords)
      const confidence = Math.min(matchCount / 3, 1); // Cap at 1.0
      
      // Generate reason for the suggestion
      const reason = matchedKeywords.length > 0 
        ? `Contains keywords: ${matchedKeywords.join(', ')}`
        : 'Matches typical patterns for this type';
      
      // If this is a renovation project but the keyword wasn't in the name,
      // still add the renovation type with lower confidence
      if (type === ProjectType.RENOVATION && isRenovationProject && !suggestions.some(s => s.type === ProjectType.RENOVATION)) {
        suggestions.push({
          type: ProjectType.RENOVATION,
          confidence: Math.min(renovationMatches.length / 3, 0.9), // Slightly lower confidence
          reason: `Contains renovation keywords: ${renovationMatches.join(', ')}`
        });
      }
      
      suggestions.push({ type, confidence, reason });
    }
  });
  
  // If no suggestions, add OTHER type with low confidence
  if (suggestions.length === 0) {
    suggestions.push({
      type: ProjectType.OTHER,
      confidence: 0.4,
      reason: 'Unable to determine specific project type from description'
    });
  }
  
  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Checks if project name and description are substantial enough
 * to provide meaningful AI suggestions.
 * 
 * @param name Project name
 * @param description Project description
 * @returns Boolean indicating if suggestion should be attempted
 */
export const shouldSuggestProjectType = (name: string, description: string): boolean => {
  // At least 3 words total between name and description
  const wordCount = `${name} ${description}`.split(/\s+/).filter(word => word.length > 0).length;
  return wordCount >= 3;
};
