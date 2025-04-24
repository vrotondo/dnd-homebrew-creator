// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import characterReducer from './characterSlice';
import worldReducer from './worldSlice';
import monsterReducer from './monsterSlice';
import itemReducer from './itemSlice';
import spellReducer from './spellSlice';
import adventureReducer from './adventureSlice';
import uiReducer from './uiSlice';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storageUtils';

// Load persisted state from localStorage
const loadState = () => {
    return {
        character: loadFromLocalStorage('character', {
            characters: [],
            customClasses: [],
            customSubclasses: [],
            customRaces: [],
            customBackgrounds: [],
            customFeats: [],
            activeCharacterId: null,
            activeCustomElementId: null,
            activeCustomElementType: null,
        }),
        world: loadFromLocalStorage('world', {
            worlds: [],
            regions: [],
            locations: [],
            factions: [],
            npcs: [],
            deities: [],
            activeWorldId: null,
            activeEntityId: null,
            activeEntityType: null,
        }),
        monster: loadFromLocalStorage('monster', { monsters: [] }),
        item: loadFromLocalStorage('item', { items: [] }),
        spell: loadFromLocalStorage('spell', { spells: [] }),
        adventure: loadFromLocalStorage('adventure', { adventures: [] }),
        ui: loadFromLocalStorage('ui', {
            darkMode: false,
            sidebarOpen: true,
            currentView: 'dashboard',
            notifications: [],
            loading: false,
            srdValidationActive: true,
        }),
    };
};

// Create the Redux store with preloaded state
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
    preloadedState: loadState(),
});

// Subscribe to store changes and persist to localStorage
store.subscribe(() => {
    const state = store.getState();

    // Save each slice separately to avoid localStorage size limits
    saveToLocalStorage('character', state.character);
    saveToLocalStorage('world', state.world);
    saveToLocalStorage('monster', state.monster);
    saveToLocalStorage('item', state.item);
    saveToLocalStorage('spell', state.spell);
    saveToLocalStorage('adventure', state.adventure);
    saveToLocalStorage('ui', state.ui);
});