import axios from '@/lib/axios';

export const getRetailCart = async (token: string | null): Promise<any> => {
    try {
        const response = await axios.get(`/retail-order/get-retail-cart`, {
            headers: {
                Authorization: `Bearer ${token}`,
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