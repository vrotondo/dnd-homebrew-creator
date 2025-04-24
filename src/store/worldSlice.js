import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    worlds: [],
    regions: [],
    locations: [],
    factions: [],
    npcs: [],
    deities: [],
    activeWorldId: null,
    activeEntityId: null,
    activeEntityType: null,
};

export const worldSlice = createSlice({
    name: 'world',
    initialState,
    reducers: {
        // Worlds
        addWorld: (state, action) => {
            state.worlds.push(action.payload);
        },
        updateWorld: (state, action) => {
            const index = state.worlds.findIndex(
                (world) => world.id === action.payload.id
            );
            if (index !== -1) {
                state.worlds[index] = action.payload;
            }
        },
        deleteWorld: (state, action) => {
            state.worlds = state.worlds.filter(
                (world) => world.id !== action.payload
            );
        },
        setActiveWorld: (state, action) => {
            state.activeWorldId = action.payload;
        },

        // Regions
        addRegion: (state, action) => {
            state.regions.push(action.payload);
        },
        updateRegion: (state, action) => {
            const index = state.regions.findIndex(
                (region) => region.id === action.payload.id
            );
            if (index !== -1) {
                state.regions[index] = action.payload;
            }
        },
        deleteRegion: (state, action) => {
            state.regions = state.regions.filter(
                (region) => region.id !== action.payload
            );
        },

        // Locations
        addLocation: (state, action) => {
            state.locations.push(action.payload);
        },
        updateLocation: (state, action) => {
            const index = state.locations.findIndex(
                (location) => location.id === action.payload.id
            );
            if (index !== -1) {
                state.locations[index] = action.payload;
            }
        },
        deleteLocation: (state, action) => {
            state.locations = state.locations.filter(
                (location) => location.id !== action.payload
            );
        },

        // Factions
        addFaction: (state, action) => {
            state.factions.push(action.payload);
        },
        updateFaction: (state, action) => {
            const index = state.factions.findIndex(
                (faction) => faction.id === action.payload.id
            );
            if (index !== -1) {
                state.factions[index] = action.payload;
            }
        },
        deleteFaction: (state, action) => {
            state.factions = state.factions.filter(
                (faction) => faction.id !== action.payload
            );
        },

        // NPCs
        addNpc: (state, action) => {
            state.npcs.push(action.payload);
        },
        updateNpc: (state, action) => {
            const index = state.npcs.findIndex(
                (npc) => npc.id === action.payload.id
            );
            if (index !== -1) {
                state.npcs[index] = action.payload;
            }
        },
        deleteNpc: (state, action) => {
            state.npcs = state.npcs.filter(
                (npc) => npc.id !== action.payload
            );
        },

        // Deities
        addDeity: (state, action) => {
            state.deities.push(action.payload);
        },
        updateDeity: (state, action) => {
            const index = state.deities.findIndex(
                (deity) => deity.id === action.payload.id
            );
            if (index !== -1) {
                state.deities[index] = action.payload;
            }
        },
        deleteDeity: (state, action) => {
            state.deities = state.deities.filter(
                (deity) => deity.id !== action.payload
            );
        },

        // Active Entity
        setActiveEntity: (state, action) => {
            state.activeEntityId = action.payload.id;
            state.activeEntityType = action.payload.type;
        },

        // Import/Export
        importWorldData: (state, action) => {
            const { worlds, regions, locations, factions, npcs, deities } = action.payload;
            if (worlds) state.worlds = worlds;
            if (regions) state.regions = regions;
            if (locations) state.locations = locations;
            if (factions) state.factions = factions;
            if (npcs) state.npcs = npcs;
            if (deities) state.deities = deities;
        }
    },
});

export const {
    addWorld,
    updateWorld,
    deleteWorld,
    setActiveWorld,
    addRegion,
    updateRegion,
    deleteRegion,
    addLocation,
    updateLocation,
    deleteLocation,
    addFaction,
    updateFaction,
    deleteFaction,
    addNpc,
    updateNpc,
    deleteNpc,
    addDeity,
    updateDeity,
    deleteDeity,
    setActiveEntity,
    importWorldData,
} = worldSlice.actions;

export default worldSlice.reducer;