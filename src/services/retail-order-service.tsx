import axios from '@/lib/axios';

export interface PaymentPayload {
    paymentMethod: 'card' | 'cash';
    cartId: string;
    items: any[];
    checkoutDetails: any;
}

export const getRetailCart = async (token: string | null, userId: number): Promise<any> => {
    try {
        const response = await axios.get(`/cart/cart/${userId}`, {
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



export const submitPayment = async (payload: PaymentPayload) => {
    try {
        const response = await axios.post('/cart/create-order', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || 'Failed to submit payment';
        throw new Error(message);
    }
};