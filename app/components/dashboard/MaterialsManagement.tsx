'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * MaterialsManagement Component
 * 
 * Comprehensive materials tracking system for construction projects with
 * full internationalization support for units, currencies, and measurements.
 * 
 * Features:
 * - Material inventory tracking with localized units
 * - Order management with delivery status
 * - Budget allocation and tracking
 * - Mobile-optimized interface for on-site access
 * - Offline capability for remote construction sites
 */
interface Material {
  id: number | string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  currency: string;
  supplier: string;
  deliveryStatus: string;
  deliveryDate?: string;
  projectId: number | string;
  projectName?: string;
}

interface MaterialsManagementProps {
  projectId?: number | string;
  materials?: Material[];
  showFilters?: boolean;
  variant?: 'widget' | 'fullpage';
  locale?: string;
  className?: string;
}

export default function MaterialsManagement({
  projectId,
  materials: initialMaterials = [],
  showFilters = true,
  variant = 'widget',
  locale,
  className = '',
}: MaterialsManagementProps) {
  const { t, metrics } = useNamespacedTranslations('materials');
  
  // State for materials, filters, and sorting
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(initialMaterials);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load materials data if not provided as props
  useEffect(() => {
    if (initialMaterials.length === 0 && projectId) {
      // This would normally fetch from an API
      setIsLoading(true);
      
      // Mock data generation with delay to simulate API fetch
      setTimeout(() => {
        const mockMaterials: Material[] = [
          {
            id: 1,
            name: 'Concrete Mix (High Strength)',
            category: 'concrete',
            quantity: 120,
            unit: 'bag',
            unitCost: 8.99,
            totalCost: 1078.8,
            currency: 'USD',
            supplier: 'BuildMat Industries',
            deliveryStatus: 'delivered',
            deliveryDate: '2025-04-15',
            projectId: 1,
            projectName: 'Highland Residence'
          },
          {
            id: 2,
            name: 'Steel Rebar (10mm)',
            category: 'steel',
            quantity: 250,
            unit: 'meter',
            unitCost: 3.50,
            totalCost: 875,
            currency: 'USD',
            supplier: 'SteelCraft Supply',
            deliveryStatus: 'pending',
            deliveryDate: '2025-05-05',
            projectId: 1,
            projectName: 'Highland Residence'
          },
          {
            id: 3,
            name: 'Lumber (2x4)',
            category: 'wood',
            quantity: 180,
            unit: 'piece',
            unitCost: 4.25,
            totalCost: 765,
            currency: 'USD',
            supplier: 'Forestry Solutions',
            deliveryStatus: 'in_transit',
            deliveryDate: '2025-04-30',
            projectId: 1,
            projectName: 'Highland Residence'
          },
          {
            id: 4,
            name: 'Ceramic Tiles (White)',
            category: 'finishes',
            quantity: 350,
            unit: 'sqm',
            unitCost: 22.99,
            totalCost: 8046.5,
            currency: 'USD',
            supplier: 'Designer Tiles Co.',
            deliveryStatus: 'ordered',
            deliveryDate: '2025-05-15',
            projectId: 1,
            projectName: 'Highland Residence'
          },
          {
            id: 5,
            name: 'Electrical Wire (12 AWG)',
            category: 'electrical',
            quantity: 500,
            unit: 'meter',
            unitCost: 0.89,
            totalCost: 445,
            currency: 'USD',
            supplier: 'PowerConnect Systems',
            deliveryStatus: 'delivered',
            deliveryDate: '2025-04-10',
            projectId: 1,
            projectName: 'Highland Residence'
          }
        ];
        
        setMaterials(mockMaterials);
        setFilteredMaterials(mockMaterials);
        setIsLoading(false);
      }, 800);
    }
  }, [initialMaterials, projectId]);
  
  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    let result = [...materials];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.deliveryStatus === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareValueA: string | number = a[sortField as keyof Material] as string | number;
      let compareValueB: string | number = b[sortField as keyof Material] as string | number;
      
      // Handle string comparison
      if (typeof compareValueA === 'string' && typeof compareValueB === 'string') {
        const comparison = compareValueA.localeCompare(compareValueB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // Handle number comparison
      if (typeof compareValueA === 'number' && typeof compareValueB === 'number') {
        return sortDirection === 'asc' 
          ? compareValueA - compareValueB 
          : compareValueB - compareValueA;
      }
      
      return 0;
    });
    
    setFilteredMaterials(result);
  }, [materials, categoryFilter, statusFilter, searchQuery, sortField, sortDirection]);
  
  // Format currency based on locale
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 2 
    }).format(amount);
  };
  
  // Format date based on locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get delivery status style and text
  const getDeliveryStatus = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          label: t('status.delivered'),
          className: 'bg-green-100 text-green-800'
        };
      case 'in_transit':
        return {
          label: t('status.inTransit'),
          className: 'bg-blue-100 text-blue-800'
        };
      case 'pending':
        return {
          label: t('status.pending'),
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'ordered':
        return {
          label: t('status.ordered'),
          className: 'bg-purple-100 text-purple-800'
        };
      case 'delayed':
        return {
          label: t('status.delayed'),
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };
  
  // Get localized unit display
  const getLocalizedUnit = (unit: string, quantity: number) => {
    // Pluralization and localization of units
    const unitKey = quantity === 1 ? `units.${unit}.singular` : `units.${unit}.plural`;
    return t(unitKey, { fallback: unit });
  };
  
  // Handle sort click
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Calculate total materials cost
  const getTotalCost = () => {
    return filteredMaterials.reduce((sum, material) => sum + material.totalCost, 0);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">
          {projectId ? t('projectMaterials') : t('allMaterials')}
        </h3>
        {metrics && (
          <p className="text-xs text-gray-500 mt-1">
            {t('loadedIn')} {metrics.loadTime}ms
          </p>
        )}
      </div>
      
      {/* Filters - Only show in fullpage variant or if showFilters prop is true */}
      {(variant === 'fullpage' || showFilters) && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Category filter */}
              <div className="flex items-center">
                <label htmlFor="categoryFilter" className="text-sm text-gray-600 mr-2">
                  {t('category')}:
                </label>
                <select
                  id="categoryFilter"
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">{t('all')}</option>
                  <option value="concrete">{t('categories.concrete')}</option>
                  <option value="steel">{t('categories.steel')}</option>
                  <option value="wood">{t('categories.wood')}</option>
                  <option value="finishes">{t('categories.finishes')}</option>
                  <option value="electrical">{t('categories.electrical')}</option>
                  <option value="plumbing">{t('categories.plumbing')}</option>
                </select>
              </div>
              
              {/* Status filter */}
              <div className="flex items-center">
                <label htmlFor="statusFilter" className="text-sm text-gray-600 mr-2">
                  {t('status.label')}:
                </label>
                <select
                  id="statusFilter"
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('all')}</option>
                  <option value="delivered">{t('status.delivered')}</option>
                  <option value="in_transit">{t('status.inTransit')}</option>
                  <option value="pending">{t('status.pending')}</option>
                  <option value="ordered">{t('status.ordered')}</option>
                  <option value="delayed">{t('status.delayed')}</option>
                </select>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder={t('search')}
                className="text-sm border border-gray-300 rounded px-3 py-1 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="mt-2 text-gray-500">{t('loading')}</p>
        </div>
      ) : (
        <>
          {/* Materials table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('name')}
                  >
                    <div className="flex items-center">
                      {t('materialName')}
                      {sortField === 'name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('quantity')}
                  >
                    <div className="flex items-center">
                      {t('quantity')}
                      {sortField === 'quantity' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('totalCost')}
                  >
                    <div className="flex items-center">
                      {t('cost')}
                      {sortField === 'totalCost' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('deliveryStatus')}
                  >
                    <div className="flex items-center">
                      {t('status.label')}
                      {sortField === 'deliveryStatus' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  {variant === 'fullpage' && (
                    <>
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortClick('supplier')}
                      >
                        <div className="flex items-center">
                          {t('supplier')}
                          {sortField === 'supplier' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortClick('deliveryDate')}
                      >
                        <div className="flex items-center">
                          {t('deliveryDate')}
                          {sortField === 'deliveryDate' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    </>
                  )}
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">{t('actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                        <div className="text-xs text-gray-500">{t(`categories.${material.category}`)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {material.quantity} {getLocalizedUnit(material.unit, material.quantity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ {formatCurrency(material.unitCost, material.currency)} / {getLocalizedUnit(material.unit, 1)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(material.totalCost, material.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDeliveryStatus(material.deliveryStatus).className}`}>
                          {getDeliveryStatus(material.deliveryStatus).label}
                        </span>
                      </td>
                      {variant === 'fullpage' && (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {material.supplier}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(material.deliveryDate)}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] mr-3">
                          {t('edit')}
                        </button>
                        {variant === 'fullpage' && (
                          <button className="text-gray-600 hover:text-gray-900">
                            {t('details')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan={variant === 'fullpage' ? 7 : 5} 
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      {t('noMaterials')}
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredMaterials.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">
                      {t('total')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {formatCurrency(getTotalCost(), 'USD')}
                    </td>
                    <td colSpan={variant === 'fullpage' ? 4 : 2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          {/* Footer - only in widget mode */}
          {variant === 'widget' && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <a 
                href="/materials" 
                className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors"
              >
                {t('viewAllMaterials')}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
