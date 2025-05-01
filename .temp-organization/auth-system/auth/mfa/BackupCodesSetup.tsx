import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mfaService, BackupCodes } from '@/lib/auth/MFAService';
import { KeyIcon, ArrowLeftIcon, CheckCircleIcon, DocumentDuplicateIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BackupCodesSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

const BackupCodesSetup: React.FC<BackupCodesSetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<BackupCodes | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  
  // Generate backup codes on component mount
  useEffect(() => {
    const generateBackupCodes = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const codes = await mfaService.generateBackupCodes(user.id);
        setBackupCodes(codes);
      } catch (err) {
        console.error('Error generating backup codes:', err);
        setError('Failed to generate backup codes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateBackupCodes();
  }, [user]);
  
  // Copy backup codes to clipboard
  const handleCopyToClipboard = () => {
    if (!backupCodes) return;
    
    try {
      const codeText = backupCodes.codes.join('\n');
      navigator.clipboard.writeText(codeText);
      toast.success('Backup codes copied to clipboard');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast.error('Failed to copy codes');
    }
  };
  
  // Download backup codes as a text file
  const handleDownload = () => {
    if (!backupCodes) return;
    
    try {
      const codeText = `BuildTrack Pro Backup Codes\nGenerated: ${new Date(backupCodes.createdAt).toLocaleString()}\n\n${backupCodes.codes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
      
      const blob = new Blob([codeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'buildtrack-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Backup codes downloaded');
    } catch (err) {
      console.error('Error downloading backup codes:', err);
      toast.error('Failed to download codes');
    }
  };
  
  // Complete setup
  const handleCompleteSetup = async () => {
    if (!user || !backupCodes) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would save the backup codes method to the user's account
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Backup codes successfully set up');
      onComplete();
    } catch (err) {
      console.error('Error completing backup codes setup:', err);
      setError('Failed to complete setup. Please try again.');
      toast.error('Setup failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="p-1 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        <KeyIcon className="h-7 w-7 text-[rgb(24,62,105)] mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Backup Codes
        </h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Backup codes allow you to sign in to your account if you lose access to your authentication device. Each code can only be used once.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(236,107,44)]"></div>
          </div>
        ) : (
          backupCodes && (
            <div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.codes.map((code, index) => (
                    <div key={index} className="font-mono text-gray-900 dark:text-gray-100 text-sm p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                  Copy
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download
                </button>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded-md text-yellow-800 dark:text-yellow-300 mb-6">
                <p className="text-sm">
                  <strong>Important:</strong> Store these codes in a safe place. They will not be shown again. If you lose access to your authentication device, you'll need these codes to sign in.
                </p>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  id="confirm-saved"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 text-[rgb(236,107,44)] border-gray-300 rounded focus:ring-[rgb(236,107,44)]"
                />
                <label htmlFor="confirm-saved" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I have saved these backup codes in a safe place
                </label>
              </div>
            </div>
          )
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <button
          onClick={handleCompleteSetup}
          className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors flex items-center"
          disabled={isLoading || !confirmed || !backupCodes}
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2 rounded-full" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Complete Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BackupCodesSetup;
