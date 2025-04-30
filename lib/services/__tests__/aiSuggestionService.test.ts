// Using Jest for testing
import { suggestProjectType, shouldSuggestProjectType } from '../aiSuggestionService';
import { ProjectType } from '@/lib/types/project';

describe('AI Suggestion Service', () => {
  describe('shouldSuggestProjectType', () => {
    it('should return false for short inputs', () => {
      expect(shouldSuggestProjectType('', '')).toBe(false);
      expect(shouldSuggestProjectType('House', '')).toBe(false);
      expect(shouldSuggestProjectType('', 'Small')).toBe(false);
      expect(shouldSuggestProjectType('House', 'on')).toBe(false);
    });

    it('should return true for substantial inputs', () => {
      expect(shouldSuggestProjectType('New House Build', 'Construction of a house')).toBe(true);
      expect(shouldSuggestProjectType('Office Complex', 'Large office development')).toBe(true);
    });
  });

  describe('suggestProjectType', () => {
    it('should suggest RESIDENTIAL for housing-related terms', () => {
      const result = suggestProjectType('New House Construction', 'Building a 3-bedroom family home in suburban area');
      expect(result[0].type).toBe(ProjectType.RESIDENTIAL);
      expect(result[0].confidence).toBeGreaterThan(0.6);
    });

    it('should suggest COMMERCIAL for business-related terms', () => {
      const result = suggestProjectType('Downtown Office Building', 'New corporate headquarters with retail space');
      expect(result[0].type).toBe(ProjectType.COMMERCIAL);
      expect(result[0].confidence).toBeGreaterThan(0.6);
    });

    it('should suggest INDUSTRIAL for manufacturing-related terms', () => {
      const result = suggestProjectType('Chemical Plant Expansion', 'Expanding the existing factory with new production lines');
      expect(result[0].type).toBe(ProjectType.INDUSTRIAL);
      expect(result[0].confidence).toBeGreaterThan(0.6);
    });

    it('should suggest INFRASTRUCTURE for public works', () => {
      const result = suggestProjectType('Highway Bridge Construction', 'New bridge over the river connecting north and south regions');
      expect(result[0].type).toBe(ProjectType.INFRASTRUCTURE);
      expect(result[0].confidence).toBeGreaterThan(0.6);
    });

    it('should suggest RENOVATION for updating existing structures', () => {
      const result = suggestProjectType('Office Renovation', 'Modernizing the existing office space with new layout');
      expect(result[0].type).toBe(ProjectType.RENOVATION);
      expect(result[0].confidence).toBeGreaterThan(0.6);
    });

    it('should return multiple suggestions when applicable', () => {
      const result = suggestProjectType('Office Renovation and Expansion', 'Modernizing and expanding the office building');
      expect(result.length).toBeGreaterThan(1);
      expect(result.some(s => s.type === ProjectType.RENOVATION)).toBe(true);
      expect(result.some(s => s.type === ProjectType.COMMERCIAL)).toBe(true);
    });

    it('should return OTHER when no clear pattern is found', () => {
      const result = suggestProjectType('XYZ Project', 'Special development with unique requirements');
      expect(result[0].type).toBe(ProjectType.OTHER);
    });
  });
});
