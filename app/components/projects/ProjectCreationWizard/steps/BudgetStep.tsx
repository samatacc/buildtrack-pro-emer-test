'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, Info, Plus, Trash2 } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, Budget, BudgetCategory, BudgetItem } from '@/lib/types/project';

/**
 * BudgetStep Component
 * 
 * Allows users to set up the project budget, including total budget,
 * budget categories, and individual budget items.
 */

interface BudgetStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

// Default budget categories for new projects
const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: '1',
    name: 'Labor',
    description: 'Costs related to workforce and manual labor',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  },
  {
    id: '2',
    name: 'Materials',
    description: 'Building materials and supplies',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  },
  {
    id: '3',
    name: 'Equipment',
    description: 'Construction equipment costs',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  },
  {
    id: '4',
    name: 'Subcontractors',
    description: 'External contractors and specialists',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  },
  {
    id: '5',
    name: 'Permits & Fees',
    description: 'Legal permits and regulatory fees',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  },
  {
    id: '6',
    name: 'Contingency',
    description: 'Reserve for unexpected expenses',
    plannedAmount: 0,
    spentAmount: 0,
    items: []
  }
];

export default function BudgetStep({
  formData,
  updateFormData,
  updateStepValidation
}: BudgetStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // Initialize budget from form data or with defaults
  const initialBudget: Budget = formData.budget || {
    totalBudget: 0,
    spentBudget: 0,
    currency: 'USD',
    categories: DEFAULT_BUDGET_CATEGORIES,
    contingencyPercentage: 10
  };
  
  // Local state
  const [budget, setBudget] = useState<Budget>(initialBudget);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(budget.categories?.[0]?.id || null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    name: '',
    description: '',
    unitCost: 0,
    quantity: 1,
    plannedAmount: 0
  });
  
  // Calculate totals
  const calculateTotals = () => {
    const categories = budget.categories.map(category => {
      // Calculate category total from items
      const plannedAmount = category.items.reduce((total, item) => total + item.plannedAmount, 0);
      const spentAmount = category.items.reduce((total, item) => total + (item.spentAmount || 0), 0);
      
      return {
        ...category,
        plannedAmount,
        spentAmount
      };
    });
    
    // Calculate overall budget total
    const totalPlanned = categories.reduce((total, category) => total + category.plannedAmount, 0);
    const totalSpent = categories.reduce((total, category) => total + category.spentAmount, 0);
    
    // Apply contingency
    const contingencyAmount = (totalPlanned * budget.contingencyPercentage) / 100;
    const totalWithContingency = totalPlanned + contingencyAmount;
    
    setBudget(prev => ({
      ...prev,
      categories,
      totalBudget: totalWithContingency,
      spentBudget: totalSpent
    }));
  };
  
  // When items change, recalculate totals
  useEffect(() => {
    calculateTotals();
  }, [budget.categories, budget.contingencyPercentage]);
  
  // Update parent form data and validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    // Validate total budget
    if (budget.totalBudget <= 0) {
      newErrors.totalBudget = t('validation.budgetRequired');
    }
    
    setErrors(newErrors);
    
    // Update parent validation state
    const isValid = Object.keys(newErrors).length === 0;
    updateStepValidation(isValid);
    
    // Update parent form data if valid
    if (isValid) {
      updateFormData({ budget });
    }
  }, [budget, updateFormData, updateStepValidation, t]);
  
  // Handle basic input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contingencyPercentage') {
      setBudget(prev => ({
        ...prev,
        contingencyPercentage: parseFloat(value) || 0
      }));
    } else if (name === 'currency') {
      setBudget(prev => ({
        ...prev,
        currency: value
      }));
    }
  };
  
  // Handle new item input changes
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unitCost' || name === 'quantity') {
      const unitCost = name === 'unitCost' ? parseFloat(value) || 0 : newItem.unitCost;
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : newItem.quantity;
      
      setNewItem(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        plannedAmount: unitCost * quantity
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add a new budget item
  const addBudgetItem = () => {
    if (!activeCategoryId || !newItem.name) return;
    
    const item: BudgetItem = {
      id: `item-${Date.now()}`,
      name: newItem.name || '',
      description: newItem.description || '',
      unitCost: newItem.unitCost || 0,
      quantity: newItem.quantity || 1,
      plannedAmount: newItem.plannedAmount || 0,
      spentAmount: 0,
      dateCreated: new Date()
    };
    
    setBudget(prev => {
      const categories = prev.categories.map(category => {
        if (category.id === activeCategoryId) {
          return {
            ...category,
            items: [...category.items, item]
          };
        }
        return category;
      });
      
      return {
        ...prev,
        categories
      };
    });
    
    // Reset form
    setNewItem({
      name: '',
      description: '',
      unitCost: 0,
      quantity: 1,
      plannedAmount: 0
    });
    
    setShowAddItemForm(false);
  };
  
  // Remove a budget item
  const removeBudgetItem = (categoryId: string, itemId: string) => {
    setBudget(prev => {
      const categories = prev.categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.filter(item => item.id !== itemId)
          };
        }
        return category;
      });
      
      return {
        ...prev,
        categories
      };
    });
  };
  
  // Add a new category
  const addCategory = () => {
    const newCategory: BudgetCategory = {
      id: `category-${Date.now()}`,
      name: t('newCategory'),
      description: '',
      plannedAmount: 0,
      spentAmount: 0,
      items: []
    };
    
    setBudget(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
    
    // Set the new category as active
    setActiveCategoryId(newCategory.id);
  };
  
  // Update category name
  const updateCategoryName = (categoryId: string, name: string) => {
    setBudget(prev => ({
      ...prev,
      categories: prev.categories.map(category => 
        category.id === categoryId ? { ...category, name } : category
      )
    }));
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget.currency,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get active category
  const activeCategory = budget.categories.find(category => category.id === activeCategoryId);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.budget')}</h2>
        <p className="text-gray-600">{t('budgetDescription')}</p>
      </div>
      
      {/* Budget Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('budgetSummary')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currency Selection */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              {t('currency')}
            </label>
            <select
              id="currency"
              name="currency"
              value={budget.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="MXN">MXN - Mexican Peso</option>
            </select>
          </div>
          
          {/* Contingency Percentage */}
          <div>
            <label htmlFor="contingencyPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              {t('contingencyPercentage')}
            </label>
            <div className="relative">
              <input
                type="number"
                id="contingencyPercentage"
                name="contingencyPercentage"
                value={budget.contingencyPercentage}
                onChange={handleInputChange}
                min="0"
                max="50"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>
          
          {/* Total Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('totalBudget')}
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-lg font-semibold text-[rgb(24,62,105)]">
              {formatCurrency(budget.totalBudget)}
            </div>
          </div>
        </div>
        
        {/* Budget progress bars */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('budgetProgress')}
          </label>
          
          <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
            {/* Show spent percentage */}
            {budget.totalBudget > 0 && (
              <div 
                className={`h-full ${
                  budget.spentBudget / budget.totalBudget > 0.9 
                    ? 'bg-red-500' 
                    : budget.spentBudget / budget.totalBudget > 0.7 
                      ? 'bg-amber-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (budget.spentBudget / budget.totalBudget) * 100)}%` }}
              />
            )}
          </div>
          
          <div className="flex justify-between mt-1 text-sm">
            <span>{formatCurrency(budget.spentBudget)}</span>
            <span className="text-gray-600">
              {budget.totalBudget > 0 
                ? `${Math.round((budget.spentBudget / budget.totalBudget) * 100)}%` 
                : '0%'}
            </span>
            <span>{formatCurrency(budget.totalBudget)}</span>
          </div>
        </div>
      </div>
      
      {/* Budget Categories and Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {/* Category Tabs */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('categories')}</h3>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {budget.categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`w-full text-left p-3 ${
                    activeCategoryId === category.id
                      ? 'bg-blue-50 border-l-4 border-[rgb(24,62,105)]'
                      : 'border-l-4 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-medium text-gray-900 truncate">{category.name}</span>
                      <span className="block text-sm text-gray-500">{formatCurrency(category.plannedAmount)}</span>
                    </div>
                    {activeCategoryId === category.id && (
                      <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {category.items.length}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Add Category Button */}
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={addCategory}
                className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t('addCategory')}
              </button>
            </div>
          </div>
          
          {/* Category Content */}
          <div className="flex-1 p-4">
            {activeCategory ? (
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <input
                      type="text"
                      value={activeCategory.name}
                      onChange={(e) => updateCategoryName(activeCategory.id, e.target.value)}
                      className="text-xl font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-[rgb(24,62,105)] focus:outline-none pb-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">{activeCategory.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[rgb(24,62,105)]">
                      {formatCurrency(activeCategory.plannedAmount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(activeCategory.spentAmount)} {t('spent')}
                    </div>
                  </div>
                </div>
                
                {/* Budget Items List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('budgetItems')}</h4>
                  
                  {activeCategory.items.length === 0 ? (
                    <div className="py-8 text-center">
                      <DollarSign className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-gray-600">{t('noBudgetItems')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeCategory.items.map(item => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 rounded-md border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <button 
                                  onClick={() => removeBudgetItem(activeCategory.id, item.id)}
                                  className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatCurrency(item.plannedAmount)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {item.quantity} × {formatCurrency(item.unitCost)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Item Form */}
                  {showAddItemForm ? (
                    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="mb-3">
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('itemName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="itemName"
                          name="name"
                          value={newItem.name}
                          onChange={handleNewItemChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                          placeholder={t('itemNamePlaceholder')}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('itemDescription')}
                        </label>
                        <textarea
                          id="itemDescription"
                          name="description"
                          value={newItem.description}
                          onChange={handleNewItemChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                          placeholder={t('itemDescriptionPlaceholder')}
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('unitCost')} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="unitCost"
                              name="unitCost"
                              value={newItem.unitCost || ''}
                              onChange={handleNewItemChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('quantity')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={newItem.quantity || ''}
                            onChange={handleNewItemChange}
                            min="1"
                            step="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                            placeholder="1"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('totalCost')}
                        </label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium">
                          {formatCurrency(newItem.plannedAmount || 0)}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddItemForm(false);
                            setNewItem({
                              name: '',
                              description: '',
                              unitCost: 0,
                              quantity: 1,
                              plannedAmount: 0
                            });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={addBudgetItem}
                          disabled={!newItem.name || newItem.unitCost <= 0 || newItem.quantity <= 0}
                          className={`px-3 py-1.5 rounded-md ${
                            newItem.name && newItem.unitCost > 0 && newItem.quantity > 0
                              ? 'bg-[rgb(24,62,105)] text-white hover:bg-[rgb(19,50,86)]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {t('addItem')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddItemForm(true)}
                      className="mt-3 w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      {t('addBudgetItem')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">{t('selectCategory')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {errors.totalBudget && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{errors.totalBudget}</p>
        </div>
      )}
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('budgetTip')}</p>
        </div>
      </div>
    </div>
  );
}
