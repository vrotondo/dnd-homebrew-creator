// src/utils/srdValidator.js
/**
 * Utility functions for validating content against the SRD (System Reference Document)
 */

// Sample protected terms that are not in the SRD
// In a production app, this would be a comprehensive list loaded from a separate data file
const PROTECTED_TERMS = {
    // Settings and worlds
    settings: [
        'Forgotten Realms', 'Eberron', 'Ravenloft', 'Dragonlance', 'Greyhawk',
        'Dark Sun', 'Planescape', 'Spelljammer', 'Mystara'
    ],

    // Locations
    locations: [
        'Waterdeep', 'Baldur\'s Gate', 'Neverwinter', 'Icewind Dale', 'Candlekeep',
        'Shadowfell', 'Feywild', 'Sharn', 'Sigil', 'Barovia', 'Menzoberranzan'
    ],

    // Characters
    characters: [
        'Drizzt', 'Elminster', 'Strahd', 'Mordenkainen', 'Tasha', 'Xanathar',
        'Volo', 'Minsc', 'Boo', 'Acererak', 'Laeral', 'Halaster'
    ],

    // Subclasses
    subclasses: [
        'Arcane Archer', 'Bladesinging', 'College of Glamour', 'College of Whispers',
        'War Magic', 'Hexblade', 'Cavalier', 'Samurai', 'Swashbuckler', 'Echo Knight',
        'Circle of Dreams', 'Circle of Spores', 'Oath of Glory', 'Oath of the Watchers',
        'Phantom Rogue', 'Rune Knight', 'Twilight Domain', 'Peace Domain', 'Aberrant Mind'
    ],

    // Organizations and factions
    factions: [
        'Harpers', 'Lords\' Alliance', 'Emerald Enclave', 'Zhentarim', 'Order of the Gauntlet',
        'Red Wizards', 'Bregan D\'aerthe', 'Houses of Eberron'
    ],

    // Specifically protected monsters
    monsters: [
        'Beholder', 'Mind Flayer', 'Illithid', 'Gith', 'Kender', 'Aarakocra',
        'Slaad', 'Yuan-ti', 'Death Knight', 'Displacer Beast', 'Giff', 'Githyanki',
        'Githzerai', 'Flumph', 'Modron', 'Tabaxi', 'Thri-kreen'
    ],

    // Specifically protected items
    items: [
        'Apparatus of Kwalish', 'Holy Avenger', 'Robe of the Archmagi', 'Vorpal Sword',
        'Bag of Holding', 'Cloak of Elvenkind', 'Deck of Many Things'
    ],

    // Specifically protected spells
    spells: [
        'Mordenkainen\'s Sword', 'Tasha\'s Hideous Laughter', 'Bigby\'s Hand',
        'Otiluke\'s Resilient Sphere', 'Leomund\'s Tiny Hut', 'Drawmij\'s Instant Summons'
    ]
};

/**
 * Check if a string contains protected terms
 * @param {string} text - The text to check
 * @param {string[]} termList - List of protected terms to check against
 * @returns {string|null} The first protected term found, or null if none
 */
const checkForProtectedTerms = (text, termList) => {
    if (!text) return null;
    const textLower = text.toLowerCase();

    for (const term of termList) {
        if (textLower.includes(term.toLowerCase())) {
            return term;
        }
    }

    return null;
};

/**
 * Validate content against SRD guidelines
 * @param {Object} content - The content to validate
 * @param {string} contentType - Type of content (e.g., 'character', 'monster', etc.)
 * @returns {Array} Array of issues found
 */
export const validateSrdCompliance = (content, contentType) => {
    const issues = [];

    // Check name for protected terms based on content type
    if (content.name) {
        // Check against all term categories
        for (const [category, terms] of Object.entries(PROTECTED_TERMS)) {
            const foundTerm = checkForProtectedTerms(content.name, terms);
            if (foundTerm) {
                issues.push({
                    severity: 'error',
                    message: `Name contains "${foundTerm}", which is protected content not in the SRD.`,
                    field: 'name'
                });
                break;
            }
        }
    }

    // Check description for protected terms
    if (content.description) {
        for (const [category, terms] of Object.entries(PROTECTED_TERMS)) {
            const foundTerm = checkForProtectedTerms(content.description, terms);
            if (foundTerm) {
                issues.push({
                    severity: 'error',
                    message: `Description contains "${foundTerm}", which is protected content not in the SRD.`,
                    field: 'description'
                });
                break;
            }
        }
    }

    // Content-specific checks
    switch (contentType) {
        case 'character':
            // Check for non-SRD classes
            if (content.class && checkForProtectedTerms(content.class, PROTECTED_TERMS.subclasses)) {
                issues.push({
                    severity: 'error',
                    message: `Character's class or subclass is not in the SRD.`,
                    field: 'class'
                });
            }

            // Check for non-SRD races
            if (content.race && checkForProtectedTerms(content.race, PROTECTED_TERMS.monsters)) {
                issues.push({
                    severity: 'error',
                    message: `Character's race is not in the SRD.`,
                    field: 'race'
                });
            }
            break;

        case 'world':
            // Check for protected settings
            if (content.genre && content.genre.toLowerCase() === 'forgotten realms') {
                issues.push({
                    severity: 'error',
                    message: `"Forgotten Realms" is a protected setting not in the SRD.`,
                    field: 'genre'
                });
            }

            // Check for protected locations
            if (content.regions) {
                for (const region of content.regions) {
                    const foundTerm = checkForProtectedTerms(region.name, PROTECTED_TERMS.locations);
                    if (foundTerm) {
                        issues.push({
                            severity: 'error',
                            message: `Region "${region.name}" contains protected content not in the SRD.`,
                            field: 'regions'
                        });
                        break;
                    }
                }
            }
            break;

        case 'spell':
            // Check if spell name matches a protected spell name
            if (content.name && checkForProtectedTerms(content.name, PROTECTED_TERMS.spells)) {
                issues.push({
                    severity: 'error',
                    message: `Spell name is a protected spell not in the SRD.`,
                    field: 'name'
                });
            }
            break;

        case 'item':
            // Check if item name matches a protected item name
            if (content.name && checkForProtectedTerms(content.name, PROTECTED_TERMS.items)) {
                issues.push({
                    severity: 'error',
                    message: `Item name is a protected magic item not in the SRD.`,
                    field: 'name'
                });
            }
            break;

        case 'monster':
            // Check if monster name/type is protected
            if (content.name && checkForProtectedTerms(content.name, PROTECTED_TERMS.monsters)) {
                issues.push({
                    severity: 'error',
                    message: `Monster name is a protected creature not in the SRD.`,
                    field: 'name'
                });
            }
            break;
    }

    // Add warnings for potentially problematic content
    if (content.description && content.description.includes('copyright')) {
        issues.push({
            severity: 'warning',
            message: 'Description contains the word "copyright", which might indicate copyrighted material.',
            field: 'description'
        });
    }

    return issues;
};

/**
 * Check if content is SRD compliant
 * @param {Object} content - The content to check
 * @param {string} contentType - Type of content
 * @returns {boolean} True if content is SRD compliant
 */
export const isSrdCompliant = (content, contentType) => {
    const issues = validateSrdCompliance(content, contentType);
    // If there are any error-level issues, the content is not compliant
    return !issues.some(issue => issue.severity === 'error');
};

/**
 * Suggest SRD-compliant alternatives for protected content
 * @param {string} term - The protected term
 * @returns {string[]} Array of suggested alternatives
 */
export const suggestAlternatives = (term) => {
    const alternatives = {
        'Forgotten Realms': ['Create your own world', 'Generic fantasy setting'],
        'Waterdeep': ['Great City', 'Metropolis', 'Capital City'],
        'Drizzt': ['Dark Elf Ranger', 'Outcast Hero'],
        'Mind Flayer': ['Brain Eater', 'Psychic Aberration', 'Tentacled Telepath'],
        'Beholder': ['Eye Tyrant', 'Orb of Eyes', 'Sphere of Doom'],
        'Mordenkainen\'s Sword': ['Arcane Blade', 'Conjured Weapon', 'Floating Sword']
    };

    // Default suggestions if no specific alternatives are defined
    if (!alternatives[term]) {
        if (PROTECTED_TERMS.settings.includes(term)) {
            return ['Create your own setting with similar themes'];
        }
        if (PROTECTED_TERMS.locations.includes(term)) {
            return ['Rename this location for your own setting'];
        }
        if (PROTECTED_TERMS.characters.includes(term)) {
            return ['Create an original character with similar traits'];
        }
        if (PROTECTED_TERMS.spells.includes(term)) {
            return ['Rename this spell and change its flavor slightly'];
        }
        if (PROTECTED_TERMS.items.includes(term)) {
            return ['Create a similar item with a unique name'];
        }
        return ['Create an original alternative', 'Rename this element'];
    }

    return alternatives[term];
};