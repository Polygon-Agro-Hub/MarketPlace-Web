import axios from "@/lib/axios";

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
  cart: any;
  tokenExpiration: any;
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
  buyerType: "Retail" | "Wholesale";
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
  replyTime?: string | null;
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
  companyPhoneCode: string; // Add this
  companyPhone: string; // Add this
  image?: string;
  profileImageURL?: string;
}

// Updated ApiProfile interface
interface ApiProfile {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  phoneCode2: string;
  phoneNumber2: string;
  companyPhoneCode: string; // Add this
  companyPhone: string; // Add this
  image?: string;
  profileImageURL?: string;
  companyName?: string;
  buyerType?: string | "";
}

export interface CityOption {
  id: number;
  city: string;
  district?: string;
  province?: string;
  isAvailable: boolean; // 1/0 → boolean
}

export interface BillingAddress {
  id?: number;
  saveAs?: string;
  houseNo?: string;
  buildingNo?: string;
  buildingName?: string;
  unitNo?: string;
  floorNo?: string | null;
  streetName?: string;
  city?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneCode?: string;
  phoneNumber?: string;
  phoneCode2?: string;
  phoneNumber2?: string;
  geoLatitude?: number; // Add this
  geoLongitude?: number;
}

export interface BillingDetails {
  id?: number;
  billingName: string | undefined;
  billingTitle: string; // Required
  title: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  buildingType: string;
  address: BillingAddress;
  phoneCode2?: string | null;
  phoneNumber2?: string | null;
  geoLatitude?: number; // Add this
  geoLongitude?: number;
}

export interface AddressDetail {
  id?: number;
  saveAs?: string;
  houseNo?: string;
  buildingNo?: string;
  buildingName?: string;
  unitNo?: string;
  floorNo?: string | number | null;
  streetName?: string;
  city?: string;
}

export interface UserAddressEntry {
  id: number;
  buildingType: string; // "House" | "Apartment"
  billingTitle: string;
  billingName: string;
  phoneCode: string;
  phoneNumber: string;
  phoneCode2?: string;
  phoneNumber2?: string;
  geoLatitude?: number;
  geoLongitude?: number;
  address: AddressDetail;
}

export interface BillingUserData {
  id: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  addresses: UserAddressEntry[];
  isDelivered?: boolean;
  nearesCity?: string;
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
    phoneCode2?: string;
    phoneNumber2?: string;
    companyName?: string;
    companyPhoneCode?: string; // Add this
    companyPhone?: string; // Add this
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

export interface CityResult {
  id: number;
  city: string;
  district: string;
  province: string;
  isAvailable: boolean;
}

const emailOtpReferenceIds = new Set<string>();

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  try {
    const response = await axios.post("/auth/login", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Login failed");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Login failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(error.message || "An error occurred during login");
    }
  }
};

export const signup = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  try {
    if (payload.password !== payload.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(payload.password)) {
      throw new Error(
        "Password must contain at least 6 characters with 1 uppercase letter, 1 number, and 1 special character",
      );
    }

    if (!payload.agreeToTerms) {
      throw new Error("You must agree to the Terms & Conditions");
    }

    const response = await axios.post("/auth/signup", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resData = response.data;

    if (resData.status === true) {
      return resData;
    } else {
      throw new Error(resData.message || "Registration failed on server.");
    }
  } catch (error: any) {
    if (error.response) {
      const resData = error.response.data;
      throw new Error(
        resData?.message ||
        resData?.error ||
        `Registration failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred during registration.",
      );
    }
  }
};

export const verifyUserDetails = async (
  email: string,
  phoneNumber: string,
  phoneCode: string,
) => {
  try {
    const response = await axios.post(
      "/auth/verify-user-details",
      {
        email,
        phoneNumber,
        phoneCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const resData = response.data;

    if (resData.status === true) {
      return resData;
    } else {
      throw new Error(resData.message || "User verification failed on server.");
    }
  } catch (error: any) {
    if (error.response) {
      const resData = error.response.data;
      throw new Error(
        resData?.message ||
        resData?.error ||
        `Verification failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred during verification.",
      );
    }
  }
};

export const sendResetEmail = async (
  email: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.error ||
        error.response.data?.message ||
        `Failed to send reset email (${error.response.status})`,
      );
    }
    throw new Error(error.message || "Failed to send reset email");
  }
};

// auth-service.ts
export const validateResetToken = async (
  token: string,
): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> => {
  try {
    const response = await axios.get(`/auth/validate-reset-token/${token}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Token validation failed (${error.response.status})`,
      );
    }
    throw new Error(error.message || "Failed to validate token");
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.put("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Password reset failed (${error.response.status})`,
      );
    }
    throw new Error(error.message || "Failed to reset password");
  }
};

type OTPServiceResponse = {
  referenceId?: string;
  error?: string;
};

async function postJson(path: string, body: unknown): Promise<any> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    referenceId?: string;
  };

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }

  return data;
}

export const sendOTP = async (
  phoneNumber: string,
  countryCode: string,
  options?: {
    checkPhoneExists?: boolean;
    message?: string;
    source?: string;
  },
): Promise<OTPServiceResponse> => {
  try {
    const formattedPhone = phoneNumber.replace(/\s+/g, "");
    const fullPhoneNumber = `${countryCode}${formattedPhone}`;

    // Default options
    const {
      checkPhoneExists = true,
      message = `Your OTP for verification is: {{code}}`,
      source = "PolygonAgro",
    } = options || {};

    // Step 1: Optionally check if phone number exists
    if (checkPhoneExists) {
      try {
        const checkResponse = await axios.post("/auth/check-phone", {
          phoneNumber: formattedPhone,
        });

        if (!checkResponse.data.exists) {
          return { error: "PHONE_NOT_FOUND" };
        }
      } catch (error) {
        console.error("Error checking phone:", error);
        throw new Error(
          "No account found with this number. Please check the number and try again",
        );
      }
    }

    // Step 2: Send OTP
    const apiUrl = "/api/shoutout/send";
    const body = {
      source,
      transport: "sms",
      content: {
        sms: message,
      },
      destination: fullPhoneNumber,
    };

    const response = await postJson(apiUrl, body);

    if (response.referenceId) {
      return { referenceId: response.referenceId };
    }

    throw new Error("Failed to send OTP: No reference ID received");
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Failed to send OTP (${error.response.status})`,
      );
    }
    throw new Error(error.message || "Failed to send OTP");
  }
};

export const sendOTPInSignup = async (
  phoneNumber: string,
  countryCode: string,
  options?: {
    message?: string;
    source?: string;
    email?: string;
  },
): Promise<OTPServiceResponse> => {
  console.log("🚀 sendOTPInSignup called");
  console.log("📞 phoneNumber:", phoneNumber);
  console.log("🌍 countryCode:", countryCode);
  console.log("⚙️ options:", options);
  console.log(
    "🔀 routing to:",
    countryCode !== "+94" ? "EMAIL (backend)" : "SMS (ShoutOut)",
  );

  // ── Non-+94: send OTP via backend email ───────────────────────────────────
  if (countryCode !== "+94") {
    console.log("📧 Entering EMAIL OTP path");
    const emailTarget = options?.email;
    console.log("📧 emailTarget:", emailTarget);

    if (!emailTarget) {
      console.error("❌ No email provided for international number");
      throw new Error(
        "Email address is required to send OTP for international numbers.",
      );
    }

    try {
      console.log("📤 Calling /auth/send-otp-email with:", {
        email: emailTarget,
        phoneNumber: phoneNumber.replace(/\s+/g, ""),
        phoneCode: countryCode,
      });

      const response = await axios.post("/auth/send-otp-email", {
        email: emailTarget,
        phoneNumber: phoneNumber.replace(/\s+/g, ""),
        phoneCode: countryCode,
      });

      console.log("✅ /auth/send-otp-email response:", response.data);
      const resData = response.data;

      if (resData.status && resData.referenceId) {
        console.log("✅ Email OTP sent. referenceId:", resData.referenceId);
        emailOtpReferenceIds.add(resData.referenceId);
        console.log("📝 emailOtpReferenceIds set:", [...emailOtpReferenceIds]);
        return { referenceId: resData.referenceId };
      }

      console.error("❌ send-otp-email returned bad response:", resData);
      throw new Error(resData.message || "Failed to send OTP email.");
    } catch (error: any) {
      console.error("❌ Email OTP error:", error);
      console.error("❌ Error response:", error.response?.data);
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
          `Failed to send OTP email (${error.response.status})`,
        );
      }
      throw new Error(error.message || "Failed to send OTP email");
    }
  }

  // ── +94 only: ShoutOut SMS ─────────────────────────────────────────────────
  console.log("📱 Entering SMS OTP path (ShoutOut)");
  try {
    const formattedPhone = phoneNumber.replace(/\s+/g, "");
    const fullPhoneNumber = `${countryCode}${formattedPhone}`;
    console.log("📱 fullPhoneNumber for ShoutOut:", fullPhoneNumber);

    const {
      message = `Your OTP for verification is: {{code}}`,
      source = "PolygonAgro",
    } = options || {};

    const apiUrl = "/api/shoutout/send";
    const body = {
      source,
      transport: "sms",
      content: { sms: message },
      destination: fullPhoneNumber,
    };

    console.log("📤 Calling ShoutOut with body:", body);
    const response = await postJson(apiUrl, body);
    console.log("✅ ShoutOut response:", response);

    if (response.referenceId) {
      console.log("✅ SMS OTP sent. referenceId:", response.referenceId);
      return { referenceId: response.referenceId };
    }
    throw new Error("Failed to send OTP: No reference ID received");
  } catch (error: any) {
    console.error("❌ ShoutOut SMS error:", error);
    console.error("❌ ShoutOut error response:", error.response?.data);
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Failed to send OTP (${error.response.status})`,
      );
    }
    throw new Error(error.message || "Failed to send SMS OTP");
  }
};

export const verifyOTP = async (code: string, referenceId: string) => {
  console.log("🔍 verifyOTP called");
  console.log("🔑 code:", code);
  console.log("🆔 referenceId:", referenceId);
  console.log("📝 emailOtpReferenceIds set:", [...emailOtpReferenceIds]);

  // ── Email OTP path (in-memory Set) ────────────────────────────────────────
  if (emailOtpReferenceIds.has(referenceId)) {
    console.log("🔀 routing to: EMAIL verify (from Set)");
    try {
      const response = await axios.post("/auth/verify-otp-email", {
        code,
        referenceId,
      });
      console.log("✅ verify-otp-email response:", response.data);
      emailOtpReferenceIds.delete(referenceId);
      return response.data;
    } catch (error: any) {
      console.error("❌ Email OTP verification error:", error);
      throw error;
    }
  }

  // ── Set was lost (hot reload etc.) — try email verify first ───────────────
  // If backend finds the referenceId it returns 1000/1001/1002
  // If not found at all it returns 1001 with "Invalid OTP" — then we try ShoutOut
  console.log("🔍 Set miss — trying email verify first as fallback...");
  try {
    const emailResponse = await axios.post("/auth/verify-otp-email", {
      code,
      referenceId,
    });
    console.log("🔍 verify-otp-email fallback response:", emailResponse.data);

    // If backend recognised the referenceId (found it in DB), use its response
    // statusCode 1002 = expired, 1000 = success — both mean it was an email OTP
    // statusCode 1001 could mean wrong code OR not found — check message
    if (
      emailResponse.data.statusCode === "1000" ||
      emailResponse.data.statusCode === "1002" ||
      emailResponse.data.message !== "Invalid OTP."
    ) {
      console.log("🔀 confirmed EMAIL OTP — returning backend response");
      return emailResponse.data;
    }

    // statusCode 1001 + message "Invalid OTP." = referenceId not in DB = SMS OTP
    console.log("🔀 not an email OTP — falling through to ShoutOut");
  } catch (error) {
    console.warn("⚠️ email verify fallback failed, trying ShoutOut:", error);
  }

  // ── ShoutOut SMS path ─────────────────────────────────────────────────────
  console.log("🔀 routing to: SMS verify (ShoutOut)");
  try {
    const url = "/api/shoutout/verify";
    const body = { code, referenceId };
    console.log("📤 Calling ShoutOut verify with:", body);

    const response = await postJson(url, body);
    console.log("✅ ShoutOut verify response:", response);
    return response;
  } catch (error) {
    console.error("❌ ShoutOut verify error:", error);
    throw error;
  }
};

export const resetPasswordByPhone = async (
  phoneNumber: string,
  newPassword: string,
) => {
  try {
    const response = await axios.post("/auth/reset-password-by-phone", {
      phoneNumber,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error resetting password:", error);
    throw new Error(
      error.response?.data?.message || "Failed to reset password",
    );
  }
};

// Map category ID to category name
const categoryMap: { [key: number]: string } = {
  1: "Product Issues",
  2: "Delivery Issues",
  3: "Payment Issues",
  4: "Customer Service",
};

// Function to format date to "Month Day, Year"
const formatDate = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const fetchProfile = async (
  payload: FetchProfilePayload,
): Promise<Profile> => {
  try {
    const response = await axios.get("/auth/profile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<ApiProfile> = response.data;

      if (resData.status && resData.data) {
        return {
          firstName: resData.data.firstName || "",
          lastName: resData.data.lastName || "",
          email: resData.data.email || "",
          phoneCode: resData.data.phoneCode || "+94",
          phoneNumber: resData.data.phoneNumber || "",
          phoneCode2: resData.data.phoneCode2 || "+94",
          phoneNumber2: resData.data.phoneNumber2 || "",
          companyPhoneCode: resData.data.companyPhoneCode || "+94", // Add this
          companyPhone: resData.data.companyPhone || "", // Add this
          image: resData.data.image,
          profileImageURL: resData.data.profileImageURL,
          title: resData.data.title || "",
          companyName: resData.data.companyName || "",
          buyerType: resData.data.buyerType || "",
        };
      } else {
        throw new Error(resData.message || "Invalid response format");
      }
    } else {
      throw new Error(response.data?.message || "Failed to fetch profile");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Profile fetch failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while fetching profile",
      );
    }
  }
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<void> => {
  try {
    if (!payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const formData = new FormData();

    // Required fields
    formData.append("title", payload.data.title);
    formData.append("firstName", payload.data.firstName);
    formData.append("lastName", payload.data.lastName);
    formData.append("email", payload.data.email);
    formData.append("phoneCode", payload.data.phoneCode);
    formData.append("phoneNumber", payload.data.phoneNumber);

    // Optional fields - only append if they exist
    if (payload.data.phoneCode2) {
      formData.append("phoneCode2", payload.data.phoneCode2);
    }

    if (payload.data.phoneNumber2) {
      formData.append("phoneNumber2", payload.data.phoneNumber2);
    }

    if (payload.data.companyName) {
      formData.append("companyName", payload.data.companyName);
    }

    // Add company phone fields
    if (payload.data.companyPhoneCode) {
      formData.append("companyPhoneCode", payload.data.companyPhoneCode);
    }

    if (payload.data.companyPhone) {
      formData.append("companyPhone", payload.data.companyPhone);
    }

    // Profile picture - only append if provided
    if (payload.profilePic) {
      formData.append("profilePicture", payload.profilePic);
    }

    const response = await axios.put("/auth/edit-profile", formData, {
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (
      response.status < 200 ||
      response.status >= 300 ||
      !response.data.status
    ) {
      throw new Error(response.data?.message || "Failed to update profile");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Profile update failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while updating profile",
      );
    }
  }
};

export const updatePassword = async (
  payload: UpdatePasswordPayload,
): Promise<{ message: string }> => {
  try {
    if (!payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const response = await axios.put(
      "/auth/update-password",
      {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        confirmNewPassword: payload.confirmPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
        },
      },
    );

    if (response.status >= 200 && response.status < 300) {
      return {
        message: response.data?.message || "Password updated successfully!",
      };
    } else {
      throw new Error(response.data?.message || "Failed to update password");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Password update failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while updating password",
      );
    }
  }
};

export const fetchBillingDetails = async (
  payload: FetchBillingDetailsPayload,
): Promise<BillingUserData | null> => {
  try {
    if (!payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const response = await axios.get("/auth/billing-details", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<any> = response.data;

      if (resData.status && resData.data) {
        const apiData = resData.data;

        if (!apiData.id) return null;

        const addresses: UserAddressEntry[] = Array.isArray(apiData.addresses)
          ? apiData.addresses.map((entry: any) => ({
            id: entry.id,
            buildingType: entry.buildingType,
            billingTitle: entry.billingTitle || "",
            billingName: entry.billingName || "",
            phoneCode: entry.phoneCode || "+94",
            phoneNumber: entry.phoneNumber || "",
            phoneCode2: entry.phoneCode2 || "+94",
            phoneNumber2: entry.phoneNumber2 || "",
            geoLatitude: entry.geoLatitude
              ? Number(entry.geoLatitude)
              : undefined,
            geoLongitude: entry.geoLongitude
              ? Number(entry.geoLongitude)
              : undefined,
            address: {
              id: entry.address?.id,
              saveAs: entry.address?.saveAs || "",
              houseNo: entry.address?.houseNo || "",
              buildingNo: entry.address?.buildingNo || "",
              buildingName: entry.address?.buildingName || "",
              unitNo: entry.address?.unitNo || "",
              floorNo: entry.address?.floorNo ?? null,
              streetName: entry.address?.streetName || "",
              city: entry.address?.city || "",
            },
          }))
          : [];

        return {
          id: apiData.id,
          title: apiData.title || "",
          firstName: apiData.firstName || "",
          lastName: apiData.lastName || "",
          addresses,
          isDelivered: Boolean(apiData.isDelivered),
          nearesCity: apiData.nearesCity || "",
        };
      }

      return null;
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch billing details",
      );
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) return null;
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Billing details fetch failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while fetching billing details",
      );
    }
  }
};

export interface SaveAddressPayloadData {
  addressId?: number | null; // null/undefined = new address, number = editing existing
  billingTitle: string;
  billingName: string;
  phoneCode: string;
  phoneNumber: string;
  phoneCode2?: string;
  phoneNumber2?: string;
  buildingType: string;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  address: AddressDetail;
}

export const saveBillingDetails = async (payload: {
  token: string;
  data: SaveAddressPayloadData;
}): Promise<{ addressId: number; buildingType: string }> => {
  try {
    if (!payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const apiPayload = {
      billingTitle: payload.data.billingTitle,
      billingName: payload.data.billingName,
      phoneCode: payload.data.phoneCode,
      phoneNumber: payload.data.phoneNumber,
      phoneCode2: payload.data.phoneCode2 || "",
      phoneNumber2: payload.data.phoneNumber2 || "",
      buildingType: payload.data.buildingType.toLowerCase(),
      geoLatitude: payload.data.geoLatitude ?? null,
      geoLongitude: payload.data.geoLongitude ?? null,
      address: {
        id: payload.data.addressId || undefined,
        saveAs: payload.data.address.saveAs || null,
        houseNo: payload.data.address.houseNo || null,
        buildingNo: payload.data.address.buildingNo || null,
        buildingName: payload.data.address.buildingName || null,
        unitNo: payload.data.address.unitNo || null,
        floorNo: payload.data.address.floorNo || null,
        streetName: payload.data.address.streetName || null,
        city: payload.data.address.city || null,
      },
    };

    const response = await axios.post("/auth/billing-details", apiPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (
      response.status < 200 ||
      response.status >= 300 ||
      !response.data.status
    ) {
      throw new Error(
        response.data?.message || "Failed to save billing details",
      );
    }

    return {
      addressId: response.data.addressId,
      buildingType: response.data.buildingType,
    };
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Saving billing details failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while saving billing details",
      );
    }
  }
};

// ── Delete ─────────────────────────────────────────────────────────────
export const deleteBillingAddress = async (payload: {
  token: string;
  addressId: number;
  buildingType: string;
}): Promise<void> => {
  try {
    if (!payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const response = await axios.delete(
      `/auth/billing-details/${payload.addressId}/${payload.buildingType.toLowerCase()}`,
      {
        headers: { Authorization: `Bearer ${payload.token}` },
      },
    );

    if (
      response.status < 200 ||
      response.status >= 300 ||
      !response.data.status
    ) {
      throw new Error(response.data?.message || "Failed to delete address");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Deleting address failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while deleting the address",
      );
    }
  }
};

export const fetchComplaints = async (
  payload: FetchComplaintsPayload,
): Promise<Complaint[]> => {
  try {
    if (!payload.userId || !payload.token) {
      throw new Error("You are not authenticated. Please log in first.");
    }

    const response = await axios.get(
      `/auth/complaints/user/${payload.userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
        },
      },
    );

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<ApiComplaint[]> = response.data;

      if (resData.status && resData.data) {
        const mappedComplaints: Complaint[] = resData.data.map(
          (item: ApiComplaint) => ({
            id: String(item.complainId),
            category: item.categoryName || "Unknown Category",
            date: formatDate(item.createdAt),
            status: item.status || "null",
            description: item.complain,
            images: item.images || [],
            isNew: !item.status || item.status === "Opened",
            createdAt: new Date(item.createdAt),
            reply: item.reply || "No reply available yet.",
            replyDate: item.replyDate || null,
            replyTime: item.replyTime || null,
            customerName: item.customerName || "Unknown Customer",
          }),
        );
        return mappedComplaints;
      } else if (
        !resData.status &&
        resData.message === "No complaints found for the given user ID."
      ) {
        return []; // Return empty array when no complaints are found
      } else {
        throw new Error(resData.message || "Invalid response format");
      }
    } else {
      throw new Error(response.data?.message || "Failed to fetch complaints");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Complaint fetch failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while fetching complaints",
      );
    }
  }
};

const uploadSingleImage = async (
  image: File,
  token: string,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);

  const response = await axios.post("/upload/image", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000, // don't inherit a short global default for large uploads
  });

  if (!response.data?.url) {
    throw new Error(`Failed to upload image: ${image.name}`);
  }

  return response.data.url;
};

const rollbackImages = async (
  imageUrls: string[],
  token: string,
): Promise<void> => {
  if (!imageUrls.length) return;
  try {
    await axios.post(
      "/upload/rollback",
      { imageUrls },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("Rollback complete");
  } catch (err) {
    console.error("Rollback failed:", err);
  }
};

export const submitComplaint = async (
  payload: ComplaintPayload,
): Promise<ComplaintResponse> => {
  const uploadedUrls: string[] = [];

  try {
    if (!payload.userId || !payload.token) {
      throw new Error("You are not authenticated.");
    }
    if (!payload.complaintCategoryId || !payload.complaint) {
      throw new Error("Please select a category and enter a complaint.");
    }

    if (payload.images && payload.images.length > 0) {
      const urls = await Promise.all(
        payload.images.map((image) => uploadSingleImage(image, payload.token))
      );
      uploadedUrls.push(...urls);
    }

    const url = payload.complaintId
      ? `/auth/complaints/update/${payload.complaintId}`
      : `/auth/submit`;

    const response = await axios({
      method: payload.complaintId ? "PUT" : "POST",
      url,
      headers: {
        Authorization: `Bearer ${payload.token}`,
        "Content-Type": "application/json",
      },
      data: {
        complaintCategoryId: payload.complaintCategoryId,
        complaint: payload.complaint,
        imageUrls: uploadedUrls,
        imagesToDelete: payload.imagesToDelete || [],
      },
      timeout: 60000,
    });

    if (response.data?.status) {
      return response.data;
    }

    await rollbackImages(uploadedUrls, payload.token);
    throw new Error(response.data?.message || "Complaint submission failed.");
  } catch (error: any) {
    if (uploadedUrls.length > 0) {
      await rollbackImages(uploadedUrls, payload.token);
    }

    if (error.code === "ECONNABORTED") throw new Error("Request timeout.");
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        `Server error: ${error.response.status}`,
      );
    }
    throw new Error(error.message || "An error occurred.");
  }
};

// Fetch complaint categories from backend
export const fetchComplaintCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get("/auth/categories", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data;
    if (data.status && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        id: item.id,
        categoryEnglish: item.categoryEnglish,
      }));
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// services/unsubscribeService.ts

export const unsubscribeUser = async (
  token: string,
  email: string,
): Promise<any> => {
  try {
    const response = await axios.post(
      "/auth/unsubscribe",
      {
        email,
        action: "unsubscribe",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = response.data;
    if (data.status !== undefined) {
      return data;
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Unsubscribe request error:", error);
    return { status: false, message: "Network error" };
  }
};

export const getCartInfo = async (token: string | null): Promise<any> => {
  if (!token) {
    throw new Error("Authentication required");
  }
  try {
    const response = await axios.get("/auth/cart-info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(
      response.data?.message || "Failed to update package quantity",
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to update package quantity",
      );
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to update package quantity");
    }
  }
};

export const getAllCities = async (): Promise<CityResult[]> => {
  try {
    const response = await axios.get("/auth/cities", {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData = response.data;
      if (resData.status && Array.isArray(resData.data)) {
        return resData.data.map((city: any) => ({
          id: city.id,
          city: city.city,
          district: city.district || "",
          province: city.province || "",
          isAvailable: city.isAvailable === 1 || city.isAvailable === true,
        }));
      }
      return [];
    }

    throw new Error(response.data?.message || "Failed to fetch cities");
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Fetching cities failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(error.message || "Failed to fetch cities");
    }
  }
};

export const searchCities = async (query: string): Promise<CityResult[]> => {
  if (!query || query.trim().length === 0) return [];

  try {
    const response = await axios.get("/auth/search", {
      params: { q: query.trim() },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData = response.data;
      if (resData.status && Array.isArray(resData.data)) {
        return resData.data.map((city: any) => ({
          id: city.id,
          city: city.city,
          district: city.district || "",
          province: city.province || "",
          isAvailable: city.isAvailable === 1 || city.isAvailable === true,
        }));
      }
      return [];
    }

    throw new Error(response.data?.message || "Failed to search cities");
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `City search failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(error.message || "Failed to search cities");
    }
  }
};

export const checkCityAvailability = async (
  cityId: number,
): Promise<CityResult | null> => {
  try {
    const response = await axios.get(`/auth/${cityId}/availability`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData = response.data;
      if (resData.status && resData.data) {
        return {
          id: resData.data.id,
          city: resData.data.city,
          district: resData.data.district || "",
          province: resData.data.province || "",
          isAvailable: resData.data.isAvailable === true,
        };
      }
      return null;
    }

    throw new Error(
      response.data?.message || "Failed to check city availability",
    );
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) return null;
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `City availability check failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(error.message || "Failed to check city availability");
    }
  }
};

export const fetchCities = async (token: string): Promise<CityOption[]> => {
  try {
    const response = await axios.get("/auth/get-cities", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const resData: ApiResponse<any[]> = response.data;
    if (resData.status && Array.isArray(resData.data)) {
      return resData.data.map((c: any) => ({
        id: c.id,
        city: c.city,
        district: c.district,
        province: c.province,
        isAvailable: Number(c.isAvailable) === 1,
      }));
    }
    return [];
  } catch (error) {
    console.error("fetchCities error:", error);
    return [];
  }
};

export interface UpdateCreditBalancePayload {
  id: number;
  creditBalance: number;
}

export interface UpdateCreditBalanceResult {
  userId: number;
  creditBalance: number;
  affectedRows: number;
}

export const updateCreditBalance = async (
  token: string,
  payload: UpdateCreditBalancePayload,
): Promise<UpdateCreditBalanceResult> => {
  try {
    const response = await axios.put("/auth/update-credit-balance", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const resData: ApiResponse<UpdateCreditBalanceResult> = response.data;

      if (resData.status && resData.data) {
        return resData.data;
      }

      throw new Error(resData.message || "Failed to update credit balance");
    }

    throw new Error(
      response.data?.message || "Failed to update credit balance",
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Updating credit balance failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        "No response received from server. Please check your network connection.",
      );
    } else {
      throw new Error(
        error.message || "An error occurred while updating credit balance",
      );
    }
  }
};
