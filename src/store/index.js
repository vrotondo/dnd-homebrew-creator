
import { configureStore } from '@reduxjs/toolkit';
import characterReducer from './characterSlice';
import worldReducer from './worldSlice';
import monsterReducer from './monsterSlice';
import itemReducer from './itemSlice';
import spellReducer from './spellSlice';
import adventureReducer from './adventureSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        character: characterReducer,
        world: worldReducer,
        monster: monsterReducer,
        item: itemReducer,
        spell: spellReducer,
        adventure: adventureReducer,
        ui: uiReducer,
    },
});