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