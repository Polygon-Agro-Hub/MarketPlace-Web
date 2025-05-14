import axios from '@/lib/axios';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  userData: any;
  token?: string;
  firstName?: string;
  user?: any;
  message?: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  try {
    const response = await axios.post('/auth/login', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error: any) {

    if (error.response) {

      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Login failed with status ${error.response.status}`
      );
    } else if (error.request) {

      throw new Error('No response received from server. Please check your network connection.');
    } else {

      throw new Error(error.message || 'An error occurred during login');
    }
  }
};

// Signup interface
interface SignupPayload {
  title?: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  buyerType: 'retail' | 'business';
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface SignupResponse {
  userData?: any;
  token?: string;
  user?: any;
  message?: string;
}

export const signup = async (payload: SignupPayload): Promise<SignupResponse> => {
  try {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(payload.password)) {
      throw new Error('Password must contain at least 6 characters with 1 uppercase letter, 1 number, and 1 special character');
    }

    if (!payload.agreeToTerms) {
      throw new Error('You must agree to the Terms & Conditions');
    }

    console.log('Sending signup payload:', payload);

    const response = await axios.post('/auth/signup', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resData = response.data;

    if (resData.status === true) {

      return resData;
    } else {

      throw new Error(resData.message || 'Registration failed on server.');
    }
  } catch (error: any) {
    if (error.response) {
      const resData = error.response.data;
      throw new Error(
        resData?.message || resData?.error || `Registration failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred during registration.');
    }
  }
};
