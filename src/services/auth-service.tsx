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


// // Forgot Password function
// export const sendResetEmail = async (email: string): Promise<{ message: string }> => {
//   try {
//     const response = await axios.post('/auth/forgot-password', { email }, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.status >= 200 && response.status < 300) {
//       return response.data; // { message: "Reset link sent to email." }
//     } else {
//       throw new Error(response.data?.message || 'Failed to send reset link');
//     }
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message ||
//         error.response.data?.error ||
//         `Reset link failed with status ${error.response.status}`
//       );
//     } else if (error.request) {
//       throw new Error('No response received from server. Please check your network connection.');
//     } else {
//       throw new Error(error.message || 'An error occurred while sending reset link');
//     }
//   }
// };

// // services/auth.ts or similar

// export const resetPassword = async (email: string, newPassword: string): Promise<{ message: string }> => {
//   try {
//     const response = await axios.put('/auth/reset-password', { email, newPassword }, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.status >= 200 && response.status < 300) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || 'Reset password failed');
//     }
//   } catch (error: any) {
//     if (error.response) {
//       throw new Error(
//         error.response.data?.message ||
//         error.response.data?.error ||
//         `Reset password failed with status ${error.response.status}`
//       );
//     } else if (error.request) {
//       throw new Error('No response received from server. Please check your network connection.');
//     } else {
//       throw new Error(error.message || 'An error occurred while resetting password');
//     }
//   }
// };

export const sendResetEmail = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.error ||
        error.response.data?.message ||
        `Failed to send reset email (${error.response.status})`
      );
    }
    throw new Error(error.message || 'Failed to send reset email');
  }
};


// auth-service.ts
export const validateResetToken = async (token: string): Promise<{ 
  success: boolean; 
  message: string; 
  email?: string 
}> => {
  try {
    const response = await axios.get(`/auth/validate-reset-token/${token}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Token validation failed (${error.response.status})`
      );
    }
    throw new Error(error.message || 'Failed to validate token');
  }
};

export const resetPassword = async (
  token: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.put('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Password reset failed (${error.response.status})`
      );
    }
    throw new Error(error.message || 'Failed to reset password');
  }
};