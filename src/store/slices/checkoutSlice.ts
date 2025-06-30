// formSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
    centerId: number | null;
    deliveryMethod: string;
    title: string;
    fullName: string;
    phone1: string;
    phone2: string;
    buildingType: string;
    deliveryDate: string;
    timeSlot: string;
    phoneCode1: string;
    phoneCode2: string;
    buildingNo: string;
    buildingName: string;
    flatNumber: string;
    floorNumber: string;
    houseNo: string;
    street: string;
    cityName: string;
    scheduleType: string;
}


const initialState: FormState = {
  deliveryMethod: 'Delivery',
  title: '',
  fullName: '',
  phone1: '',
  phone2: '',
  buildingType: 'Apartment',
  deliveryDate: '',
  timeSlot: '',
  phoneCode1: '94',
  phoneCode2: '94',
  buildingNo: '',
  buildingName: '',
  flatNumber: '',
  floorNumber: '',
  houseNo: '',
  street: '',
  cityName: '',
  scheduleType: 'One Time',
  centerId: null
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<FormState>) => {
      return { ...action.payload };
    },
    resetFormData: () => {
        return initialState;
      },
  },
});

export const { setFormData, resetFormData  } = checkoutSlice.actions;
export default checkoutSlice.reducer;