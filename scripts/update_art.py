"""Refresh the art manifest; optionally create WebP previews with Pillow."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'art'
IMAGES = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'}
VIDEOS = {'.mp4', '.webm', '.ogg', '.mov'}


def update_art():
    try:
        from PIL import Image, ImageOps
    except ImportError:
        Image = None
    (ART / 'web').mkdir(exist_ok=True)
    files = []
    sources = sorted((ART / 'myart').iterdir(), key=lambda p: p.name.casefold())
    # A same-stem preview is ambiguous: keep those images on their original paths.
    stems = [p.stem.casefold() for p in sources if p.suffix.lower() in IMAGES]
    for source in sources:
        if not source.is_file():
            continue
        ext = source.suffix.lower()
        original = 'myart/' + source.name
        if ext in IMAGES:
            preview = ART / 'web' / (source.stem + '.webp')
            unique = stems.count(source.stem.casefold()) == 1
            if Image and unique and ext not in {'.gif', '.webp'} and (
                not preview.exists() or source.stat().st_mtime > preview.stat().st_mtime
            ):
                try:
                    with Image.open(source) as image:
                        image = ImageOps.exif_transpose(image)
                        image.thumbnail((1800, 1800))
                        image.convert('RGBA' if 'A' in image.getbands() else 'RGB').save(
                            preview, 'WEBP', quality=80
                        )
                except (OSError, ValueError) as error:
                    print(f'Preview skipped for {source.name}: {error}')
            web = ('web/' + preview.name) if unique and preview.exists() and ext != '.gif' else original
            files.append(dict(name=source.name, type='image', web=web, highRes=original))
        elif ext in VIDEOS:
            playback = ART / 'web' / ('film.mp4' if source.name == 'Film.mp4' else source.name)
            web = 'web/' + playback.name if playback.exists() else original
            files.append(dict(name=source.name, title='Film' if source.name == 'Film.mp4' else source.stem,
                              type='video', web=web, highRes=web if source.name == 'Film.mp4' else original))
        else:
            print(f'Skipped {source.name}: export as an image, MP4, or WebM for the gallery.')
    listed = {file['web'] for file in files}
    for playback in sorted((ART / 'web').iterdir()):
        web = 'web/' + playback.name
        if playback.suffix.lower() in VIDEOS and web not in listed:
            files.append(dict(name=playback.name, title=playback.stem,
                              type='video', web=web, highRes=web))
    (ART / 'gallery.json').write_text(json.dumps(files, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Gallery updated: {len(files)} artworks.')
    if Image is None:
        print('Pillow is optional. Existing previews or original images will be used.')


if __name__ == '__main__':
    update_art()
