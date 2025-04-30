/**
 * Budget Recommendation Service Tests
 * 
 * Tests for the budget recommendation service functionality.
 */

import { 
  generateBudgetRecommendation,
  generateBudgetWithItems,
  adjustBudgetRecommendation,
  calculateBudgetMetrics,
  BudgetRecommendationOptions
} from '../budgetRecommendationService';
import { ProjectType } from '../../types/project';

describe('Budget Recommendation Service', () => {
  // Base options for testing
  const baseOptions: BudgetRecommendationOptions = {
    projectType: ProjectType.RESIDENTIAL,
    siteArea: 2500,
    areaUnit: 'sqft',
    projectDuration: 12,
    state: 'CA'
  };

  describe('generateBudgetRecommendation', () => {
    it('should generate a budget with correct structure', () => {
      const budget = generateBudgetRecommendation(baseOptions);
      
      // Check basic budget structure
      expect(budget).toHaveProperty('totalBudget');
      expect(budget).toHaveProperty('spentBudget');
      expect(budget).toHaveProperty('currency');
      expect(budget).toHaveProperty('contingencyPercentage');
      expect(budget).toHaveProperty('categories');
      
      // Check that we have categories
      expect(budget.categories.length).toBeGreaterThan(0);
      
      // Verify first category structure
      const firstCategory = budget.categories[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('description');
      expect(firstCategory).toHaveProperty('plannedAmount');
      expect(firstCategory).toHaveProperty('spentAmount');
      expect(firstCategory).toHaveProperty('items');
    });
    
    it('should generate different budgets for different project types', () => {
      const residentialBudget = generateBudgetRecommendation(baseOptions);
      const commercialBudget = generateBudgetRecommendation({
        ...baseOptions,
        projectType: ProjectType.COMMERCIAL
      });
      
      // Budgets should be different
      expect(residentialBudget.totalBudget).not.toEqual(commercialBudget.totalBudget);
      
      // Categories should be different
      const residentialCategories = residentialBudget.categories.map(c => c.name);
      const commercialCategories = commercialBudget.categories.map(c => c.name);
      expect(residentialCategories).not.toEqual(commercialCategories);
    });
    
    it('should adjust budget based on location factor', () => {
      const californiaBudget = generateBudgetRecommendation(baseOptions);
      const mississippiBudget = generateBudgetRecommendation({
        ...baseOptions,
        state: 'MS'
      });
      
      // California should be more expensive than Mississippi
      expect(californiaBudget.totalBudget).toBeGreaterThan(mississippiBudget.totalBudget);
    });
    
    it('should adjust budget based on timeline factor', () => {
      const standardBudget = generateBudgetRecommendation(baseOptions);
      const expeditedBudget = generateBudgetRecommendation({
        ...baseOptions,
        isExpedited: true
      });
      
      // Expedited should be more expensive
      expect(expeditedBudget.totalBudget).toBeGreaterThan(standardBudget.totalBudget);
    });
    
    it('should convert square meters to square feet when needed', () => {
      const sqftBudget = generateBudgetRecommendation(baseOptions);
      const sqmBudget = generateBudgetRecommendation({
        ...baseOptions,
        siteArea: 232, // ~2500 sqft
        areaUnit: 'sqm'
      });
      
      // Should be roughly the same budget (within 5% due to rounding)
      const ratio = sqftBudget.totalBudget / sqmBudget.totalBudget;
      expect(ratio).toBeGreaterThan(0.95);
      expect(ratio).toBeLessThan(1.05);
    });
  });

  describe('generateBudgetWithItems', () => {
    it('should generate a budget with items for each category', () => {
      const budget = generateBudgetWithItems(baseOptions);
      
      // Check that categories have items (except contingency)
      budget.categories.forEach(category => {
        if (category.name !== 'Contingency') {
          expect(category.items.length).toBeGreaterThan(0);
          
          // Check item structure
          const firstItem = category.items[0];
          expect(firstItem).toHaveProperty('id');
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('description');
          expect(firstItem).toHaveProperty('unitCost');
          expect(firstItem).toHaveProperty('quantity');
          expect(firstItem).toHaveProperty('plannedAmount');
          expect(firstItem).toHaveProperty('spentAmount');
          expect(firstItem).toHaveProperty('dateCreated');
        }
      });
      
      // Verify that item amounts sum up to category planned amount
      budget.categories.forEach(category => {
        if (category.items.length > 0) {
          const itemsSum = category.items.reduce((sum, item) => sum + item.plannedAmount, 0);
          expect(itemsSum).toEqual(category.plannedAmount);
        }
      });
    });
  });

  describe('adjustBudgetRecommendation', () => {
    it('should adjust total budget correctly', () => {
      const baseBudget = generateBudgetRecommendation(baseOptions);
      const increasedBudget = adjustBudgetRecommendation(baseBudget, {
        totalBudgetAdjustment: 20 // 20% increase
      });
      
      // Should be 20% higher
      expect(increasedBudget.totalBudget).toBeGreaterThan(baseBudget.totalBudget);
      const expectedIncrease = baseBudget.totalBudget * 1.2;
      expect(increasedBudget.totalBudget).toBeCloseTo(expectedIncrease, -3); // Allow some rounding difference
    });
    
    it('should adjust specific categories correctly', () => {
      const baseBudget = generateBudgetRecommendation(baseOptions);
      const category = baseBudget.categories[0].name;
      const originalAmount = baseBudget.categories[0].plannedAmount;
      
      const adjustedBudget = adjustBudgetRecommendation(baseBudget, {
        categoryAdjustments: {
          [category]: 50 // 50% increase for this category
        }
      });
      
      // Find the same category in adjusted budget
      const adjustedCategory = adjustedBudget.categories.find(c => c.name === category);
      expect(adjustedCategory).toBeDefined();
      expect(adjustedCategory?.plannedAmount).toBeGreaterThan(originalAmount);
      expect(adjustedCategory?.plannedAmount).toBeCloseTo(originalAmount * 1.5, -1); // Allow rounding
    });
  });

  describe('calculateBudgetMetrics', () => {
    it('should calculate metrics correctly', () => {
      const budget = generateBudgetRecommendation(baseOptions);
      
      // Set some spent amounts for testing
      budget.categories[0].spentAmount = budget.categories[0].plannedAmount / 2;
      budget.categories[1].spentAmount = budget.categories[1].plannedAmount / 4;
      
      const metrics = calculateBudgetMetrics(budget);
      
      // Verify metrics structure
      expect(metrics).toHaveProperty('totalPlanned');
      expect(metrics).toHaveProperty('totalSpent');
      expect(metrics).toHaveProperty('percentageSpent');
      expect(metrics).toHaveProperty('categoryCompletions');
      expect(metrics).toHaveProperty('remaining');
      
      // Verify math is correct
      const expectedSpent = budget.categories[0].spentAmount + budget.categories[1].spentAmount;
      expect(metrics.totalSpent).toEqual(expectedSpent);
      
      const expectedPlanned = budget.categories.reduce((sum, c) => sum + c.plannedAmount, 0);
      expect(metrics.totalPlanned).toEqual(expectedPlanned);
      
      expect(metrics.remaining).toEqual(metrics.totalPlanned - metrics.totalSpent);
    });
  });
});
