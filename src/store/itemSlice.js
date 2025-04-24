// src/store/itemSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    activeItem: null
};

export const itemSlice = createSlice({
    name: 'item',
    initialState,
    reducers: {
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        updateItem: (state, action) => {
            const index = state.items.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteItem: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },
        setActiveItem: (state, action) => {
            state.activeItem = action.payload;
        },
        importItems: (state, action) => {
            // For bulk import of items (e.g., from backup)
            if (action.payload) {
                state.items = action.payload;
            }
        }
    },
});

export const {
    addItem,
    updateItem,
    deleteItem,
    setActiveItem,
    importItems
} = itemSlice.actions;

export default itemSlice.reducer;