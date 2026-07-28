export const CONFIG = {
    marqueeSpeed: 1.2,
    boxSize: 100,
    
    // Free-floating boxes A, B, C
    boxesData: [
        { label: 'diary', url: 'page-a.html', xOffset: -250, y: 350 },
        { label: 'physics', url: 'page-b.html', xOffset: 0, y: 400 },
        { label: 'git', url: 'https://github.com/yum-yum-thighs', xOffset: 250, y: 350 }
    ],

    // Extended Newton's Cradle spelling out "YUM-YUM-THIGHS" (No URLs!)
    cradle: {
        length: 180,       
        ballSize: 45,      // Slightly smaller ball size to fit all 13 items neatly across the screen
        items: [
            { label: 'Y' },
            { label: 'U' },
            { label: 'M' },
            { label: '-' },
            { label: 'Y' },
            { label: 'U' },
            { label: 'M' },
            { label: '-' },
            { label: 'T' },
            { label: 'H' },
            { label: 'I' },
            { label: 'G' },
            { label: 'H' },
            { label: 'S' }
        ]
    }
};
