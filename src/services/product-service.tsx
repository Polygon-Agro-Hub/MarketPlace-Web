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
    })

    console.log('pkg service',response.data)

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

export const packageAddToCart = async (formData: number, token: string | null): Promise<any> => {
  console.log("formData", formData);

  try {
    const response = await axios.post(`/product/package-add-to-cart`, { id: formData }, {
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

export const getCategoryCounts = async (): Promise<any> => {
  try {
    const response = await axios.get('/product/get-item-count', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch category counts');
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
      throw new Error(error.message || 'An error occurred while fetching category counts');
    }
  }
};

export const productAddToCart = async (productData: ProductCartData, token: string | null): Promise<any> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.post(
      `/product/product-add-to-cart`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to add product to cart');
  } catch (error: any) {
    if (error.response) {
      // Handle specific error cases
      if (error.response.status === 200 && error.response.data.status === false) {
        throw new Error('Product already in cart');
      }
      if (error.response.status === 401) {
        throw new Error('Please login to add items to cart');
      }
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to add product to cart'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to add product to cart');
    }
  }
};


export const getRetaildBanners = async (): Promise<any> => {
  try {
    const response = await axios.get('/product/slides', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch category counts');
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
      throw new Error(error.message || 'An error occurred while fetching category counts');
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

export interface ProductCartData {
  mpItemId: number;
  quantityType: 'kg' | 'g';
  quantity: number;
}


//whole sale api calls

export const getProductsByCategoryWholesale = async (category: string): Promise<ProductResponse> => {
  try {
    const response = await axios.get('/product/wholesale', {
      params: { category },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('products',response.data)

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

export const getCategoryCountsWholesale = async (): Promise<any> => {
  try {
    const response = await axios.get('/product/get-item-count/wholesale', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch category counts');
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
      throw new Error(error.message || 'An error occurred while fetching category counts');
    }
  }
};

export const getMarketplaceSuggestions = async (token: string): Promise<any> => {
  try {
    const response = await axios.get('/product/marketplace/suggestions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch marketplace suggestions');
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
      throw new Error(error.message || 'An error occurred while fetching marketplace suggestions');
    }
  }
};

export interface ExcludeItemsResponse {
  status: boolean;
  message: string;
  result?: any;
  error?: string;
}


export async function excludeItems(
  items: string[],
  authToken: string
): Promise<ExcludeItemsResponse> {
  try {
    const response = await axios.post(
      '/product/marketplace/exclude-items',
      { items },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to exclude items');
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
      throw new Error(error.message || 'An error occurred while excluding items');
    }
  }
}
export interface Item {
  displayName: string;
  image: string;
}

export async function getExcludedItems(authToken: string): Promise<{ status: boolean; items: Item[]; message?: string }> {
  try {
    const response = await axios.get('/product/marketplace/excluded-items', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch excluded items');
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
      throw new Error(error.message || 'An error occurred while fetching excluded items');
    }
  }
}

export async function deleteExcludedItems(items: string[], authToken: string) {
  try {
    const response = await axios.post(
      '/product/marketplace/delete-excluded',
      { items },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to delete excluded items');
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
      throw new Error(error.message || 'An error occurred while deleting excluded items');
    }
  }
}



export const updateUserStatus = async (token: string) => {
  try {
    const response = await axios.post(
      '/product/update-user-status',
      {  },// POST body is empty
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Update user status failed: ${error.response.status} ${error.response.statusText}`
      );
      console.error('Response body:', error.response.data);
      return {
        status: false,
        message:
          error.response.data?.message ||
          error.response.data?.error ||
          `Failed with status ${error.response.status}`,
      };
    } else if (error.request) {
      return { status: false, message: 'No response received from server' };
    } else {
      return { status: false, message: error.message || 'An error occurred' };
    }
  }
};
