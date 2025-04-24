// src/store/monsterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    monsters: [],
    activeMonster: null
};

export const monsterSlice = createSlice({
    name: 'monster',
    initialState,
    reducers: {
        addMonster: (state, action) => {
            state.monsters.push(action.payload);
        },
        updateMonster: (state, action) => {
            const index = state.monsters.findIndex(
                (monster) => monster.id === action.payload.id
            );
            if (index !== -1) {
                state.monsters[index] = action.payload;
            }
        },
        deleteMonster: (state, action) => {
            state.monsters = state.monsters.filter(
                (monster) => monster.id !== action.payload
            );
        },
        setActiveMonster: (state, action) => {
            state.activeMonster = action.payload;
        },
        importMonsters: (state, action) => {
            // For bulk import of monsters (e.g., from backup)
            if (action.payload) {
                state.monsters = action.payload;
            }
        }
    },
});

export const {
    addMonster,
    updateMonster,
    deleteMonster,
    setActiveMonster,
    importMonsters
} = monsterSlice.actions;

export default monsterSlice.reducer;