import axios from '@/lib/axios';
import { environment } from '@/environment/environment';    

interface LoginPayload {
  email: string;
  password: string;
  buyerType: string;
}

interface LoginResponse {
  userData: any;
  token?: string;
  firstName?: string;
  user?: any;
  message?: string;
  cart:any;
  tokenExpiration:any
}

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
  categoryName: string; // ✅ Add this line
  createdAt: string | number | Date;
  status: string;
  complain: string;
  images: string[];
  reply?: string;
  replyDate?: string | null;
  customerName?: string;
}

interface Profile {
  companyName: string;
 buyerType?: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  
  phoneCode: string;
  phoneNumber: string;
    phoneCode2: string;
  phoneNumber2: string;
  image?: string;
  profileImageURL?: string;
}

interface ApiProfile {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
   phoneCode2: string;
  phoneNumber2: string;
  image?: string;
  profileImageURL?: string;
 companyName?: string; // Optional
  buyerType?: string | '' ; // Optional
}

export interface BillingAddress {
  title: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  phoneCode2?: string; // Add optional field
  phoneNumber2?: string; // Add optional field
  houseNo?: string;
  buildingNo?: string;
  buildingName?: string;
  unitNo?: string;
  floorNo?: string | null;
  streetName?: string;
  city?: string;
}

export interface BillingDetails {
  billingName: string | undefined;
  billingTitle: string; // Required
  title: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  buildingType: string;
  address: BillingAddress;
  phoneCode2?: string | null; // Added to match JSON
  phoneNumber2?: string | null; // Added to match JSON
}

interface FetchComplaintsPayload {
  userId: number;
  token: string;
}

interface FetchProfilePayload {
  token: string;
}

interface UpdateProfilePayload {
  token: string;
  data: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    phoneCode2: string;
    phoneNumber2: string;
    companyName: string;
  };
  profilePic: File | null;
}

interface UpdatePasswordPayload {
  token: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FetchBillingDetailsPayload {
  token: string;
}

interface SaveBillingDetailsPayload {
  token: string;
  data: BillingDetails;
}

// Generic ApiResponse interface
interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  message?: string;
}

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

export interface Category {
  id: number;
  categoryEnglish: string;
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


export const fetchProfile = async (payload: FetchProfilePayload): Promise<Profile> => {
  try {
    const response = await axios.get('/auth/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<ApiProfile> = response.data;

      if (resData.status && resData.data) {
        return {
          firstName: resData.data.firstName || '',
          lastName: resData.data.lastName || '',
          email: resData.data.email || '',
          phoneCode: resData.data.phoneCode || '+94',
          phoneNumber: resData.data.phoneNumber || '',
          phoneCode2: resData.data.phoneCode2 || '+94',
          phoneNumber2: resData.data.phoneNumber2 || '',
          image: resData.data.image,
          profileImageURL: resData.data.profileImageURL,
          title: resData.data.title || '',
          companyName: resData.data.companyName || '',
          buyerType: resData.data.buyerType || '', // Include buyerType
        };
      } else {
        throw new Error(resData.message || 'Invalid response format');
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch profile');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Profile fetch failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while fetching profile');
    }
  }
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<void> => {
  try {
    if (!payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const formData = new FormData();
    formData.append('title', payload.data.title);
    formData.append('firstName', payload.data.firstName);
    formData.append('lastName', payload.data.lastName);
    formData.append('email', payload.data.email);
    formData.append('phoneCode', payload.data.phoneCode);
    formData.append('phoneNumber', payload.data.phoneNumber);
     formData.append('phoneCode', payload.data.phoneCode);
    formData.append('phoneNumber', payload.data.phoneNumber);
    formData.append('phoneCode2', payload.data.phoneCode2);
    formData.append('phoneNumber2', payload.data.phoneNumber2);
    

    if (payload.profilePic) {
      formData.append('profilePicture', payload.profilePic);
    }

    const response = await axios.put('/auth/edit-profile', formData, {
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status < 200 || response.status >= 300 || !response.data.status) {
      throw new Error(response.data?.message || 'Failed to update profile');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Profile update failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while updating profile');
    }
  }
};

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<{ message: string }> => {
  try {
    if (!payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const response = await axios.put('/auth/update-password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmNewPassword: payload.confirmPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        message: response.data?.message || 'Password updated successfully!',
      };
    } else {
      throw new Error(response.data?.message || 'Failed to update password');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Password update failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while updating password');
    }
  }
};


export const fetchBillingDetails = async (payload: FetchBillingDetailsPayload): Promise<BillingDetails> => {
  try {
    if (!payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const response = await axios.get('/auth/billing-details', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<any> = response.data;

      if (resData.status && resData.data) {
        const apiData = resData.data;

       

        return {
         billingName: apiData.billingName || undefined,  // removed fallback to firstName + lastName
          billingTitle: apiData.billingTitle || undefined, // removed fallback to title
          title: apiData.title || '',
          firstName: apiData.firstName || '',
          lastName: apiData.lastName || '',
          phoneCode: apiData.phoneCode || '+94',
          phoneNumber: apiData.phoneNumber || '',
          phoneCode2: apiData.phoneCode2 || '+94',
          phoneNumber2: apiData.phoneNumber2 || '',
          buildingType: apiData.buildingType?.toLowerCase() || '',
          address: {
            title: apiData.title || 'Mr.',
            firstName: apiData.firstName || '',
            lastName: apiData.lastName || '',
            phoneCode: apiData.phoneCode || '+94',
            phoneNumber: apiData.phoneNumber || '',
            houseNo: apiData.address?.houseNo || undefined,
            buildingNo: apiData.address?.buildingNo || undefined,
            buildingName: apiData.address?.buildingName || undefined,
            unitNo: apiData.address?.unitNo || undefined,
            floorNo: apiData.address?.floorNo || null,
            streetName: apiData.address?.streetName || undefined,
            city: apiData.address?.city || undefined,
          },
        };
      } else {
        throw new Error(resData.message || 'Invalid response format');
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch billing details');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Billing details fetch failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while fetching billing details');
    }
  }
};


export const saveBillingDetails = async (payload: SaveBillingDetailsPayload): Promise<void> => {
  try {
    if (!payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const apiPayload = {
      billingTitle: payload.data.billingTitle,
      billingName: payload.data.billingName || `${payload.data.firstName} ${payload.data.lastName}`.trim(),
      title: payload.data.title,
      firstName: payload.data.firstName,
      lastName: payload.data.lastName || '',
      phoneCode: payload.data.phoneCode,
      phoneNumber: payload.data.phoneNumber,
        phoneCode2: payload.data.phoneCode2,
      phoneNumber2: payload.data.phoneNumber2,
      
      buildingType: payload.data.buildingType.toLowerCase(),
      address: {
        houseNo: payload.data.address.houseNo || null,
        buildingNo: payload.data.address.buildingNo || null,
        buildingName: payload.data.address.buildingName || null,
        unitNo: payload.data.address.unitNo || null,
        floorNo: payload.data.address.floorNo || null,
        streetName: payload.data.address.streetName || null,
        city: payload.data.address.city || null,
      },
      // phonecode2: payload.data.address.phoneCode2 || null,
      // phone2: payload.data.address.phoneNumber2 || null,
    };

    const response = await axios.post('/auth/billing-details', apiPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status < 200 || response.status >= 300 || !response.data.status) {
      throw new Error(response.data?.message || 'Failed to save billing details');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Saving billing details failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while saving billing details');
    }
  }
};



export const fetchComplaints = async (payload: FetchComplaintsPayload): Promise<Complaint[]> => {
  try {
    if (!payload.userId || !payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    const response = await axios.get(`/auth/complaints/user/${payload.userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<ApiComplaint[]> = response.data;

      if (resData.status && resData.data) {
        const mappedComplaints: Complaint[] = resData.data.map((item: ApiComplaint) => ({
          id: String(item.complainId),
          category: item.categoryName || 'Unknown Category',
          date: formatDate(item.createdAt),
          status: item.status || 'null',
          description: item.complain,
          images: item.images || [],
          isNew: !item.status || item.status === 'Opened',
          createdAt: new Date(item.createdAt),
          reply: item.reply || 'No reply available yet.',
          replyDate: item.replyDate || null,
          customerName: item.customerName || 'Unknown Customer',
        }));
        return mappedComplaints;
      } else if (!resData.status && resData.message === 'No complaints found for the given user ID.') {
        return []; // Return empty array when no complaints are found
      } else {
        throw new Error(resData.message || 'Invalid response format');
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch complaints');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Complaint fetch failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while fetching complaints');
    }
  }
};

export const submitComplaint = async (payload: ComplaintPayload): Promise<ComplaintResponse> => {
  try {
    if (!payload.userId || !payload.token) {
      throw new Error('You are not authenticated. Please log in first.');
    }

    if (!payload.complaintCategoryId || !payload.complaint) {
      throw new Error('Please select a category and enter a complaint.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const maxFileSize = 5 * 1024 * 1024;

    for (const image of payload.images) {
      if (!allowedMimeTypes.includes(image.type)) {
        throw new Error(`Unsupported file type for ${image.name}.`);
      }
      if (image.size > maxFileSize) {
        throw new Error(`File ${image.name} exceeds 5MB limit.`);
      }
    }

    const formData = new FormData();
    formData.append('complaintCategoryId', payload.complaintCategoryId.toString());
    formData.append('complaint', payload.complaint);
    payload.images.forEach((image) => formData.append('images', image));
    if (payload.imagesToDelete?.length) {
      formData.append('imagesToDelete', JSON.stringify(payload.imagesToDelete));
    }

    const url = payload.complaintId
      ? `/auth/update/${payload.userId}/${payload.complaintId}`
      : `/auth/submit/${payload.userId}`;

    const response = await axios({
      method: payload.complaintId ? 'PUT' : 'POST',
      url,
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
      data: formData,
    });

    if (response.status >= 200 && response.status < 300 && response.data?.status) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Complaint submission failed on server.');
    }
  } catch (error: any) {
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (!contentType?.includes('application/json')) {
        console.error('Non-JSON server response:', error.response.data);
        throw new Error('Unexpected server response. Expected JSON but received non-JSON.');
      }

      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Complaint submission failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred during complaint submission.');
    }
  }
};


// Fetch complaint categories from backend
export const fetchComplaintCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get('/auth/categories', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = response.data;
    if (data.status && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        id: item.id,
        categoryEnglish: item.categoryEnglish,
      }));
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// services/unsubscribeService.ts


export const unsubscribeUser = async (token: string, email: string): Promise<any> => {
  try {
    const response = await axios.post(
      '/auth/unsubscribe',
      {
        email,
        action: 'unsubscribe',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    if (data.status !== undefined) {
      return data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Unsubscribe request error:', error);
    return { status: false, message: 'Network error' };
  }
};

export const getCartInfo = async ( token: string | null): Promise<any> => {
  if (!token) {
    throw new Error('Authentication required');
  }
  try {
    const response = await axios.get(
      '/auth/cart-info',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
      console.log("cart responce",response);

    if (response.status >= 200 && response.status < 300) {
      console.log("cart responce",response);
      
      return response.data; 
    }
    throw new Error(response.data?.message || 'Failed to update package quantity');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to update package quantity'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to update package quantity');
    }
  }
};

// services/auth-service.ts

// Define the expected response type for the cities API

export const fetchCities = async (token: string | null): Promise<string[]> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.get('/auth/get-cities', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('cities response', response);

    if (response.status >= 200 && response.status < 300) {
      console.log('cities response', response);
      return response.data.data; // assuming response.data = { status: true, data: [...] }
    }

    throw new Error(response.data?.message || 'Failed to fetch cities');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to fetch cities'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to fetch cities');
    }
  }
};