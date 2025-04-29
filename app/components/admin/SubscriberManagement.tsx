'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * SubscriberManagement Component
 * 
 * Admin component for managing subscribers with full internationalization support.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 */
interface Subscriber {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  company: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'pending' | 'suspended';
  lastLogin: string;
  preferredLanguage: string;
  projectCount: number;
}

interface SubscriberManagementProps {
  className?: string;
}

export default function SubscriberManagement({
  className = '',
}: SubscriberManagementProps) {
  const { t, metrics } = useNamespacedTranslations('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Subscriber>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Load subscribers data
  useEffect(() => {
    // Mock data
    const mockSubscribers: Subscriber[] = [
      {
        id: 's1',
        name: 'Johnson Construction',
        email: 'admin@johnsonconstruction.com',
        role: 'admin',
        company: 'Johnson Construction LLC',
        plan: 'professional',
        status: 'active',
        lastLogin: '2025-04-28T14:32:00',
        preferredLanguage: 'en',
        projectCount: 12
      },
      {
        id: 's2',
        name: 'Riverdale Developers',
        email: 'info@riverdale.dev',
        role: 'manager',
        company: 'Riverdale Development Group',
        plan: 'enterprise',
        status: 'active',
        lastLogin: '2025-04-27T09:15:00',
        preferredLanguage: 'en',
        projectCount: 28
      },
      {
        id: 's3',
        name: 'Martinez Construction',
        email: 'carlos@martinez-const.com',
        role: 'admin',
        company: 'Martinez Construction',
        plan: 'basic',
        status: 'active',
        lastLogin: '2025-04-25T16:45:00',
        preferredLanguage: 'es',
        projectCount: 5
      },
      {
        id: 's4',
        name: 'Portland Builders',
        email: 'admin@portlandbuilders.com',
        role: 'admin',
        company: 'Portland Builders Inc',
        plan: 'professional',
        status: 'pending',
        lastLogin: '2025-04-10T11:20:00',
        preferredLanguage: 'en',
        projectCount: 7
      },
      {
        id: 's5',
        name: 'Silva Construções',
        email: 'contato@silvaconstrucoes.com.br',
        role: 'manager',
        company: 'Silva Construções e Engenharia',
        plan: 'professional',
        status: 'active',
        lastLogin: '2025-04-28T08:30:00',
        preferredLanguage: 'pt-BR',
        projectCount: 14
      },
      {
        id: 's6',
        name: 'BuildRight Solutions',
        email: 'support@buildright.co',
        role: 'admin',
        company: 'BuildRight Solutions LLC',
        plan: 'enterprise',
        status: 'suspended',
        lastLogin: '2025-03-15T10:30:00',
        preferredLanguage: 'en',
        projectCount: 32
      },
      {
        id: 's7',
        name: 'Dubois Construction',
        email: 'info@dubois-construction.fr',
        role: 'manager',
        company: 'Dubois Construction et Rénovation',
        plan: 'basic',
        status: 'active',
        lastLogin: '2025-04-26T14:12:00',
        preferredLanguage: 'fr',
        projectCount: 8
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setSubscribers(mockSubscribers);
      setFilteredSubscribers(mockSubscribers);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...subscribers];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query) ||
        sub.company.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(sub => sub.status === statusFilter);
    }
    
    // Apply plan filter
    if (planFilter !== 'all') {
      result = result.filter(sub => sub.plan === planFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
    
    setFilteredSubscribers(result);
  }, [subscribers, searchQuery, statusFilter, planFilter, sortField, sortDirection]);
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get language name from code
  const getLanguageName = (code: string) => {
    const languages: {[key: string]: string} = {
      'en': 'English',
      'es': 'Español',
      'pt-BR': 'Português (Brasil)',
      'fr': 'Français'
    };
    
    return languages[code] || code;
  };
  
  // Handle sort click
  const handleSortClick = (field: keyof Subscriber) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get status badge style
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-40">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="ml-2 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('subscriberManagement')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('totalSubscribers')}: {subscribers.length}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">
                {t('status')}
              </label>
              <select
                id="status-filter"
                className="border border-gray-300 rounded-md p-1.5 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('all')}</option>
                <option value="active">{t('status.active')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="suspended">{t('status.suspended')}</option>
              </select>
            </div>
            
            {/* Plan filter */}
            <div>
              <label htmlFor="plan-filter" className="block text-xs font-medium text-gray-700 mb-1">
                {t('plan')}
              </label>
              <select
                id="plan-filter"
                className="border border-gray-300 rounded-md p-1.5 text-sm"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">{t('all')}</option>
                <option value="free">{t('plans.free')}</option>
                <option value="basic">{t('plans.basic')}</option>
                <option value="professional">{t('plans.professional')}</option>
                <option value="enterprise">{t('plans.enterprise')}</option>
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex-grow max-w-md">
            <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
              {t('search')}
            </label>
            <input
              type="text"
              id="search"
              className="block w-full border border-gray-300 rounded-md p-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
          </div>
        </div>
      </div>
      
      {/* Subscribers table */}
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
                  <span>{t('subscriber')}</span>
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick('plan')}
              >
                <div className="flex items-center">
                  <span>{t('plan')}</span>
                  {sortField === 'plan' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick('status')}
              >
                <div className="flex items-center">
                  <span>{t('status')}</span>
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick('preferredLanguage')}
              >
                <div className="flex items-center">
                  <span>{t('language')}</span>
                  {sortField === 'preferredLanguage' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick('lastLogin')}
              >
                <div className="flex items-center">
                  <span>{t('lastLogin')}</span>
                  {sortField === 'lastLogin' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick('projectCount')}
              >
                <div className="flex items-center">
                  <span>{t('projects')}</span>
                  {sortField === 'projectCount' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscriber.name}</div>
                        <div className="text-sm text-gray-500">{subscriber.email}</div>
                        <div className="text-xs text-gray-500">{subscriber.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{t(`plans.${subscriber.plan}`)}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {t(`roles.${subscriber.role}`)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscriber.status)}`}>
                      {t(`status.${subscriber.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getLanguageName(subscriber.preferredLanguage)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(subscriber.lastLogin)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {subscriber.projectCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)] mr-3"
                      aria-label={t('edit')}
                    >
                      {t('edit')}
                    </button>
                    <button 
                      className={`${subscriber.status === 'suspended' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                      aria-label={subscriber.status === 'suspended' ? t('activate') : t('suspend')}
                    >
                      {subscriber.status === 'suspended' ? t('activate') : t('suspend')}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  {t('noSubscribersFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add new subscriber button */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)]"
        >
          {t('addSubscriber')}
        </button>
      </div>
    </div>
  );
}
