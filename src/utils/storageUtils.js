// src/utils/storageUtils.js
/**
 * Utility functions for working with localStorage
 */

/**
 * Save data to localStorage with the given key
 * @param {string} key - The localStorage key
 * @param {*} data - The data to save (will be JSON stringified)
 */
export const saveToLocalStorage = (key, data) => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
};

/**
 * Load data from localStorage with the given key
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value to return if key doesn't exist
 * @returns {*} The parsed data or defaultValue if not found
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return defaultValue;
        }
        return JSON.parse(serializedData);
    } catch (error) {
        console.error(`Error loading from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
};

/**
 * Calculate the total size of data in localStorage (in KB)
 * @returns {number} Size in KB
 */
export const calculateLocalStorageSize = () => {
    let totalSize = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += (localStorage[key].length * 2) / 1024; // Approximate size in KB
        }
    }
    return totalSize;
};

/**
 * Format storage size with appropriate units (KB or MB)
 * @param {number} sizeInKB - Size in KB
 * @returns {string} Formatted size string
 */
export const formatStorageSize = (sizeInKB) => {
    if (sizeInKB < 1024) {
        return `${Math.round(sizeInKB * 100) / 100} KB`;
    } else {
        return `${Math.round((sizeInKB / 1024) * 100) / 100} MB`;
    }
};