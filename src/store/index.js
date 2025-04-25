import { configureStore } from '@reduxjs/toolkit';
import characterReducer from './characterSlice';
import monsterReducer from './monsterSlice';
import spellReducer from './spellSlice';
import worldReducer from './worldSlice';
import uiReducer from './uiSlice';

const store = configureStore({
    reducer: {
        character: characterReducer,
        monster: monsterReducer,
        spell: spellReducer,
        world: worldReducer,
        ui: uiReducer,
    },
});

// Add this line to export the store as default
export default store;