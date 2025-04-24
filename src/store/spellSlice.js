// src/store/spellSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    spells: [],
    activeSpell: null
};

export const spellSlice = createSlice({
    name: 'spell',
    initialState,
    reducers: {
        addSpell: (state, action) => {
            state.spells.push(action.payload);
        },
        updateSpell: (state, action) => {
            const index = state.spells.findIndex(
                (spell) => spell.id === action.payload.id
            );
            if (index !== -1) {
                state.spells[index] = action.payload;
            }
        },
        deleteSpell: (state, action) => {
            state.spells = state.spells.filter(
                (spell) => spell.id !== action.payload
            );
        },
        setActiveSpell: (state, action) => {
            state.activeSpell = action.payload;
        },
        importSpells: (state, action) => {
            // For bulk import of spells (e.g., from backup)
            if (action.payload) {
                state.spells = action.payload;
            }
        }
    },
});

export const {
    addSpell,
    updateSpell,
    deleteSpell,
    setActiveSpell,
    importSpells
} = spellSlice.actions;

export default spellSlice.reducer;