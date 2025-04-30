// Using Jest for testing
import { 
  generateMilestones, 
  calculateProjectEndDate, 
  suggestMilestoneCount 
} from '../milestoneGenerationService';
import { ProjectType, MilestoneStatus } from '@/lib/types/project';

describe('Milestone Generation Service', () => {
  describe('generateMilestones', () => {
    it('should generate milestones based on project type and timeline', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const projectType = ProjectType.RESIDENTIAL;
      
      const milestones = generateMilestones(projectType, startDate, endDate);
      
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones[0]).toHaveProperty('name');
      expect(milestones[0]).toHaveProperty('targetDate');
      expect(milestones[0]).toHaveProperty('status', MilestoneStatus.NOT_STARTED);
      expect(milestones[0]).toHaveProperty('deliverables');
      expect(Array.isArray(milestones[0].deliverables)).toBe(true);
    });
    
    it('should set milestone dates proportionally between project start and end dates', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const projectType = ProjectType.COMMERCIAL;
      
      const milestones = generateMilestones(projectType, startDate, endDate);
      
      // Check that all milestone dates are between start and end dates
      milestones.forEach(milestone => {
        const milestoneDate = new Date(milestone.targetDate);
        expect(milestoneDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(milestoneDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
      
      // Check that milestones are ordered by date
      for (let i = 1; i < milestones.length; i++) {
        const prevDate = new Date(milestones[i-1].targetDate).getTime();
        const currDate = new Date(milestones[i].targetDate).getTime();
        expect(currDate).toBeGreaterThanOrEqual(prevDate);
      }
    });
    
    it('should fallback to OTHER template if project type is invalid', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const invalidType = 'INVALID' as ProjectType;
      
      const milestones = generateMilestones(invalidType, startDate, endDate);
      
      expect(milestones.length).toBeGreaterThan(0);
      // Should match the OTHER template milestone length
      const otherMilestones = generateMilestones(ProjectType.OTHER, startDate, endDate);
      expect(milestones.length).toBe(otherMilestones.length);
    });
  });
  
  describe('calculateProjectEndDate', () => {
    it('should calculate an end date based on project type and size', () => {
      const startDate = new Date('2025-01-01');
      const projectType = ProjectType.RESIDENTIAL;
      const size = 2000; // Double the base size
      
      const endDate = calculateProjectEndDate(projectType, startDate, size);
      
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
      
      // With size factor of sqrt(2) ≈ 1.414, and residential base of 180 days,
      // we expect around 254 days difference
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedDays = Math.round(180 * Math.sqrt(2));
      expect(diffDays).toBeCloseTo(expectedDays, 0); // Allow some rounding differences
    });
    
    it('should use default size if not provided', () => {
      const startDate = new Date('2025-01-01');
      const projectType = ProjectType.RESIDENTIAL;
      
      const endDate = calculateProjectEndDate(projectType, startDate);
      
      // With default size factor of 1.0 and residential base of 180 days
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(180);
    });
  });
  
  describe('suggestMilestoneCount', () => {
    it('should suggest appropriate milestone count based on project type and duration', () => {
      // Base residential project (6 months) should have 5 milestones
      expect(suggestMilestoneCount(ProjectType.RESIDENTIAL, 6)).toBe(5);
      
      // 12-month commercial project should have more milestones
      expect(suggestMilestoneCount(ProjectType.COMMERCIAL, 12)).toBeGreaterThan(5);
      
      // Longer projects should have more milestones
      const shortProjectCount = suggestMilestoneCount(ProjectType.INDUSTRIAL, 6);
      const longProjectCount = suggestMilestoneCount(ProjectType.INDUSTRIAL, 24);
      expect(longProjectCount).toBeGreaterThan(shortProjectCount);
      
      // Very long projects should cap at 12 milestones
      expect(suggestMilestoneCount(ProjectType.INFRASTRUCTURE, 48)).toBeLessThanOrEqual(12);
    });
  });
});
