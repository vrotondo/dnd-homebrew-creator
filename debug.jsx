// src/debug.js
// Debugging utilities for DnD Homebrew Creator

/**
 * Enable React rendering debugging
 * For development use only
 */
export const debugReactRendering = () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('React rendering debugging enabled');
        // You can add additional debug logic here
    }
};

/**
 * Log component render times for performance analysis
 * @param {string} componentName - Name of the component to track
 */
export const logRenderTime = (componentName) => {
    if (process.env.NODE_ENV !== 'production') {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            console.log(`[Render Time] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
        };
    }

    return () => { };
};

/**
 * Utility to log Redux actions and state changes
 * @param {object} action - Redux action
 * @param {object} prevState - Previous Redux state
 * @param {object} nextState - Next Redux state
 */
export const logReduxChanges = (action, prevState, nextState) => {
    if (process.env.NODE_ENV !== 'production') {
        console.group(`Redux Action: ${action.type}`);
        console.log('Previous State:', prevState);
        console.log('Action:', action);
        console.log('Next State:', nextState);
        console.groupEnd();
    }
};

export default {
    debugReactRendering,
    logRenderTime,
    logReduxChanges
};