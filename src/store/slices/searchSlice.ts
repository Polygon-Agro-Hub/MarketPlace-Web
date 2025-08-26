import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  searchTerm: string;
  isSearchActive: boolean;
}

const initialState: SearchState = {
  searchTerm: '',
  isSearchActive: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.isSearchActive = action.payload.trim().length > 0;
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.isSearchActive = false;
    },
  },
});

export const { setSearchTerm, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;