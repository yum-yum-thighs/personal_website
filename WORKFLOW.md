# Portfolio Content Management Workflow

This guide covers the complete workflow for managing your portfolio content: diary posts, artwork uploads, and website linking.

## 📝 Adding Diary Posts

### Step 1: Create New Diary Post

**Option A: Using the Template (Recommended)**
1. Copy `diary/1_diary_template.txt`
2. Rename it to the next number (e.g., `3_diary_template.txt`)
3. Open the file and replace the placeholders:
   ```html
   POST TITLE → Your post title
   POST NUMBER → 3
   DD.MM.YYYY → Today's date (e.g., 28.09.2026)
   ```
4. Write your content in the content section
5. Save as `3.html` (remove `_template.txt` extension)

**Option B: Manual Creation**
1. Copy an existing diary post (e.g., `1.html`)
2. Update the content
3. Save as new file with next number

### Step 2: Update Diary Index

Edit `diary/index.html` to add your new post:

```html
<div class="post">
    <div class="number">3</div>
    <div class="date">28.09.2026</div>
    <a class="title" href="3.html">Your Post Title</a>
</div>
```

### Step 3: Style Your Content

**Available formatting in diary posts:**
- **Paragraphs:** `<p>Your text here</p>`
- **Headings:** `<h2>Section Title</h2>`
- **Links:** `<a href="url">Link text</a>`
- **Images:** `<img src="../path/to/image.jpg" alt="description">`

### Step 4: Commit and Deploy

```bash
git add diary/
git commit -m "Add new diary post: [title]"
git push
```

## 🎨 Uploading Artwork

### Step 1: Prepare Your Artwork

**File requirements:**
- **Format:** PNG, JPG, JPEG, BMP, GIF
- **Size:** Any size (will be compressed automatically)
- **Naming:** Descriptive names (e.g., `Sunset.png`, `Portrait.jpg`)

### Step 2: Add to Art Folder

1. Place your artwork in `art/myart/` folder
2. Make sure file names don't have spaces or special characters

### Step 3: Compress for Web

**Run the compression script:**
```bash
python compress_images.py
```

**What this does:**
- Converts images to WebP format (75% quality)
- Creates compressed versions in `art/web/`
- Keeps original high-res files in `art/myart/`
- Typically reduces file size by 50-70%

### Step 4: Update Gallery

**Option A: Manual Update**
Edit `art/index.html` and add your new image to the `files` array:

```javascript
{
    "name": "YourImage.png",
    "type": "image",
    "web": "web/YourImage.webp",
    "highRes": "myart/YourImage.png"
}
```

**Option B: Automatic Update**
```bash
python generate_myart.py
```

This automatically scans `art/myart/` and updates the gallery.

### Step 5: Test Locally

1. Open `art/index.html` in your browser
2. Verify your new image appears
3. Test the download button works
4. Check image quality and loading speed

### Step 6: Deploy

```bash
git add art/
git commit -m "Add new artwork: [image name]"
git push
```

## 🔗 Linking Websites

### Main Navigation Links

**Edit `js/config.js` to add main navigation boxes:**

```javascript
links: [
    { label: 'Diary', url: 'diary/index.html', xOffset: -375, y: 350 },
    { label: 'Physics', url: 'physics/index.html', xOffset: -125, y: 400 },
    { label: 'Art', url: 'art/index.html', xOffset: 125, y: 400 },
    { label: 'Git', url: 'https://github.com/yum-yum-thighs', xOffset: 375, y: 350 },
    // Add your new link here:
    { label: 'Projects', url: 'projects/index.html', xOffset: 0, y: 450 }
]
```

**Positioning guide:**
- `xOffset`: -500 (far left) to 500 (far right), 0 (center)
- `y`: 300 (top) to 500 (bottom)

### Art Project Links

**Edit `art/projects.json` to add project links:**

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

### Physics Resource Links

**Edit `physics/links.json` to add physics resources:**

```json
{
  "other": [
    { 
      "title": "New Resource", 
      "url": "https://resource-url.com" 
    }
  ],
  "mine": [
    { 
      "title": "Your Physics Project", 
      "url": "your-project/index.html" 
    }
  ]
}
```

## 🚀 Complete Workflow Example

### Adding a New Diary Post with Artwork

**Scenario:** You want to write about a new artwork you created.

**Step 1: Add the artwork**
```bash
# Place artwork in art/myart/
python compress_images.py
python generate_myart.py
```

**Step 2: Create diary post**
```bash
# Copy template and create new post
# Write about your artwork
```

**Step 3: Update diary index**
```html
<div class="post">
    <div class="number">3</div>
    <div class="date">28.09.2026</div>
    <a class="title" href="3.html">New Artwork Created</a>
</div>
```

**Step 4: Deploy everything**
```bash
git add diary/ art/
git commit -m "Add diary post about new artwork"
git push
```

## 🛠️ Tools and Scripts

### compress_images.py
**Purpose:** Compress images for web viewing
**Usage:** `python compress_images.py`
**Requirements:** cwebp (installed on your system)

### generate_myart.py
**Purpose:** Auto-generate art gallery from files
**Usage:** `python generate_myart.py`
**Requirements:** None

### Manual Gallery Updates
**When to use:** When you want custom control over gallery
**How:** Edit `art/index.html` files array directly

## 📋 Content Checklist

### Before Publishing Diary Posts
- [ ] Post title is descriptive
- [ ] Date is correct (DD.MM.YYYY format)
- [ ] Content is spell-checked
- [ ] Links work correctly
- [ ] Images (if any) are properly sized

### Before Publishing Artwork
- [ ] Image is in `art/myart/` folder
- [ ] Image has descriptive name
- [ ] Compression script has been run
- [ ] Gallery has been updated
- [ ] Download button works
- [ ] Image loads correctly in browser

### Before Adding Links
- [ ] URL is correct and accessible
- [ ] Link description is clear
- [ ] External links open in new tab (automatic)
- [ ] Positioning looks good on main page

## 🎯 Best Practices

### Diary Posts
- **Consistent dating:** Use DD.MM.YYYY format
- **Descriptive titles:** Make titles meaningful
- **Regular posting:** Keep your diary active
- **Content quality:** Proofread before publishing

### Artwork
- **High quality:** Start with best quality originals
- **Good naming:** Use descriptive, searchable names
- **Regular updates:** Add new art consistently
- **Organization:** Keep similar art together

### Linking
- **Relevant links:** Only link to quality resources
- **Good descriptions:** Clear link titles
- **Check regularly:** Remove broken links
- **Categorize properly:** Use correct sections

## 🔍 Troubleshooting

### Diary Issues
**Post not appearing:**
- Check file name matches index.html reference
- Verify file is in diary/ folder
- Check for HTML syntax errors

**Styling broken:**
- Ensure you copied the complete template
- Check CSS is loading correctly
- Verify font files are accessible

### Art Gallery Issues
**Images not loading:**
- Run compression script again
- Check file paths in files array
- Verify images are in correct folders

**Download button not working:**
- Check highRes path is correct
- Verify file exists in myart/ folder
- Test link in browser directly

### Link Issues
**Link not working:**
- Verify URL is correct
- Check for typos in configuration files
- Test link in browser directly

**Position wrong:**
- Adjust xOffset/y values
- Test on different screen sizes
- Check responsive behavior

## 📊 Deployment Workflow

### Standard Deployment
```bash
# 1. Make your changes
# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Add [content type]: [description]"

# 4. Push to GitHub
git push

# 5. Wait 1-2 minutes for GitHub Pages deployment
# 6. Check https://yum-yum-thighs.github.io/personal_website/
```

### Quick Check Before Deploying
- [ ] All changes are staged
- [ ] Commit message is clear
- [ ] No sensitive data included
- [ ] Files are in correct locations
- [ ] Tested locally (if possible)

## 🎨 Advanced Customization

### Custom Diary Styling
Edit diary CSS in individual post files or create shared stylesheet.

### Custom Gallery Layout
Modify `art/index.html` CSS for different gallery layouts.

### Custom Navigation Style
Edit `js/physics.js` for different physics behaviors.

---

## 📞 Need Help?

- **Diary issues:** Check template and file naming
- **Art issues:** Run compression script again
- **Link issues:** Verify URLs and configuration
- **Deployment issues:** Check GitHub Actions tab

This workflow covers all essential content management tasks for your portfolio. Follow these steps for consistent, professional updates to your site.
