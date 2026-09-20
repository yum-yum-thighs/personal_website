// ============================================================================
// CONFIGURATION - Easy to add and manage links
// ============================================================================

export const CONFIG = {
    // Animation speed for the scrolling marquee text
    marqueeSpeed: 1.2,
    
    // Size of the floating navigation boxes
    boxSize: 100,

    // ============================================================================
    // NAVIGATION LINKS - Add your links here
    // ============================================================================
    // Format: { label: 'Display Name', url: 'relative-or-absolute-url', xOffset: horizontalPosition, y: verticalPosition }
    // - label: Text shown on the box
    // - url: Can be relative (e.g., 'diary/index.html') or absolute (e.g., 'https://github.com/username')
    // - xOffset: Horizontal offset from center (negative = left, positive = right)
    // - y: Vertical position from top
    // ============================================================================
    links: [
        { label: 'diary', url: 'diary/index.html', xOffset: -375, y: 350 },
        { label: 'physics', url: 'physics/index.html', xOffset: -125, y: 400 },
        { label: 'art', url: 'art/index.html', xOffset: 125, y: 400 },
        { label: 'git', url: 'https://github.com/yum-yum-thighs', xOffset: 375, y: 350 }
    ],

    // ============================================================================
    // NEWTON'S CRADLE CONFIGURATION
    // ============================================================================
    cradle: {
        length: 180,           // Length of the rope/string
        ballSize: 45,          // Size of each ball
        items: [
            { label: 'T' },
            { label: 'A' },
            { label: 'H' },
            { label: 'E' },
            { label: 'S' },
            { label: 'I' },
            { label: 'N' }
        ]
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that a link object has all required fields
 * @param {Object} link - The link object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateLink(link) {
    return link && 
           typeof link.label === 'string' && 
           typeof link.url === 'string' && 
           typeof link.xOffset === 'number' && 
           typeof link.y === 'number';
}

/**
 * Validates all links in the configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateAllLinks() {
    const errors = [];
    
    CONFIG.links.forEach((link, index) => {
        if (!validateLink(link)) {
            errors.push(`Link at index ${index} is missing required fields (label, url, xOffset, y)`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Adds a new link to the configuration
 * @param {Object} newLink - The new link to add
 * @returns {boolean} - True if added successfully, false otherwise
 */
export function addLink(newLink) {
    if (!validateLink(newLink)) {
        console.error('Invalid link object:', newLink);
        return false;
    }
    
    CONFIG.links.push(newLink);
    return true;
}


