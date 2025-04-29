'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * FileList Component
 * 
 * Displays project documents with filtering, sorting, and internationalization support.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 */
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  createdBy: string;
  projectId: string;
  projectName: string;
  tags: string[];
  status: 'draft' | 'approved' | 'revision' | 'final';
}

interface FileListProps {
  projectId?: string;
  className?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export default function FileList({
  projectId,
  className = '',
  showFilters = true,
  maxItems
}: FileListProps) {
  const { t, metrics } = useNamespacedTranslations('documents');
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof FileItem>('lastModified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Load files data
  useEffect(() => {
    // Mock data
    const mockFiles: FileItem[] = [
      {
        id: 'file1',
        name: 'Site Plan v2.pdf',
        type: 'pdf',
        size: 2457600,
        lastModified: '2025-04-20T15:30:00',
        createdBy: 'John Smith',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['plan', 'site'],
        status: 'final'
      },
      {
        id: 'file2',
        name: 'Electrical Diagram.dwg',
        type: 'dwg',
        size: 1843200,
        lastModified: '2025-04-18T11:45:00',
        createdBy: 'Emily Johnson',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['electrical', 'diagram'],
        status: 'approved'
      },
      {
        id: 'file3',
        name: 'Foundation Details.pdf',
        type: 'pdf',
        size: 3686400,
        lastModified: '2025-04-15T09:20:00',
        createdBy: 'Michael Chen',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['foundation', 'structural'],
        status: 'final'
      },
      {
        id: 'file4',
        name: 'Interior Design Concept.jpg',
        type: 'jpg',
        size: 5324800,
        lastModified: '2025-04-22T14:15:00',
        createdBy: 'Sarah Williams',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['interior', 'design', 'concept'],
        status: 'draft'
      },
      {
        id: 'file5',
        name: 'Plumbing Layout.dwg',
        type: 'dwg',
        size: 2252800,
        lastModified: '2025-04-19T16:30:00',
        createdBy: 'Carlos Mendez',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['plumbing', 'layout'],
        status: 'revision'
      },
      {
        id: 'file6',
        name: 'Cost Estimate.xlsx',
        type: 'xlsx',
        size: 512000,
        lastModified: '2025-04-23T10:45:00',
        createdBy: 'John Smith',
        projectId: '1',
        projectName: 'Highland Residence',
        tags: ['cost', 'budget'],
        status: 'draft'
      }
    ];
    
    // Filter by project if projectId is provided
    const filteredByProject = projectId 
      ? mockFiles.filter(file => file.projectId === projectId)
      : mockFiles;
    
    // Simulate API delay
    setTimeout(() => {
      setFiles(filteredByProject);
      setFilteredFiles(filteredByProject);
      setIsLoading(false);
    }, 800);
  }, [projectId]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...files];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(file => file.type === typeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (sortField === 'lastModified') {
        return sortDirection === 'asc' 
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
      
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
    
    // Apply maxItems limit if specified
    const limitedResult = maxItems ? result.slice(0, maxItems) : result;
    
    setFilteredFiles(limitedResult);
  }, [files, searchQuery, typeFilter, sortField, sortDirection, maxItems]);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + t(`fileSize.${sizes[i].toLowerCase()}`);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get file type icon
  const getFileTypeIcon = (type: string): string => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'dwg':
        return '📐';
      case 'jpg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'docx':
      case 'doc':
        return '📝';
      default:
        return '📁';
    }
  };
  
  // Get status badge style
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'revision':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle sort click
  const handleSortClick = (field: keyof FileItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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
        <h2 className="text-xl font-bold text-[rgb(24,62,105)]">
          {projectId ? t('projectFiles') : t('allFiles')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {filteredFiles.length} {t('filesFound')}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* File type filter */}
              <div>
                <label htmlFor="type-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('fileType')}
                </label>
                <select
                  id="type-filter"
                  className="border border-gray-300 rounded-md p-1.5 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="pdf">PDF</option>
                  <option value="dwg">DWG</option>
                  <option value="jpg">Images</option>
                  <option value="xlsx">Excel</option>
                  <option value="docx">Word</option>
                </select>
              </div>
              
              {/* Sort options */}
              <div>
                <label htmlFor="sort-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('sortBy')}
                </label>
                <div className="flex items-center">
                  <select
                    id="sort-filter"
                    className="border border-gray-300 rounded-md p-1.5 text-sm"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as keyof FileItem)}
                  >
                    <option value="name">{t('fileName')}</option>
                    <option value="lastModified">{t('lastModified')}</option>
                    <option value="size">{t('fileSize.label')}</option>
                    <option value="type">{t('fileType')}</option>
                  </select>
                  <button
                    className="p-1.5 ml-1 border border-gray-300 rounded-md"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    aria-label={sortDirection === 'asc' ? t('sortAscending') : t('sortDescending')}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-grow max-w-md">
              <label htmlFor="file-search" className="block text-xs font-medium text-gray-700 mb-1">
                {t('search')}
              </label>
              <input
                type="text"
                id="file-search"
                className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchFiles')}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Files list */}
      <div className="divide-y divide-gray-200">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <div key={file.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="text-2xl mr-3" aria-hidden="true">
                  {getFileTypeIcon(file.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)} • {file.type.toUpperCase()} •{' '}
                        {t('lastUpdated')} {formatDate(file.lastModified)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(file.status)}`}>
                      {t(`status.${file.status}`)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {file.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <p className="text-xs text-gray-500">
                      {t('uploadedBy')} {file.createdBy}
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-xs text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)]">
                        {t('view')}
                      </button>
                      <button className="text-xs text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)]">
                        {t('download')}
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        {t('share')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            {t('noFilesFound')}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button
          className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)]"
        >
          {t('uploadFiles')}
        </button>
        
        {maxItems && filteredFiles.length === maxItems && files.length > maxItems && (
          <a 
            href="/documents" 
            className="px-4 py-2 inline-flex items-center text-sm font-medium text-[rgb(24,62,105)]"
          >
            {t('viewAllFiles')}
          </a>
        )}
      </div>
    </div>
  );
}
