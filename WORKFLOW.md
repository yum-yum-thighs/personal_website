# Adding content to your website

You only need two places for art updates: `art/myart/` for your files and
`art/projects.json` for project links. You do not need to edit HTML or JavaScript.

## Add artwork or a video

1. Copy your finished file into `art/myart/`.
2. From the website folder, run:

   ```powershell
   python scripts/update_art.py
   ```

3. Preview Art Ã¢â€ â€™ My Art and check the artwork.

Images: PNG, JPG, JPEG, GIF, WebP, BMP. Videos: MP4, WebM, OGG, MOV.
MP4 or WebM are the most practical video exports; MOV support depends on the codec.
The existing `loop.mkv` is kept but skipped; export an MP4 to display it.
`Film.mp4` lives in `art/myart/` and appears in My Art without a filename caption.
Its H.264/AAC playback copy is `art/web/film.mp4`; the browser-compatible copy is downloadable. The full-quality master stays local
and is excluded from Git because it exceeds GitHub's per-file limit.
To create the smaller playback copies and posters, run `python scripts/prepare_videos.py`
(requires PyAV and Pillow),
then `python scripts/update_art.py`.

Film plays from `art/web/film.mp4`; Tree plays from `art/web/Tree.mp4` while its
original download stays in `art/myart/Tree.mp4`. The playback copies use H.264,
preserve audio, keep MP4 startup information at the beginning, and fit within
960 pixels with a capped video bitrate for slower connections. Posters appear immediately. The gallery loads video data only after
the visitor presses Play. `art/web/video-info.json` stores dimensions, posters,
and content versions so the refresh command keeps these optimizations.

The local Film master remains untouched. When it is absent in another checkout,
the preparation script keeps an already prepared playback copy instead of
recompressing it. Legacy `scripts/prepare_film.py` remains available for an earlier
full-resolution export; use `prepare_videos.py` for the faster gallery version.

The command scans files alphabetically and writes `art/gallery.json`.
Deleting a file and rerunning it removes the artwork from the gallery.
Originals remain available through Download High-Res. Existing previews in
`art/web/` are used when available; otherwise the original image is displayed.
Optional: `python -m pip install Pillow` enables automatic resized WebP previews.
Animated GIFs keep their original animation. Do not edit the generated gallery
JSON by hand: the next refresh replaces it.

## Link a project

Open `art/projects.json`. Each entry has a title and destination:

```json
[
  {
    "title": "How to make videos like GawxArt",
    "url": "https://youtu.be/gkteQH2DRK0?si=CorUCwCCn5hJjeoW"
  },
  {
    "title": "My next project",
    "url": "https://example.com/my-project"
  }
]
```

Replace the example with your actual project. Put a comma between entries,
but no comma after the last one. Save and refresh: no generation command needed.
Local URLs are relative to `art/index.html`, such as `projects/example/index.html`.
External destinations open in a new tab. There is no upload service or account:
adding files locally and publishing the repository is how content reaches the site.

## Preview before publishing

Run from the website folder:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`, then visit Art. Stop the server with Ctrl+C.
Use a local server because JSON fetching and JavaScript modules need HTTP.
Check your new image/video, image preview (double-click or Enter), downloads,
and project links. Also check a narrow browser window.

## Publish your changes

When you are happy with the preview:

```powershell
git status --short
git add art/
git commit -m "Add artwork and project links"
git push
```

This publishes through whatever deployment is configured for the repository.
For the first refactor commit, also include the changed scripts, styles, and docs
shown by `git status`. Check your deployed website after the deployment completes.

## Other content

- Diary: copy `diary/1_diary_template.txt`, save as the next numbered HTML file,
  and add its date/title/link to `diary/index.html`.
- Physics links: edit `physics/links.json`; `other` is resources and `mine` is
  personal projects. An empty list is valid.
- Homepage boxes: edit `js/config.js`.
- Rayway stays isolated in its existing folder. Leave it alone and do not add a link.

## Folder map

```text
index.html + style.css   Physics homepage and its visual style
js/                     Homepage, art, and resource behavior
art/index.html          Gallery page structure
art/style.css           Original gallery styling
art/myart/              Your original images and videos
art/web/                WebP display previews
art/gallery.json        Generated artwork list
art/projects.json       Project links you edit
physics/links.json      Physics links you edit
physics/rayway/         Existing isolated project; untouched
scripts/update_art.py   One command to refresh artwork
diary/                 Diary posts and template
```

If content does not appear, run the refresh command, confirm the filename,
check JSON commas, and reload the HTTP preview. A video that does not play
usually needs a browser-compatible MP4 (H.264) or WebM export.

Gallery images use generated 640-pixel thumbnails in `art/web/thumbs/`.
Enlarging an image loads its larger preview; Download High-Res keeps the original.
Run `python scripts/update_art.py` after adding art and include its generated files in your commit.
