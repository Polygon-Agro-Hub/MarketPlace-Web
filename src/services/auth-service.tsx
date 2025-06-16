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

// Interface for complaint payload
interface ComplaintPayload {
  userId: number;
  token: string;
  complaintCategoryId: number;
  complaint: string;
  images: File[];
  imagesToDelete?: number[];
  complaintId?: number;
}

// Interface for complaint response
interface ComplaintResponse {
  status: boolean;
  message: string;
  complaintId?: number;
}

export const submitComplaint = async (payload: ComplaintPayload): Promise<ComplaintResponse> => {
  try {
    // Validate authentication
    if (!payload.userId || !payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    // Validate form inputs
    if (!payload.complaintCategoryId || !payload.complaint) {
      throw new Error('Please select a category and enter a complaint.');
    }

    // Validate image types and size
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    for (const image of payload.images) {
      if (!allowedMimeTypes.includes(image.type)) {
        throw new Error(`Unsupported file type for ${image.name}.`);
      }
      if (image.size > maxFileSize) {
        throw new Error(`File ${image.name} exceeds 5MB limit.`);
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('complaintCategoryId', payload.complaintCategoryId.toString());
    formData.append('complaint', payload.complaint);
    payload.images.forEach((image) => {
      formData.append('images', image);
    });
    if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(payload.imagesToDelete));
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200';
    const url = payload.complaintId
      ? `${API_BASE_URL}/api/auth/update/${payload.userId}/${payload.complaintId}`
      : `${API_BASE_URL}/api/auth/submit/${payload.userId}`;

    console.log('Sending complaint to:', url); // Debug: Log URL

    const response = await axios({
      method: payload.complaintId ? 'PUT' : 'POST',
      url,
      headers: {
        Authorization: `Bearer ${payload.token}`,
        // Note: 'Content-Type' is not set manually for FormData; axios handles it
      },
      data: formData,
    });

    const resData = response.data;

    if (resData.status === true) {
      return resData;
    } else {
      throw new Error(resData.message || 'Complaint submission failed on server.');
    }
  } catch (error: any) {
    if (error.response) {
      // Check if response is JSON
      const contentType = error.response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', error.response.data); // Debug: Log raw response
        throw new Error(
          'Unexpected server response. Expected JSON but received HTML or other content. Please check the server configuration.'
        );
      }

      const resData = error.response.data;
      throw new Error(
        resData?.message ||
          resData?.error ||
          `Complaint submission failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred during complaint submission.');
    }
  }
};

// Interfaces
interface Complaint {
  id: string;
  category: string;
  date: string;
  status: string;
  description: string;
  images: string[];
  isNew: boolean;
  createdAt: Date;
  reply?: string;
  replyDate?: string | null;

  customerName?: string;
}

interface ApiComplaint {
  complainId: number;
  complaiCategoryId: number;
  createdAt: string | number | Date;
  status: string;
  complain: string;
  images: string[];
  reply?: string;
   replyDate?: string | null;
  customerName?: string;
}

interface ApiResponse {
  status: boolean;
  data: ApiComplaint[];
  message?: string;
}

interface FetchComplaintsPayload {
  userId: number;
  token: string;
}

// Map category ID to category name
const categoryMap: { [key: number]: string } = {
  1: 'Product Issues',
  2: 'Delivery Issues',
  3: 'Payment Issues',
  4: 'Customer Service',
};

// Function to format date to "Month Day, Year"
const formatDate = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const fetchComplaints = async (payload: FetchComplaintsPayload): Promise<Complaint[]> => {
  try {
    if (!payload.userId || !payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200';
    const url = `${API_BASE_URL}/api/auth/complaints/user/${payload.userId}`;

    console.log('Fetching complaints from:', url);

    const response = await axios({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    const resData: ApiResponse = response.data;

    if (resData.status && resData.data) {
      const mappedComplaints: Complaint[] = resData.data.map((item: ApiComplaint) => ({
        id: String(item.complainId),
        category: categoryMap[item.complaiCategoryId] || 'Unknown Category',
        date: formatDate(item.createdAt),
        status: item.status || 'Opened',
        description: item.complain,
        images: item.images || [],
        isNew: !item.status || item.status === 'Opened',
        createdAt: new Date(item.createdAt),
        reply: item.reply || 'No reply available yet.',
        replyDate: item.replyDate || null,
        customerName: item.customerName || 'Unknown Customer',
      }));
      return mappedComplaints;
    } else {
      throw new Error(resData.message || 'Invalid response format');
    }
  } catch (error: any) {
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', error.response.data);
        throw new Error(
          'Unexpected server response. Expected JSON but received HTML or other content. Please check the server configuration.'
        );
      }

      const resData = error.response.data;
      throw new Error(
        resData?.message ||
          resData?.error ||
          `Failed to fetch complaints with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while fetching complaints.');
    }
  }
};