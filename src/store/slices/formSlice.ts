// formSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
  name: string;
  email: string;
  deliveryMethod: string;
  buildingType: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  deliveryMethod: '',
  buildingType: '',
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<FormState>) => {
      return { ...action.payload };
    },
  },
});

export const { setFormData } = formSlice.actions;
export default formSlice.reducer;
