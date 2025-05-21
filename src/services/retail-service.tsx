// services/retail-service.tsx
import axios from '@/lib/axios';

interface CheckoutFormData {
  fullName: string;
  title: string;
  phone1: string;
  phone2: string;
  buildingNumber: string;
  buildingName: string;
  buildingType: string;
  flatNumber: string;
  floorNumber: string;
  houseNumber: string;
  streetName: string;
  cityName: string;
  deliveryDate: string;
  phoneCode1: string;
  phoneCode2: string;
  scheduleType: string;
  centerId: number;
}

// export const getForm = async () => {
//     try {
//       // Hardcoded sample data
//       const data = {
//         name: 'sdfsd',
//         email: 'afsas@gmail.com',
//         deliveryMethod: 'pickup',
//         buildingType: 'apartment',
//       };
  
//       return data;
//     } catch (error: any) {
//       throw { message: 'Failed to return hardcoded form data.' };
//     }
//   };
  

// export const updateForm = async (formData: {
//   name: string;
//   email: string;
//   deliveryMethod: string;
//   buildingType: string;
// }) => {
//   try {
//     console.log(formData);
//     const response = await axios.put('/form', formData);
//     return response.data;
//   } catch (error: any) {
//     throw error.response?.data || { message: 'Something went wrong while updating the form.' };
//   }
// };


export const getForm = async (token: string | null) => {
  try {
    const response = await axios.get('/retail-order/fetch-check-out-data', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }); // Make sure this matches your backend route
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch form data.' };
  }
};


export const updateForm = async (formData: CheckoutFormData, token: string | null) => {
  try {
    console.log(formData);
    const response = await axios.put('/retail-order/post-check-out-data', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong while updating the form.' };
  }
};