import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  searchTerm: string;
  isSearchActive: boolean;
  hasPackageResults: boolean;
  hasCategoryResults: boolean;
}

const initialState: SearchState = {
  searchTerm: '',
  isSearchActive: false,
  hasPackageResults: true,
  hasCategoryResults: true,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      const newSearchTerm = action.payload;
      const wasSearching = state.isSearchActive;
      const isNewSearch = newSearchTerm.trim().length > 0;
      
      // If we were already searching and this is a new search, reset first
      if (wasSearching && isNewSearch && newSearchTerm !== state.searchTerm) {
        // Reset to initial state first
        state.isSearchActive = false;
        state.hasPackageResults = true;
        state.hasCategoryResults = true;
      }
      
      // Set the new search term
      state.searchTerm = newSearchTerm;
      state.isSearchActive = isNewSearch;
    },
    
    // Alternative action for explicit reset and search
    resetAndSearch: (state, action: PayloadAction<string>) => {
      // First reset to initial state
      state.isSearchActive = false;
      state.hasPackageResults = true;
      state.hasCategoryResults = true;
      
      // Then set new search term
      state.searchTerm = action.payload;
      state.isSearchActive = action.payload.trim().length > 0;
    },
    
    setPackageResults: (state, action: PayloadAction<boolean>) => {
      state.hasPackageResults = action.payload;
    },
    setCategoryResults: (state, action: PayloadAction<boolean>) => {
      state.hasCategoryResults = action.payload;
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.isSearchActive = false;
      state.hasPackageResults = true;
      state.hasCategoryResults = true;
    },
  },
});

export const { 
  setSearchTerm, 
  resetAndSearch, 
  setPackageResults, 
  setCategoryResults, 
  clearSearch 
} = searchSlice.actions;

export default searchSlice.reducer;