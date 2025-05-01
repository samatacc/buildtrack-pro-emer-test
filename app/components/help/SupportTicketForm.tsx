import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface SupportTicketFormProps {
  onSubmit: (subject: string, description: string, category: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CATEGORY_OPTIONS = [
  'Technical Issue',
  'Account Management',
  'Billing Inquiry',
  'Feature Request',
  'General Question',
  'Other'
];

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const { t } = useTranslations('help');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<{
    subject?: string;
    description?: string;
  }>({});
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {
      subject?: string;
      description?: string;
    } = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Submit form
    onSubmit(subject, description, category, priority);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format file size
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          {t('newSupportTicket') || 'Create New Support Ticket'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={isLoading}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
              }}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of your issue"
              disabled={isLoading}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <label 
                  key={p}
                  className={`
                    flex items-center justify-center py-2 border rounded-md cursor-pointer transition-colors
                    ${priority === p ? 
                      p === 'low' ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-500 dark:text-green-300' :
                      p === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-300' :
                      p === 'high' ? 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900 dark:border-orange-500 dark:text-orange-300' :
                      'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-500 dark:text-red-300'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              rows={6}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Please provide detailed information about your issue..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Please include any relevant details such as error messages, steps to reproduce, and what you were trying to accomplish.
            </p>
          </div>
          
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attachments
            </label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
              <div className="space-y-1 text-center">
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[rgb(24,62,105)] hover:text-[rgb(18,46,79)] focus-within:outline-none dark:bg-gray-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      multiple 
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF, PDF up to 10MB each
                </p>
              </div>
            </div>
            
            {attachments.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
                {attachments.map((file, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2 rounded-full" />
                Submitting...
              </>
            ) : (
              'Submit Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportTicketForm;
