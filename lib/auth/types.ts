export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'contractor' | 'client';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  authProvider?: 'email' | 'google' | 'microsoft' | 'apple';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companySize: string;
  phoneNumber: string;
  industry: string;
  plan: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface OnboardingData {
  role: string;
  teamSize: string;
  focusAreas: string[];
  sampleProject: boolean;
}
