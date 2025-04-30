'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { 
  generateBudgetRecommendation, 
  generateBudgetWithItems,
  BudgetRecommendationOptions
} from '../../../../../lib/services/budgetRecommendationService';
import { ProjectType, Budget, BudgetCategory } from '../../../../../lib/types/project';
import { 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Edit3,
  Zap,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Info
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../components/ui/tooltip';

// US States for location factor
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' }
];

// Canadian Provinces for location factor
const CANADIAN_PROVINCES = [
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'AB', label: 'Alberta' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
];

interface BudgetStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

// Interface for budget form inputs
interface BudgetFormInputs {
  siteArea: number;
  areaUnit: 'sqft' | 'sqm';
  projectDuration: number;
  location: string;
  isExpedited: boolean;
  complexityFactor: number;
  contingencyPercentage: number;
}

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetStep({ formData, updateFormData, onNext, onBack }: BudgetStepProps) {
  const t = useTranslations('projects');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [showDetails, setShowDetails] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);
  
  // Form setup with react-hook-form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BudgetFormInputs>({
    defaultValues: {
      siteArea: formData.siteArea || 2500,
      areaUnit: formData.areaUnit || 'sqft',
      projectDuration: formData.projectDuration || 12,
      location: formData.location || 'CA',
      isExpedited: formData.isExpedited || false,
      complexityFactor: formData.complexityFactor || 1.0,
      contingencyPercentage: formData.contingencyPercentage || 10
    }
  });

  // Watch form values for auto-recalculation
  const watchedValues = watch();
  
  // Generate budget recommendation
  const generateBudget = () => {
    const options: BudgetRecommendationOptions = {
      projectType: formData.projectType || ProjectType.RESIDENTIAL,
      siteArea: watchedValues.siteArea,
      areaUnit: watchedValues.areaUnit,
      projectDuration: watchedValues.projectDuration,
      state: watchedValues.location,
      isExpedited: watchedValues.isExpedited,
      complexityFactor: watchedValues.complexityFactor,
      contingencyPercentage: watchedValues.contingencyPercentage
    };

    const generatedBudget = generateBudgetWithItems(options);
    setBudget(generatedBudget);
    
    // Update form data with new budget
    updateFormData({
      ...formData,
      ...watchedValues,
      budget: generatedBudget
    });
    
    // Switch to review tab
    setActiveTab('review');
  };
  
  // Handle form submission
  const onSubmit = (data: BudgetFormInputs) => {
    // Update form data
    updateFormData({
      ...formData,
      ...data
    });
    
    // Generate budget
    generateBudget();
  };
  
  // Handle manual category updates
  const updateCategory = (categoryId: string, amount: number) => {
    if (!budget) return;
    
    const updatedBudget = { ...budget };
    const categoryIndex = updatedBudget.categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex >= 0) {
      // Calculate difference from previous amount
      const oldAmount = updatedBudget.categories[categoryIndex].plannedAmount;
      const difference = amount - oldAmount;
      
      // Update category and total budget
      updatedBudget.categories[categoryIndex].plannedAmount = amount;
      updatedBudget.totalBudget += difference;
      
      // Update budget state and form data
      setBudget(updatedBudget);
      updateFormData({
        ...formData,
        budget: updatedBudget
      });
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (budget) {
      onNext();
    } else {
      // If no budget yet, generate one first
      generateBudget();
    }
  };
  
  // Initialize budget if it already exists in form data
  useEffect(() => {
    if (formData.budget) {
      setBudget(formData.budget);
      setActiveTab('review');
    }
  }, [formData.budget]);

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-6">{t('budgetStep.title')}</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="form">
            <Settings className="h-4 w-4 mr-2" />
            {t('budgetStep.configureBudget')}
          </TabsTrigger>
          <TabsTrigger value="review" disabled={!budget}>
            <PieChart className="h-4 w-4 mr-2" />
            {t('budgetStep.reviewBudget')}
          </TabsTrigger>
        </TabsList>
        
        {/* Budget Configuration Form */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>{t('budgetStep.budgetParameters')}</CardTitle>
              <CardDescription>
                {t('budgetStep.budgetParametersDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Site Area */}
                  <div>
                    <Label htmlFor="siteArea">{t('budgetStep.siteArea')}</Label>
                    <div className="flex">
                      <Controller
                        name="siteArea"
                        control={control}
                        rules={{ required: true, min: 100 }}
                        render={({ field }) => (
                          <Input
                            id="siteArea"
                            type="number"
                            className="flex-1"
                            placeholder="e.g., 2500"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        )}
                      />
                      <Controller
                        name="areaUnit"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-24 ml-2">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sqft">sq ft</SelectItem>
                              <SelectItem value="sqm">sq m</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.siteArea && (
                      <p className="text-red-500 text-sm mt-1">
                        {t('budgetStep.validationSiteArea')}
                      </p>
                    )}
                  </div>
                  
                  {/* Project Duration */}
                  <div>
                    <Label htmlFor="projectDuration">{t('budgetStep.projectDuration')}</Label>
                    <div className="flex items-center">
                      <Controller
                        name="projectDuration"
                        control={control}
                        rules={{ required: true, min: 1 }}
                        render={({ field }) => (
                          <Input
                            id="projectDuration"
                            type="number"
                            placeholder="e.g., 12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        )}
                      />
                      <span className="ml-2">{t('budgetStep.months')}</span>
                    </div>
                    {errors.projectDuration && (
                      <p className="text-red-500 text-sm mt-1">
                        {t('budgetStep.validationDuration')}
                      </p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <Label htmlFor="location">{t('budgetStep.location')}</Label>
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('budgetStep.selectLocation')} />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            <div className="p-2 font-semibold border-b">
                              {t('budgetStep.usStates')}
                            </div>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                            <div className="p-2 font-semibold border-b border-t">
                              {t('budgetStep.canadianProvinces')}
                            </div>
                            {CANADIAN_PROVINCES.map((province) => (
                              <SelectItem key={province.value} value={province.value}>
                                {province.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {t('budgetStep.validationLocation')}
                      </p>
                    )}
                  </div>
                  
                  {/* Contingency Percentage */}
                  <div>
                    <Label htmlFor="contingencyPercentage">
                      {t('budgetStep.contingencyPercentage')}
                    </Label>
                    <div className="flex items-center">
                      <Controller
                        name="contingencyPercentage"
                        control={control}
                        rules={{ min: 0, max: 30 }}
                        render={({ field }) => (
                          <Input
                            id="contingencyPercentage"
                            type="number"
                            placeholder="e.g., 10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        )}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    {errors.contingencyPercentage && (
                      <p className="text-red-500 text-sm mt-1">
                        {t('budgetStep.validationContingency')}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Advanced Options */}
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>{t('budgetStep.advancedOptions')}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {/* Expedited Timeline */}
                        <div className="flex items-center space-x-2">
                          <Controller
                            name="isExpedited"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="isExpedited"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="isExpedited" className="cursor-pointer">
                            {t('budgetStep.expeditedTimeline')}
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('budgetStep.expeditedTimelineTooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        {/* Complexity Factor */}
                        <div>
                          <div className="flex items-center">
                            <Label htmlFor="complexityFactor">
                              {t('budgetStep.complexityFactor')}
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 ml-2 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('budgetStep.complexityFactorTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Simple</span>
                            <Controller
                              name="complexityFactor"
                              control={control}
                              rules={{ min: 0.8, max: 1.5 }}
                              render={({ field }) => (
                                <Input
                                  id="complexityFactor"
                                  type="range"
                                  min="0.8"
                                  max="1.5"
                                  step="0.1"
                                  className="w-full"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              )}
                            />
                            <span className="text-sm">Complex</span>
                          </div>
                          <div className="text-center text-sm font-medium">
                            {watchedValues.complexityFactor}x
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={onBack}>
                    {t('common.back')}
                  </Button>
                  <div className="space-x-2">
                    <Button type="submit" variant="default">
                      <Zap className="h-4 w-4 mr-2" />
                      {t('budgetStep.generateBudget')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Budget Review */}
        <TabsContent value="review">
          {budget && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t('budgetStep.budgetReview')}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('form')}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    {t('budgetStep.adjustParameters')}
                  </Button>
                </div>
                <CardDescription>
                  {t('budgetStep.budgetReviewDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Budget Summary */}
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">
                        {t('budgetStep.totalBudget')}
                      </h3>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(budget.totalBudget)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t('budgetStep.includesContingency', { 
                          amount: formatCurrency(
                            budget.categories.find(c => c.name === 'Contingency')?.plannedAmount || 0
                          )
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generateBudget}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('budgetStep.regenerate')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingCategories(!editingCategories)}
                      >
                        {editingCategories ? 
                          <CheckCircle2 className="h-4 w-4 mr-2" /> : 
                          <Edit3 className="h-4 w-4 mr-2" />
                        }
                        {editingCategories ? 
                          t('budgetStep.doneEditing') : 
                          t('budgetStep.customizeBudget')
                        }
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Budget Categories */}
                <div>
                  <h3 className="font-medium text-lg mb-3">
                    {t('budgetStep.budgetCategories')}
                  </h3>
                  
                  <div className="space-y-3">
                    {budget.categories.map((category) => (
                      <div 
                        key={category.id} 
                        className="bg-white border rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{category.name}</div>
                          {editingCategories ? (
                            <Input
                              type="number"
                              className="w-32 text-right"
                              defaultValue={category.plannedAmount}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateCategory(category.id, value);
                                }
                              }}
                            />
                          ) : (
                            <div className="font-medium">
                              {formatCurrency(category.plannedAmount)}
                            </div>
                          )}
                        </div>
                        
                        {/* Show category items if expanded */}
                        {showDetails && category.items && category.items.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                            {category.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div className="text-slate-600">{item.name}</div>
                                <div>{formatCurrency(item.plannedAmount)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Toggle details button */}
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 
                      t('budgetStep.hideItemDetails') : 
                      t('budgetStep.showItemDetails')
                    }
                  </Button>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={onBack}>
                    {t('common.back')}
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    {t('common.next')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
