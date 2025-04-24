import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    darkMode: false,
    sidebarOpen: true,
    currentView: 'dashboard',
    notifications: [],
    loading: false,
    srdValidationActive: true,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setCurrentView: (state, action) => {
            state.currentView = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        toggleSrdValidation: (state) => {
            state.srdValidationActive = !state.srdValidationActive;
        },
    },
});

export const {
    toggleDarkMode,
    toggleSidebar,
    setCurrentView,
    addNotification,
    removeNotification,
    setLoading,
    toggleSrdValidation,
} = uiSlice.actions;

export default uiSlice.reducer;