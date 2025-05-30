import axios from '@/lib/axios';
import { environment } from '@/environment/environment';    

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
  buyerType: 'Retail' | 'Wholesale';
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

type OTPServiceResponse = {
  referenceId?: string;
  error?: string;
};

export const sendOTP = async (
  phoneNumber: string,
  countryCode: string,
  options?: {
    checkPhoneExists?: boolean;
    message?: string;
    source?: string;
  }
): Promise<OTPServiceResponse> => {
  try {
    const formattedPhone = phoneNumber.replace(/\s+/g, "");
    const fullPhoneNumber = `${countryCode}${formattedPhone}`;

    // Default options
    const {
      checkPhoneExists = true,
      message = `Your OTP for verification is: {{code}}`,
      source = "AgroWorld"
    } = options || {};

    // Step 1: Optionally check if phone number exists
    if (checkPhoneExists) {
      try {
        const checkResponse = await axios.post("/auth/check-phone", {
          phoneNumber: formattedPhone,
        });
        console.log('phone number',formattedPhone)
        console.log("Check phone response:", checkResponse.data);

        if (!checkResponse.data.exists) {
          return { error: 'PHONE_NOT_FOUND' };
        }
      } catch (error) {
        console.error("Error checking phone:", error);
        throw new Error("Failed to verify phone number");
      }
    }

    // Step 2: Send OTP
    const apiUrl = "https://api.getshoutout.com/otpservice/send";
    const headers = {
      Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
      "Content-Type": "application/json",
    };

    const body = {
      source,
      transport: "sms",
      content: {
        sms: message,
      },
      destination: fullPhoneNumber,
    };

    const response = await axios.post(apiUrl, body, { headers });
    
    console.log("OTP response:", response.data);

    if (response.data.referenceId) {
      return { referenceId: response.data.referenceId };
    }

    throw new Error("Failed to send OTP: No reference ID received");
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Failed to send OTP (${error.response.status})`
      );
    }
    throw new Error(error.message || "Failed to send OTP");
  }
};

export const sendOTPInSignup = async (
  phoneNumber: string,
  countryCode: string,
  options?: {
    checkPhoneExists?: boolean;
    message?: string;
    source?: string;
  }
): Promise<OTPServiceResponse> => {
  try {
    const formattedPhone = phoneNumber.replace(/\s+/g, "");
    const fullPhoneNumber = `${countryCode}${formattedPhone}`;

    console.log('phone numbers ',formattedPhone,fullPhoneNumber)

    // Default options
    const {
      message = `Your OTP for verification is: {{code}}`,
      source = "AgroWorld"
    } = options || {};

    // Step 2: Send OTP
    const apiUrl = "https://api.getshoutout.com/otpservice/send";
    const headers = {
      Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
      "Content-Type": "application/json",
    };

    const body = {
      source,
      transport: "sms",
      content: {
        sms: message,
      },
      destination: fullPhoneNumber,
    };

    const response = await axios.post(apiUrl, body, { headers });
    
    console.log("OTP response:", response.data);

    if (response.data.referenceId) {
      return { referenceId: response.data.referenceId };
    }

    throw new Error("Failed to send OTP: No reference ID received");
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Failed to send OTP (${error.response.status})`
      );
    }
    throw new Error(error.message || "Failed to send OTP");
  }
};

export const verifyOTP = async (code: string, referenceId: string) => {
  try {
    const url = 'https://api.getshoutout.com/otpservice/verify';
    const headers = {
      Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
      'Content-Type': 'application/json',
    };
    const body = { code, referenceId };
    
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

export const resetPasswordByPhone = async (phoneNumber: string, newPassword: string) => {
  try {
    const response = await axios.post('/auth/reset-password-by-phone', {
      phoneNumber,
      newPassword
    });
    return response.data;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};