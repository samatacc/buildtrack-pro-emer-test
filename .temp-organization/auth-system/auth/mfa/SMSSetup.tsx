import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mfaService } from '@/lib/auth/MFAService';
import { DevicePhoneMobileIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface SMSSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

const SMSSetup: React.FC<SMSSetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [codeSent, setCodeSent] = useState(false);
  
  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting (US format)
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };
  
  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };
  
  // Handle sending verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate phone number
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Format phone number for API
      const formattedNumber = `+1${digitsOnly}`;
      
      const success = await mfaService.sendSMSVerificationCode(user.id, formattedNumber);
      
      if (success) {
        setCodeSent(true);
        setStep('code');
        toast.success('Verification code sent');
      }
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
      toast.error('Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Format phone number for API
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const formattedNumber = `+1${digitsOnly}`;
      
      const success = await mfaService.verifySMSSetup(user.id, formattedNumber, verificationCode);
      
      if (success) {
        toast.success('SMS verification successfully set up');
        onComplete();
      }
    } catch (err) {
      console.error('Error verifying code:', err);
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
  
  // Resend verification code
  const handleResendCode = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Format phone number for API
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const formattedNumber = `+1${digitsOnly}`;
      
      const success = await mfaService.sendSMSVerificationCode(user.id, formattedNumber);
      
      if (success) {
        toast.success('Verification code resent');
      }
    } catch (err) {
      console.error('Error resending verification code:', err);
      setError('Failed to resend code. Please try again.');
      toast.error('Failed to resend code');
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
        
        <DevicePhoneMobileIcon className="h-7 w-7 text-[rgb(24,62,105)] mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {step === 'phone' ? 'Set Up SMS Verification' : 'Verify Code'}
        </h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      {step === 'phone' ? (
        <form onSubmit={handleSendCode}>
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Enter your mobile phone number to receive verification codes via SMS.
            </p>
            
            <div className="mb-4">
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number (US)
              </label>
              <input
                type="tel"
                id="phone-number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                autoFocus
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Standard rates may apply for SMS delivery.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors flex items-center"
              disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-white mr-2 rounded-full" />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerification}>
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Enter the 6-digit verification code sent to {phoneNumber}.
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                className="w-40 p-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                autoFocus
              />
              
              <button
                type="button"
                onClick={handleResendCode}
                className="mt-3 text-sm text-[rgb(24,62,105)] dark:text-blue-400 hover:underline"
                disabled={isLoading}
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('phone')}
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
      )}
    </div>
  );
};

export default SMSSetup;
