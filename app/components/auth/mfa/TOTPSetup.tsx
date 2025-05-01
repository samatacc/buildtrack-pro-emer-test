import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mfaService, TOTPSetupData } from '@/lib/auth/MFAService';
import { QrCodeIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface TOTPSetupProps {
  totpData: TOTPSetupData;
  onComplete: () => void;
  onCancel: () => void;
}

const TOTPSetup: React.FC<TOTPSetupProps> = ({ totpData, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'scan' | 'verify'>('scan');
  
  // Handle verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await mfaService.verifyTOTPSetup(user.id, verificationCode, totpData.secret);
      
      if (success) {
        toast.success('Authenticator app successfully set up');
        onComplete();
      }
    } catch (err) {
      console.error('Error verifying TOTP setup:', err);
      setError('Invalid verification code. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear error when code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setVerificationCode(e.target.value);
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
        
        <QrCodeIcon className="h-7 w-7 text-[rgb(24,62,105)] mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {step === 'scan' ? 'Set Up Authenticator App' : 'Verify Code'}
        </h2>
      </div>
      
      {step === 'scan' ? (
        <div>
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Using an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy, scan the QR code below to set up MFA for your account.
            </p>
            
            <div className="flex flex-col items-center justify-center mb-6 p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-4 p-4 bg-white rounded-lg">
                {totpData.qrCode && (
                  <img
                    src={totpData.qrCode}
                    alt="QR Code for authenticator app"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                )}
              </div>
              
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Can't scan the QR code?
              </div>
              
              <div className="flex items-center w-full max-w-md">
                <input
                  type="text"
                  value={totpData.secret}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(totpData.secret);
                    toast.success('Secret copied to clipboard');
                  }}
                  className="ml-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={() => setStep('verify')}
              className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleVerification}>
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Enter the 6-digit verification code from your authenticator app to verify the setup.
              </p>
              
              <div className="flex flex-col items-center justify-center">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-40 p-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  autoFocus
                />
                
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The code changes every 30 seconds
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors flex items-center"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2 rounded-full" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Complete'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TOTPSetup;
