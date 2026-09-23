# Personal Portfolio Website

A modern, physics-based portfolio website featuring interactive navigation, art gallery, diary, and physics resources.

## 📁 Project Structure

```
website/
├── index.html              # Main landing page with physics simulation
├── style.css              # Global styles for main page
├── README.md              # This documentation file
├── .gitignore             # Git ignore rules
├── LINKS.md               # Quick guide for adding navigation links
├── compress_images.py     # Script to compress images for web
├── generate_myart.py      # Script to auto-generate art gallery
│
├── fonts/                 # Custom fonts
│   └── cmunrm.ttf        # Computer Modern font
│
├── js/                    # JavaScript modules
│   ├── config.js         # Configuration for links and settings
│   ├── main.js           # Entry point that initializes everything
│   ├── marquee.js        # Scrolling text animation
│   └── physics.js        # Matter.js physics simulation
│
├── diary/                 # Diary/blog section
│   ├── index.html        # Diary listing page
│   ├── 1.html           # Individual diary post
│   ├── 2.html           # Another diary post
│   └── 1_diary_template.txt # Template for new posts
│
├── art/                   # Art gallery section
│   ├── index.html        # Art gallery page with download buttons
│   ├── projects.json     # Project links configuration
│   ├── myart/            # Original high-resolution artwork
│   └── web/              # Compressed web versions (auto-generated)
│
└── physics/               # Physics resources section
    ├── index.html        # Physics resources page
    ├── links.json        # Physics links configuration
    └── rayway/          # Physics game project
        ├── index.html
        ├── style.css
        ├── js/           # Game logic
        └── levels/       # Game levels
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yum-yum-thighs/personal_website.git
   cd personal_website
   ```

2. **Open in browser:**
   Simply open `index.html` in your web browser, or use a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

### Deployment

**GitHub Pages (Recommended):**
1. Repository is already configured for GitHub Pages
2. Push changes to GitHub
3. Automatic deployment at: `https://yum-yum-thighs.github.io/personal_website/`

## 🎯 Features

### Main Page (`index.html`)
- **Physics-based navigation** using Matter.js
- **Interactive floating boxes** that act as navigation links
- **Newton's cradle** animation
- **Responsive design** for different screen sizes
- **Double-click navigation** to access different sections

### Navigation (`js/config.js`)
- **Easy link management** through configuration file
- **Validation helpers** for adding new links
- **Modular structure** for easy maintenance

### Art Gallery (`art/index.html`)
- **Compressed web images** for fast loading
- **High-resolution downloads** available
- **Lazy loading** for better performance
- **Responsive gallery layout**
- **Download buttons** for original quality

### Diary (`diary/`)
- **Clean blog layout** with consistent styling
- **Template system** for easy post creation
- **Responsive design**
- **Professional typography**

### Physics Resources (`physics/index.html`)
- **Categorized links** (other resources vs. personal projects)
- **JSON-based configuration** for easy link management
- **Clean, organized layout**

## 🔧 Configuration

### Adding Navigation Links

Edit `js/config.js`:

```javascript
links: [
    { label: 'diary', url: 'diary/index.html', xOffset: -375, y: 350 },
    { label: 'physics', url: 'physics/index.html', xOffset: -125, y: 400 },
    { label: 'art', url: 'art/index.html', xOffset: 125, y: 400 },
    { label: 'git', url: 'https://github.com/yum-yum-thighs', xOffset: 375, y: 350 }
]
```

**Parameters:**
- `label`: Text displayed on the navigation box
- `url`: Link destination (relative or absolute)
- `xOffset`: Horizontal position from center (negative = left, positive = right)
- `y`: Vertical position from top

### Adding Art Projects

Edit `art/projects.json`:

```json
[
  {
    "title": "Project Name",
    "url": "https://your-project-url.com"
  }
]
```

### Adding Physics Resources

Edit `physics/links.json`:

```json
{
  "other": [
    { "title": "Resource Name", "url": "https://resource-url.com" }
  ],
  "mine": [
    { "title": "Your Project", "url": "your-project/index.html" }
  ]
}
```

## 🖼️ Image Management

### Adding New Artwork

1. **Place images** in `art/myart/` folder
2. **Run compression script:**
   ```bash
   python compress_images.py
   ```
3. **Regenerate gallery:**
   ```bash
   python generate_myart.py
   ```

### Image Compression

The `compress_images.py` script:
- **Compresses images** to WebP format (75% quality)
- **Supports multiple tools:** cwebp, ImageMagick
- **Fallback to copy** if no compression tools available
- **Creates web-optimized versions** in `art/web/`

**Installing compression tools:**
```bash
# cwebp (recommended)
# On Ubuntu/Debian: sudo apt-get install webp
# On macOS: brew install webp
# On Windows: Download from https://developers.google.com/speed/webp/download

# ImageMagick (alternative)
# On Ubuntu/Debian: sudo apt-get install imagemagick
# On macOS: brew install imagemagick
# On Windows: Download from https://imagemagick.org/
```

## 📝 Adding Diary Posts

1. **Copy the template:** `diary/1_diary_template.txt`
2. **Fill in your content**
3. **Save as new HTML file** (e.g., `3.html`)
4. **Update diary index** to include the new post

## 🎨 Customization

### Colors

Edit `style.css` to change colors:
- **Background:** `#000000` (black)
- **Text:** `#ffffff` (white)
- **Accent 1:** `#00ffff` (cyan)
- **Accent 2:** `#ff00ff` (magenta)

### Physics Settings

Edit `js/config.js`:
```javascript
{
    marqueeSpeed: 1.2,      // Scrolling text speed
    boxSize: 100,          // Navigation box size
    cradle: {
        length: 180,       // Newton's cradle rope length
        ballSize: 45,      // Newton's cradle ball size
        items: [...]       // Cradle text content
    }
}
```

## 🛠️ Development

### File Organization

**Root Level:**
- `index.html` - Main entry point
- `style.css` - Global styles
- `compress_images.py` - Image compression
- `generate_myart.py` - Gallery generation

**JavaScript Modules:**
- `js/config.js` - Configuration
- `js/main.js` - Entry point
- `js/marquee.js` - Text animation
- `js/physics.js` - Physics simulation

**Content Sections:**
- `diary/` - Blog posts
- `art/` - Art gallery
- `physics/` - Physics resources

### Browser Compatibility

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile responsive** design
- **JavaScript required** for physics simulation

## 📊 Performance

### Optimization Features

- **Lazy loading** for images
- **Compressed WebP images** for web viewing
- **High-res downloads** available on demand
- **Minimal JavaScript** dependencies
- **Efficient CSS** with custom font

### Loading Strategy

1. **Main page** loads physics simulation
2. **Navigation boxes** appear with physics
3. **Images load progressively** as user scrolls
4. **High-res downloads** only when requested

## 🔒 Security

- **No sensitive data** in repository
- **Public portfolio** intended for sharing
- **No API keys or secrets** in code
- **Safe for GitHub Pages** hosting

## 📄 License

This is a personal portfolio website. Content and code are shared for educational purposes.

## 🤝 Contributing

This is a personal project, but feel free to:
- **Fork the repository** for your own portfolio
- **Use the code** as a template
- **Suggest improvements** via issues

## 📞 Contact

- **GitHub:** https://github.com/yum-yum-thighs
- **Portfolio:** https://yum-yum-thighs.github.io/personal_website/

## 🎯 Future Improvements

- [ ] Add more diary posts
- [ ] Complete Rayway physics game
- [ ] Add more art projects
- [ ] Implement image CDN for better performance
- [ ] Add dark/light theme toggle
- [ ] Improve mobile responsiveness

---

**Built with:** HTML, CSS, JavaScript, Matter.js  
**Hosted on:** GitHub Pages  
**Last updated:** September 2026
