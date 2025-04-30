/**
 * Budget Recommendation Service
 * 
 * Provides functionality to generate budget recommendations based on project type, size, and timeline.
 * Following BuildTrack Pro design principles and technical standards.
 */

import { ProjectType, Budget, BudgetCategory } from '../types/project';

/**
 * Cost factor multipliers for different project types
 */
const PROJECT_TYPE_FACTORS = {
  [ProjectType.RESIDENTIAL]: 1.0,
  [ProjectType.COMMERCIAL]: 1.8,
  [ProjectType.INDUSTRIAL]: 2.5, 
  [ProjectType.INFRASTRUCTURE]: 3.2,
  [ProjectType.RENOVATION]: 0.7,
  [ProjectType.OTHER]: 1.2
};

/**
 * Base cost per square foot for different project types (in USD)
 */
const BASE_COST_PER_SQFT = {
  [ProjectType.RESIDENTIAL]: 150,
  [ProjectType.COMMERCIAL]: 250,
  [ProjectType.INDUSTRIAL]: 180,
  [ProjectType.INFRASTRUCTURE]: 350,
  [ProjectType.RENOVATION]: 120,
  [ProjectType.OTHER]: 200
};

/**
 * Base rates for standard budget categories as percentages of total budget
 */
const CATEGORY_PERCENTAGES = {
  [ProjectType.RESIDENTIAL]: {
    'Site Work': 5,
    'Foundation': 8,
    'Framing': 15,
    'Exterior Finishes': 10,
    'Roofing': 7,
    'Plumbing': 5,
    'Electrical': 6,
    'HVAC': 6,
    'Interior Finishes': 18,
    'Appliances & Fixtures': 7,
    'Permits & Fees': 3,
    'Labor': 10
  },
  [ProjectType.COMMERCIAL]: {
    'Site Preparation': 6,
    'Foundation & Structure': 20,
    'Building Envelope': 12,
    'MEP Systems': 18,
    'Interior Construction': 14,
    'Finishes': 10,
    'Fire Protection': 4,
    'Safety Systems': 3,
    'Permits & Fees': 5,
    'Professional Services': 8
  },
  [ProjectType.INDUSTRIAL]: {
    'Site Development': 8,
    'Foundation & Structure': 25,
    'Building Envelope': 10,
    'Specialized Systems': 20,
    'Electrical & Controls': 15,
    'Mechanical Systems': 12,
    'Safety & Compliance': 5,
    'Permits & Approvals': 5
  },
  [ProjectType.INFRASTRUCTURE]: {
    'Site Assessment': 4,
    'Design & Engineering': 10,
    'Permits & Approvals': 8,
    'Site Preparation': 12,
    'Materials': 25,
    'Construction': 30,
    'Safety & Security': 6,
    'Testing & Commissioning': 5
  },
  [ProjectType.RENOVATION]: {
    'Demolition': 12,
    'Structural Modifications': 15,
    'Electrical Updates': 10,
    'Plumbing Updates': 10,
    'HVAC Modifications': 8,
    'Interior Finishes': 25,
    'Fixtures & Appliances': 10,
    'Permits & Fees': 5,
    'Contingency': 5
  },
  [ProjectType.OTHER]: {
    'Design & Planning': 10,
    'Materials': 30,
    'Labor': 35,
    'Equipment': 10,
    'Permits & Fees': 5,
    'Contingency': 10
  }
};

/**
 * Location factor multipliers to adjust for regional cost differences
 */
const LOCATION_FACTORS: Record<string, number> = {
  // US States
  'AL': 0.85, 'AK': 1.25, 'AZ': 0.95, 'AR': 0.80, 'CA': 1.35, 'CO': 1.10,
  'CT': 1.15, 'DE': 1.05, 'FL': 1.00, 'GA': 0.95, 'HI': 1.40, 'ID': 0.90,
  'IL': 1.10, 'IN': 0.90, 'IA': 0.85, 'KS': 0.85, 'KY': 0.85, 'LA': 0.90,
  'ME': 0.95, 'MD': 1.10, 'MA': 1.20, 'MI': 1.00, 'MN': 1.05, 'MS': 0.80,
  'MO': 0.90, 'MT': 0.95, 'NE': 0.85, 'NV': 1.05, 'NH': 1.05, 'NJ': 1.15,
  'NM': 0.90, 'NY': 1.30, 'NC': 0.90, 'ND': 0.95, 'OH': 0.95, 'OK': 0.85,
  'OR': 1.10, 'PA': 1.05, 'RI': 1.10, 'SC': 0.85, 'SD': 0.85, 'TN': 0.90,
  'TX': 0.95, 'UT': 0.95, 'VT': 1.00, 'VA': 1.00, 'WA': 1.15, 'WV': 0.85,
  'WI': 1.00, 'WY': 0.90, 'DC': 1.25,
  
  // Canadian Provinces
  'ON': 1.15, 'QC': 1.10, 'NS': 1.05, 'NB': 1.00, 'MB': 1.00,
  'BC': 1.20, 'PE': 1.00, 'SK': 1.00, 'AB': 1.15, 'NL': 1.10,
  
  // Default
  'DEFAULT': 1.00
};

/**
 * Timeline adjustment factors
 * Accelerated timelines increase costs, extended timelines may reduce costs
 */
const TIMELINE_FACTOR = {
  ACCELERATED: 1.25, // Fast-tracked project (higher cost)
  NORMAL: 1.0,       // Standard timeline
  EXTENDED: 0.95     // Extended timeline (slight discount)
};

/**
 * Interface for budget recommendation options
 */
export interface BudgetRecommendationOptions {
  projectType: ProjectType;
  siteArea: number;          // In square feet/meters
  areaUnit: string;          // 'sqft' or 'sqm'
  projectDuration: number;   // In months
  state?: string;            // US state or Canadian province code
  isExpedited?: boolean;     // Whether the project is on an accelerated timeline
  complexityFactor?: number; // 0.8 (simple) to 1.5 (complex)
  contingencyPercentage?: number; // Default contingency percentage
}

/**
 * Convert square meters to square feet
 */
const sqmToSqft = (sqm: number): number => sqm * 10.764;

/**
 * Calculate a timeline factor based on project duration and whether it's expedited
 */
const calculateTimelineFactor = (durationMonths: number, isExpedited: boolean): number => {
  if (isExpedited) {
    return TIMELINE_FACTOR.ACCELERATED;
  }
  
  // Projects longer than 24 months are considered extended
  if (durationMonths > 24) {
    return TIMELINE_FACTOR.EXTENDED;
  }
  
  return TIMELINE_FACTOR.NORMAL;
};

/**
 * Determine location factor based on state/province code
 */
const getLocationFactor = (stateCode?: string): number => {
  if (!stateCode) return LOCATION_FACTORS.DEFAULT;
  return LOCATION_FACTORS[stateCode.toUpperCase()] || LOCATION_FACTORS.DEFAULT;
};

/**
 * Generate budget recommendation based on project details
 */
export const generateBudgetRecommendation = (options: BudgetRecommendationOptions): Budget => {
  const { 
    projectType, 
    siteArea, 
    areaUnit, 
    projectDuration,
    state,
    isExpedited = false,
    complexityFactor = 1.0,
    contingencyPercentage = 10
  } = options;
  
  // Convert area to square feet if needed
  const areaInSqft = areaUnit === 'sqm' ? sqmToSqft(siteArea) : siteArea;
  
  // Get base cost per square foot for the project type
  const baseCostPerSqft = BASE_COST_PER_SQFT[projectType] || BASE_COST_PER_SQFT[ProjectType.OTHER];
  
  // Calculate factors
  const typeFactor = PROJECT_TYPE_FACTORS[projectType] || PROJECT_TYPE_FACTORS[ProjectType.OTHER];
  const locationFactor = getLocationFactor(state);
  const timelineFactor = calculateTimelineFactor(projectDuration, isExpedited);
  
  // Calculate total budget
  let totalBudget = areaInSqft * baseCostPerSqft * typeFactor * locationFactor * timelineFactor * complexityFactor;
  
  // Round to nearest thousand
  totalBudget = Math.round(totalBudget / 1000) * 1000;
  
  // Get category percentages for this project type
  const categoryPercentages = CATEGORY_PERCENTAGES[projectType] || CATEGORY_PERCENTAGES[ProjectType.OTHER];
  
  // Generate budget categories
  const categories: BudgetCategory[] = Object.entries(categoryPercentages).map(([name, percentage], index) => {
    const plannedAmount = Math.round((totalBudget * percentage) / 100);
    return {
      id: `category-${index + 1}`,
      name,
      description: `Budget allocation for ${name}`,
      plannedAmount,
      spentAmount: 0,
      items: []
    };
  });
  
  // Add contingency category
  categories.push({
    id: `category-contingency`,
    name: 'Contingency',
    description: 'Reserve for unexpected expenses',
    plannedAmount: Math.round((totalBudget * contingencyPercentage) / 100),
    spentAmount: 0,
    items: []
  });
  
  // Calculate final total with contingency
  const finalTotal = totalBudget + Math.round((totalBudget * contingencyPercentage) / 100);
  
  return {
    totalBudget: finalTotal,
    spentBudget: 0,
    currency: 'USD',
    contingencyPercentage,
    categories
  };
};

/**
 * Generate budget categories with placeholder items
 */
export const generateBudgetWithItems = (options: BudgetRecommendationOptions): Budget => {
  const budget = generateBudgetRecommendation(options);
  
  // Generate sample budget items for each category
  budget.categories = budget.categories.map(category => {
    // Skip generating items for contingency
    if (category.name === 'Contingency') {
      return category;
    }
    
    // Generate 2-4 sample items per category
    const itemCount = Math.floor(Math.random() * 3) + 2;
    const plannedAmountPerItem = Math.floor(category.plannedAmount / itemCount);
    
    const items = Array.from({ length: itemCount }, (_, i) => {
      // Vary the amount slightly for each item
      const varianceFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
      const itemAmount = Math.round(plannedAmountPerItem * varianceFactor);
      
      return {
        id: `item-${category.id}-${i + 1}`,
        name: `${category.name} Item ${i + 1}`,
        description: `Sample budget item for ${category.name}`,
        unitCost: itemAmount,
        quantity: 1,
        plannedAmount: itemAmount,
        spentAmount: 0,
        dateCreated: new Date()
      };
    });
    
    // Adjust the last item to make the sum match the category total
    const currentSum = items.reduce((sum, item) => sum + item.plannedAmount, 0);
    const difference = category.plannedAmount - currentSum;
    
    if (items.length > 0) {
      items[items.length - 1].plannedAmount += difference;
      items[items.length - 1].unitCost = items[items.length - 1].plannedAmount;
    }
    
    return {
      ...category,
      items
    };
  });
  
  return budget;
};

/**
 * Adjust budget recommendation based on specific project requirements
 */
export const adjustBudgetRecommendation = (
  baseBudget: Budget, 
  adjustmentFactors: {
    categoryAdjustments?: Record<string, number>; // Category name -> adjustment percentage
    totalBudgetAdjustment?: number; // Overall adjustment percentage
  }
): Budget => {
  const { categoryAdjustments = {}, totalBudgetAdjustment = 0 } = adjustmentFactors;
  
  // Clone the budget to avoid modifying the original
  const adjustedBudget: Budget = JSON.parse(JSON.stringify(baseBudget));
  
  // Apply total budget adjustment if specified
  if (totalBudgetAdjustment !== 0) {
    const adjustmentFactor = 1 + (totalBudgetAdjustment / 100);
    adjustedBudget.totalBudget = Math.round(adjustedBudget.totalBudget * adjustmentFactor);
    
    // Adjust all categories proportionally
    adjustedBudget.categories = adjustedBudget.categories.map(category => ({
      ...category,
      plannedAmount: Math.round(category.plannedAmount * adjustmentFactor),
      items: category.items.map(item => ({
        ...item,
        plannedAmount: Math.round(item.plannedAmount * adjustmentFactor),
        unitCost: Math.round(item.unitCost * adjustmentFactor)
      }))
    }));
  }
  
  // Apply specific category adjustments
  Object.entries(categoryAdjustments).forEach(([categoryName, adjustmentPercentage]) => {
    const categoryIndex = adjustedBudget.categories.findIndex(c => c.name === categoryName);
    
    if (categoryIndex >= 0) {
      const category = adjustedBudget.categories[categoryIndex];
      const adjustmentFactor = 1 + (adjustmentPercentage / 100);
      
      // Calculate the change in planned amount
      const oldPlannedAmount = category.plannedAmount;
      const newPlannedAmount = Math.round(oldPlannedAmount * adjustmentFactor);
      const difference = newPlannedAmount - oldPlannedAmount;
      
      // Update the category
      adjustedBudget.categories[categoryIndex] = {
        ...category,
        plannedAmount: newPlannedAmount,
        items: category.items.map(item => {
          const itemAdjustmentFactor = newPlannedAmount / oldPlannedAmount;
          return {
            ...item,
            plannedAmount: Math.round(item.plannedAmount * itemAdjustmentFactor),
            unitCost: Math.round(item.unitCost * itemAdjustmentFactor)
          };
        })
      };
      
      // Update the total budget
      adjustedBudget.totalBudget += difference;
    }
  });
  
  return adjustedBudget;
};

/**
 * Calculate budget metrics
 */
export const calculateBudgetMetrics = (budget: Budget) => {
  // Total planned amount across all categories
  const totalPlanned = budget.categories.reduce((sum, category) => sum + category.plannedAmount, 0);
  
  // Total spent amount across all categories
  const totalSpent = budget.categories.reduce((sum, category) => sum + category.spentAmount, 0);
  
  // Percentage spent of the total budget
  const percentageSpent = totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100) : 0;
  
  // Completion percentage by category
  const categoryCompletions = budget.categories.map(category => ({
    name: category.name,
    planned: category.plannedAmount,
    spent: category.spentAmount,
    percentage: category.plannedAmount > 0 
      ? Math.round((category.spentAmount / category.plannedAmount) * 100) 
      : 0
  }));
  
  return {
    totalPlanned,
    totalSpent,
    percentageSpent,
    categoryCompletions,
    remaining: totalPlanned - totalSpent
  };
};
