import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    characters: [],
    customClasses: [],
    customSubclasses: [],
    customRaces: [],
    customBackgrounds: [],
    customFeats: [],
    activeCharacterId: null,
    activeCustomElementId: null,
    activeCustomElementType: null,
};

export const characterSlice = createSlice({
    name: 'character',
    initialState,
    reducers: {
        // Characters
        addCharacter: (state, action) => {
            state.characters.push(action.payload);
        },
        updateCharacter: (state, action) => {
            const index = state.characters.findIndex(
                (character) => character.id === action.payload.id
            );
            if (index !== -1) {
                state.characters[index] = action.payload;
            }
        },
        deleteCharacter: (state, action) => {
            state.characters = state.characters.filter(
                (character) => character.id !== action.payload
            );
        },
        setActiveCharacter: (state, action) => {
            state.activeCharacterId = action.payload;
        },

        // Custom Classes
        addCustomClass: (state, action) => {
            state.customClasses.push(action.payload);
        },
        updateCustomClass: (state, action) => {
            const index = state.customClasses.findIndex(
                (customClass) => customClass.id === action.payload.id
            );
            if (index !== -1) {
                state.customClasses[index] = action.payload;
            }
        },
        deleteCustomClass: (state, action) => {
            state.customClasses = state.customClasses.filter(
                (customClass) => customClass.id !== action.payload
            );
        },

        // Custom Subclasses
        addCustomSubclass: (state, action) => {
            state.customSubclasses.push(action.payload);
        },
        updateCustomSubclass: (state, action) => {
            const index = state.customSubclasses.findIndex(
                (subclass) => subclass.id === action.payload.id
            );
            if (index !== -1) {
                state.customSubclasses[index] = action.payload;
            }
        },
        deleteCustomSubclass: (state, action) => {
            state.customSubclasses = state.customSubclasses.filter(
                (subclass) => subclass.id !== action.payload
            );
        },

        // Custom Races
        addCustomRace: (state, action) => {
            state.customRaces.push(action.payload);
        },
        updateCustomRace: (state, action) => {
            const index = state.customRaces.findIndex(
                (race) => race.id === action.payload.id
            );
            if (index !== -1) {
                state.customRaces[index] = action.payload;
            }
        },
        deleteCustomRace: (state, action) => {
            state.customRaces = state.customRaces.filter(
                (race) => race.id !== action.payload
            );
        },

        // Custom Backgrounds
        addCustomBackground: (state, action) => {
            state.customBackgrounds.push(action.payload);
        },
        updateCustomBackground: (state, action) => {
            const index = state.customBackgrounds.findIndex(
                (background) => background.id === action.payload.id
            );
            if (index !== -1) {
                state.customBackgrounds[index] = action.payload;
            }
        },
        deleteCustomBackground: (state, action) => {
            state.customBackgrounds = state.customBackgrounds.filter(
                (background) => background.id !== action.payload
            );
        },

        // Custom Feats
        addCustomFeat: (state, action) => {
            state.customFeats.push(action.payload);
        },
        updateCustomFeat: (state, action) => {
            const index = state.customFeats.findIndex(
                (feat) => feat.id === action.payload.id
            );
            if (index !== -1) {
                state.customFeats[index] = action.payload;
            }
        },
        deleteCustomFeat: (state, action) => {
            state.customFeats = state.customFeats.filter(
                (feat) => feat.id !== action.payload
            );
        },

        // Active Custom Element
        setActiveCustomElement: (state, action) => {
            state.activeCustomElementId = action.payload.id;
            state.activeCustomElementType = action.payload.type;
        },

        // Import/Export
        importCharacterData: (state, action) => {
            const { characters, customClasses, customSubclasses, customRaces, customBackgrounds, customFeats } = action.payload;
            if (characters) state.characters = characters;
            if (customClasses) state.customClasses = customClasses;
            if (customSubclasses) state.customSubclasses = customSubclasses;
            if (customRaces) state.customRaces = customRaces;
            if (customBackgrounds) state.customBackgrounds = customBackgrounds;
            if (customFeats) state.customFeats = customFeats;
        }
    },
});

export const {
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setActiveCharacter,
    addCustomClass,
    updateCustomClass,
    deleteCustomClass,
    addCustomSubclass,
    updateCustomSubclass,
    deleteCustomSubclass,
    addCustomRace,
    updateCustomRace,
    deleteCustomRace,
    addCustomBackground,
    updateCustomBackground,
    deleteCustomBackground,
    addCustomFeat,
    updateCustomFeat,
    deleteCustomFeat,
    setActiveCustomElement,
    importCharacterData,
} = characterSlice.actions;

export default characterSlice.reducer;