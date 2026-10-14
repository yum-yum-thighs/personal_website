# Personal website

A personal creative space with a draggable physics homepage, diary, art gallery,
and physics resources. The black background, Computer Modern serif font,
cyan outlines, magenta accents, marquee, and Newton's cradle are preserved.

Start with [WORKFLOW.md](WORKFLOW.md) to add artwork, videos, and project links.

```powershell
python scripts/update_art.py
python -m http.server 8000
```

Visit `http://localhost:8000`. The site is plain HTML/CSS/JavaScript with no build
step. The homepage loads Matter.js from a CDN. Art and physics links load JSON
through HTTP. Original art is in `art/myart/`; previews are in `art/web/`.
`art/projects.json` is the source for art project links. `art/gallery.json` is
created by the refresh command. Old root Python commands remain compatible.

Gallery videos use lightweight, fast-start playback copies and small posters.
Video data is requested when the visitor presses Play. Run
`python scripts/prepare_videos.py` before refreshing the gallery to prepare these
copies (requires PyAV and Pillow); source videos remain available locally.

Rayway is retained in its original location, untouched and unlinked.
