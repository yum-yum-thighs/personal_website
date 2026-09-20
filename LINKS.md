# Adding Links to Your Portfolio

This portfolio uses a physics-based navigation system where floating boxes act as clickable links. Adding new links is simple and clean.

## Quick Start

1. Open `js/config.js`
2. Find the `links` array in the CONFIG object
3. Add your new link following the format below

## Link Format

```javascript
{
    label: 'Display Name',      // Text shown on the box
    url: 'your-url-here',       // Relative or absolute URL
    xOffset: -375,              // Horizontal position (negative = left, positive = right)
    y: 350                      // Vertical position from top
}
```

## Examples

### Adding a local page:
```javascript
{ label: 'projects', url: 'projects/index.html', xOffset: -500, y: 380 }
```

### Adding an external website:
```javascript
{ label: 'linkedin', url: 'https://linkedin.com/in/yourprofile', xOffset: 500, y: 380 }
```

### Adding a GitHub repository:
```javascript
{ label: 'github', url: 'https://github.com/yourusername', xOffset: 0, y: 450 }
```

## Positioning Tips

- **xOffset**: Horizontal offset from the center of the screen
  - Negative values move the box to the left
  - Positive values move the box to the right
  - 0 centers the box horizontally
  
- **y**: Vertical position from the top of the screen
  - Lower values = higher on screen
  - Higher values = lower on screen
  - Typical range: 300-500

## Current Links

The portfolio currently has these links configured:
- **diary** → diary/index.html
- **physics** → physics/index.html  
- **art** → art/index.html
- **git** → https://github.com/yum-yum-thighs

## Validation

The configuration includes automatic validation. If you add a link incorrectly, check the browser console for error messages.

## Helper Functions

The `config.js` file includes helper functions for programmatic link management:

- `validateLink(link)` - Check if a single link is valid
- `validateAllLinks()` - Validate all links in the configuration
- `addLink(newLink)` - Programmatically add a new link

## Newton's Cradle

The Newton's cradle at the top is decorative (spells "THESIN") and doesn't contain links. To modify it, edit the `cradle.items` array in `config.js`.
