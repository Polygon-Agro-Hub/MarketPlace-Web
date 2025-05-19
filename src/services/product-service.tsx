import axios from '@/lib/axios';

export const getAllProduct = async (): Promise<Package> => {
  try {
    const response = await axios.get('/product/all-product', {
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


export const getPackageDetails = async (packageId: number): Promise<any> => {
  try {
    const response = await axios.get(`/product/package-details/${packageId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch package details');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

export const packageAddToCart = async (formData: any, token: string | null): Promise<any> => {
  console.log("formData", formData);

  try {
    const response = await axios.post(`/product/package-add-to-cart`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("service", response);

      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to add package to cart');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

export const getProductsByCategory = async (category: string): Promise<ProductResponse> => {
  try {
    const response = await axios.get('/product/by-category', {
      params: { category },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch products by category');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Failed with status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error(error.message || 'An error occurred while fetching products by category');
    }
  }
};


interface Package {
  product(product: any): unknown;
  id: number
  displayName: string
  image: string
  subTotal: number
}

interface Product {
  id: number;
  displayName: string;
  normalPrice: number;
  discountedPrice: number;
  discount: number;
  promo: boolean;
  unitType: string;
  startValue: number;
  changeby: number;
  displayType: string;
  tags: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  image: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  category: string;
}

interface ProductResponse {
  status: boolean;
  message: string;
  products: Product[];
}