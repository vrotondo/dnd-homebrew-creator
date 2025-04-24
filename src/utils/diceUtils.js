// src/utils/diceUtils.js
/**
 * Utility functions for dice rolling and calculations
 */

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Result of the die roll
 */
export const rollDie = (sides) => {
    return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {number[]} Array of individual die results
 */
export const rollDice = (count, sides) => {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(rollDie(sides));
    }
    return results;
};

/**
 * Roll dice and sum the results
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {object} Object containing sum and individual rolls
 */
export const rollDiceSum = (count, sides) => {
    const rolls = rollDice(count, sides);
    const sum = rolls.reduce((total, roll) => total + roll, 0);
    return { sum, rolls };
};

/**
 * Parse a dice notation string (e.g., "2d6+3")
 * @param {string} notation - Dice notation string
 * @returns {object} Parsed dice notation object
 */
export const parseDiceNotation = (notation) => {
    // Basic dice notation pattern: XdY+Z
    const pattern = /^(\d+)d(\d+)(?:([+-])(\d+))?$/i;
    const match = notation.trim().match(pattern);

    if (!match) {
        throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let modifier = 0;

    if (match[3] && match[4]) {
        modifier = parseInt(match[4], 10);
        if (match[3] === '-') {
            modifier = -modifier;
        }
    }

    return { count, sides, modifier };
};

/**
 * Roll dice based on standard dice notation
 * @param {string} notation - Dice notation (e.g., "2d6+3")
 * @returns {object} Roll result containing total and individual rolls
 */
export const rollDiceNotation = (notation) => {
    const { count, sides, modifier } = parseDiceNotation(notation);
    const { sum, rolls } = rollDiceSum(count, sides);
    const total = sum + modifier;

    return {
        total,
        rolls,
        modifier,
        notation
    };
};

/**
 * Calculate the average result of a dice roll
 * @param {string} notation - Dice notation (e.g., "2d6+3")
 * @returns {number} Average result
 */
export const calculateDiceAverage = (notation) => {
    const { count, sides, modifier } = parseDiceNotation(notation);
    // Average of a single die is (sides + 1) / 2
    const diceAverage = count * (sides + 1) / 2;
    return diceAverage + modifier;
};

/**
 * Generate ability scores using the standard 4d6 drop lowest method
 * @returns {number[]} Array of 6 ability scores
 */
export const generateAbilityScores = () => {
    const scores = [];

    for (let i = 0; i < 6; i++) {
        // Roll 4d6
        const rolls = rollDice(4, 6);
        // Find the lowest roll
        const minRoll = Math.min(...rolls);
        // Find the index of the lowest roll
        const minIndex = rolls.indexOf(minRoll);
        // Remove the lowest roll
        rolls.splice(minIndex, 1);
        // Sum the remaining 3 dice
        const sum = rolls.reduce((total, roll) => total + roll, 0);
        scores.push(sum);
    }

    return scores;
};

/**
 * Calculate ability modifier from ability score
 * @param {number} score - Ability score
 * @returns {number} Ability modifier
 */
export const calculateAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
};

/**
 * Format ability modifier as a string with + or - sign
 * @param {number} modifier - Ability modifier
 * @returns {string} Formatted modifier string
 */
export const formatAbilityModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};