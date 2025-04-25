import { configureStore } from '@reduxjs/toolkit'

// Import slices
// For now, we'll create an empty reducer since we don't know your specific state structure
const initialState = {
    homebrew: {
        items: [],
        currentItem: null,
        loading: false,
        error: null
    }
}

// Simple reducer until you implement your actual slices
function homebrewReducer(state = initialState.homebrew, action) {
    switch (action.type) {
        default:
            return state
    }
}

// Configure the Redux store
export const store = configureStore({
    reducer: {
        homebrew: homebrewReducer,
    },
    // Enable Redux DevTools
    devTools: process.env.NODE_ENV !== 'production',
})

// Debug to check store is properly configured
console.log('Redux store initialized:', store.getState())