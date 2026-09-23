# Portfolio Navigation Guide

This portfolio uses a physics-based navigation system with floating boxes that act as clickable links. This guide explains how to manage navigation links across your portfolio.

## 🎯 Main Navigation (Physics Boxes)

### Adding Main Navigation Links

Edit `js/config.js` to add links to the main page's floating navigation boxes:

```javascript
links: [
    { label: 'Diary', url: 'diary/index.html', xOffset: -375, y: 350 },
    { label: 'Physics', url: 'physics/index.html', xOffset: -125, y: 400 },
    { label: 'Art', url: 'art/index.html', xOffset: 125, y: 400 },
    { label: 'Git', url: 'https://github.com/yum-yum-thighs', xOffset: 375, y: 350 }
]
```

### Link Parameters

- **label**: Text displayed on the navigation box
- **url**: Link destination (relative for local pages, absolute for external sites)
- **xOffset**: Horizontal position from center (negative = left, positive = right)
- **y**: Vertical position from top of screen

### Positioning Guide

- **xOffset range**: -500 to 500 (recommended)
- **y range**: 300 to 500 (recommended)
- **0 xOffset**: Centers the box horizontally
- **Negative xOffset**: Moves box to the left
- **Positive xOffset**: Moves box to the right

## 🎨 Art Projects Links

### Adding Art Projects

Edit `art/projects.json` to add project links in the art gallery:

```json
[
  {
    "title": "How to make videos like GawxArt",
    "url": "https://youtu.be/gkteQH2DRK0?si=CorUCwCCn5hJjeoW"
  },
  {
    "title": "Your New Project",
    "url": "https://your-project-url.com"
  }
]
```

## ⚛️ Physics Resources Links

### Adding Physics Resources

Edit `physics/links.json` to add physics-related resources:

```json
{
  "other": [
    { 
      "title": "Ray Optics Simulation", 
      "url": "https://phydemo.app/ray-optics/simulator/" 
    }
  ],
  "mine": [
    { 
      "title": "Rayway", 
      "url": "rayway/index.html" 
    }
  ]
}
```

**Categories:**
- **other**: External physics resources and tools
- **mine**: Your personal physics projects

## 🔧 Configuration Helpers

The `js/config.js` file includes helper functions for link management:

- **`validateLink(link)`**: Validates a single link object
- **`validateAllLinks()`**: Validates all links in configuration
- **`addLink(newLink)`**: Programmatically adds a new link

## 🎮 Newton's Cradle

The Newton's cradle at the top of the main page is decorative (spells "THESIN") and doesn't contain navigation links. To modify the text, edit the `cradle.items` array in `js/config.js`:

```javascript
cradle: {
    length: 180,
    ballSize: 45,
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
```

## 📝 Current Navigation Structure

### Main Page Links
- **Diary** → diary/index.html
- **Physics** → physics/index.html  
- **Art** → art/index.html
- **Git** → https://github.com/yum-yum-thighs

### Art Projects
- **How to make videos like GawxArt** → YouTube tutorial

### Physics Resources
- **Other**: External simulations and resources
- **Mine**: Rayway (in progress)

## 🚀 Quick Examples

### Adding a Local Section
```javascript
{ label: 'Projects', url: 'projects/index.html', xOffset: 0, y: 450 }
```

### Adding an External Link
```javascript
{ label: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', xOffset: 500, y: 380 }
```

### Adding a GitHub Repository
```javascript
{ label: 'GitHub', url: 'https://github.com/yourusername/repo', xOffset: -500, y: 380 }
```

## ⚠️ Important Notes

- **External links** automatically open in new tabs with security attributes
- **Validation** occurs on startup - check browser console for errors
- **Responsive design** adjusts box positions on smaller screens
- **Double-click** navigation boxes to access links

## 🛠️ Troubleshooting

**Links not working?**
- Check browser console for validation errors
- Verify URL format (relative vs absolute)
- Ensure file paths are correct

**Boxes not visible?**
- Check xOffset/y positioning
- Verify box size in config
- Check screen size responsiveness

---

For more detailed information, see the main README.md file.
