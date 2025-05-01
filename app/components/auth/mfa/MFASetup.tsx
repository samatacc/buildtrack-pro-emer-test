import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mfaService, TOTPSetupData, MFAMethod, MFAMethodType } from '@/lib/auth/MFAService';
import { 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon, 
  QrCodeIcon, 
  KeyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import TOTPSetup from './TOTPSetup';
import BackupCodesSetup from './BackupCodesSetup';
import SMSSetup from './SMSSetup';

interface MFASetupProps {
  onComplete?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [methods, setMethods] = useState<MFAMethod[]>([]);
  const [setupStep, setSetupStep] = useState<'methods' | 'totp' | 'sms' | 'backup'>('methods');
  const [totpData, setTotpData] = useState<TOTPSetupData | null>(null);
  
  // Load MFA status
  useEffect(() => {
    const loadMFAStatus = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const status = await mfaService.getMFAStatus(user.id);
        setMfaEnabled(status.isEnabled);
        setMethods(status.methods);
      } catch (err) {
        console.error('Error loading MFA status:', err);
        setError('Failed to load MFA status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMFAStatus();
  }, [user]);
  
  // Handle enabling MFA
  const handleEnableMFA = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await mfaService.enableMFA(user.id);
      setMfaEnabled(true);
      toast.success('Multi-factor authentication has been enabled');
    } catch (err) {
      console.error('Error enabling MFA:', err);
      setError('Failed to enable MFA. Please try again.');
      toast.error('Failed to enable MFA');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle disabling MFA
  const handleDisableMFA = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await mfaService.disableMFA(user.id);
      setMfaEnabled(false);
      setMethods([]);
      toast.success('Multi-factor authentication has been disabled');
    } catch (err) {
      console.error('Error disabling MFA:', err);
      setError('Failed to disable MFA. Please try again.');
      toast.error('Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start TOTP setup
  const startTOTPSetup = async () => {
    if (!user || !user.email) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await mfaService.generateTOTPSetup(user.id, user.email);
      setTotpData(data);
      setSetupStep('totp');
    } catch (err) {
      console.error('Error starting TOTP setup:', err);
      setError('Failed to start authenticator setup. Please try again.');
      toast.error('Failed to start authenticator setup');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start SMS setup
  const startSMSSetup = () => {
    setSetupStep('sms');
  };
  
  // Start backup codes setup
  const startBackupCodesSetup = () => {
    setSetupStep('backup');
  };
  
  // Complete method setup
  const handleMethodSetupComplete = (type: MFAMethodType) => {
    setSetupStep('methods');
    
    // Reload methods
    if (user) {
      mfaService.getMFAStatus(user.id)
        .then(status => {
          setMethods(status.methods);
        })
        .catch(err => {
          console.error('Error reloading MFA methods:', err);
        });
    }
    
    // If onComplete callback is provided, call it
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handle delete method
  const handleDeleteMethod = async (methodId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      await mfaService.deleteMFAMethod(user.id, methodId);
      
      // Update methods list
      const updatedMethods = methods.filter(m => m.id !== methodId);
      setMethods(updatedMethods);
      
      toast.success('MFA method removed successfully');
      
      // If no methods left, disable MFA
      if (updatedMethods.length === 0) {
        await mfaService.disableMFA(user.id);
        setMfaEnabled(false);
      }
    } catch (err) {
      console.error('Error deleting MFA method:', err);
      toast.error('Failed to remove MFA method');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle set primary method
  const handleSetPrimaryMethod = async (methodId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      await mfaService.setPrimaryMFAMethod(user.id, methodId);
      
      // Update methods list
      const updatedMethods = methods.map(m => ({
        ...m,
        isPrimary: m.id === methodId
      }));
      
      setMethods(updatedMethods);
      toast.success('Primary MFA method updated');
    } catch (err) {
      console.error('Error setting primary MFA method:', err);
      toast.error('Failed to update primary MFA method');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render loading state
  if (isLoading && methods.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(236,107,44)]"></div>
      </div>
    );
  }
  
  // Render TOTP setup
  if (setupStep === 'totp' && totpData) {
    return (
      <TOTPSetup 
        totpData={totpData} 
        onComplete={() => handleMethodSetupComplete('totp')}
        onCancel={() => setSetupStep('methods')}
      />
    );
  }
  
  // Render SMS setup
  if (setupStep === 'sms') {
    return (
      <SMSSetup 
        onComplete={() => handleMethodSetupComplete('sms')}
        onCancel={() => setSetupStep('methods')}
      />
    );
  }
  
  // Render backup codes setup
  if (setupStep === 'backup') {
    return (
      <BackupCodesSetup 
        onComplete={() => handleMethodSetupComplete('backup_codes')}
        onCancel={() => setSetupStep('methods')}
      />
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <ShieldCheckIcon className="h-8 w-8 text-[rgb(24,62,105)] mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Multi-Factor Authentication
        </h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Multi-factor authentication adds an extra layer of security to your account by requiring additional verification beyond just your password.
        </p>
        
        <div className="flex items-center">
          <div className="relative inline-block w-10 mr-3 align-middle">
            <input 
              type="checkbox" 
              id="mfa-toggle" 
              className="peer absolute w-6 h-6 opacity-0"
              checked={mfaEnabled}
              onChange={mfaEnabled ? handleDisableMFA : handleEnableMFA}
              disabled={isLoading}
            />
            <label 
              htmlFor="mfa-toggle" 
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${
                mfaEnabled 
                  ? 'bg-[rgb(236,107,44)]' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span 
                className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in ${
                  mfaEnabled 
                    ? 'translate-x-4 bg-white' 
                    : 'translate-x-0 bg-white'
                }`}
              />
            </label>
          </div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {mfaEnabled ? 'MFA is enabled' : 'MFA is disabled'}
          </span>
        </div>
      </div>
      
      {mfaEnabled && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              MFA Methods
            </h3>
            
            {methods.length > 0 ? (
              <div className="space-y-4 mb-6">
                {methods.map(method => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      {method.type === 'totp' && (
                        <QrCodeIcon className="h-6 w-6 text-[rgb(24,62,105)] mr-3" />
                      )}
                      {method.type === 'sms' && (
                        <DevicePhoneMobileIcon className="h-6 w-6 text-[rgb(24,62,105)] mr-3" />
                      )}
                      {method.type === 'backup_codes' && (
                        <KeyIcon className="h-6 w-6 text-[rgb(24,62,105)] mr-3" />
                      )}
                      
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {method.name}
                          {method.isPrimary && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {method.value && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {method.value}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!method.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryMethod(method.id)}
                          className="text-sm px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          disabled={isLoading}
                        >
                          Set Primary
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="text-sm px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-md transition-colors"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 mb-6">
                No MFA methods have been set up yet. Add a method below.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={startTOTPSetup}
                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[rgb(24,62,105)] hover:bg-blue-50 dark:hover:bg-[rgb(24,62,105)] dark:hover:bg-opacity-10 transition-colors"
                disabled={isLoading}
              >
                <QrCodeIcon className="h-10 w-10 text-[rgb(24,62,105)] mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Authenticator App
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Use an app like Google Authenticator
                </span>
              </button>
              
              <button
                onClick={startSMSSetup}
                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[rgb(24,62,105)] hover:bg-blue-50 dark:hover:bg-[rgb(24,62,105)] dark:hover:bg-opacity-10 transition-colors"
                disabled={isLoading}
              >
                <DevicePhoneMobileIcon className="h-10 w-10 text-[rgb(24,62,105)] mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  SMS Verification
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Receive codes via text message
                </span>
              </button>
              
              <button
                onClick={startBackupCodesSetup}
                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[rgb(24,62,105)] hover:bg-blue-50 dark:hover:bg-[rgb(24,62,105)] dark:hover:bg-opacity-10 transition-colors"
                disabled={isLoading}
              >
                <KeyIcon className="h-10 w-10 text-[rgb(24,62,105)] mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Backup Codes
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Generate one-time use recovery codes
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MFASetup;
