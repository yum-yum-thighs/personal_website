"""Refresh the art manifest; optionally create WebP previews with Pillow."""
from pathlib import Path
import json
import hashlib

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
    (ART / 'web/thumbs').mkdir(exist_ok=True)
    manifest = ART / 'gallery.json'
    previous = {item['name']: item for item in json.loads(manifest.read_text(encoding='utf-8'))} if manifest.exists() else {}
    info_path = ART / 'web/video-info.json'
    video_info = json.loads(info_path.read_text(encoding='utf-8')) if info_path.exists() else {}
    def video_details(playback):
        info = video_info.get(playback.name.casefold(), {})
        details = {key: info[key] for key in ['poster', 'width', 'height'] if key in info}
        if details.get('poster') and info.get('version'):
            details['poster'] += '?v=' + info['version']
        return details
    def video_url(playback):
        info = video_info.get(playback.name.casefold(), {})
        return 'web/' + playback.name + ('?v=' + info['version'] if info.get('version') else '')
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
            details = {key: previous.get(source.name, {})[key] for key in ('thumbnail', 'width', 'height')
                       if key in previous.get(source.name, {})}
            if Image:
                with Image.open(source) as image:
                    image = ImageOps.exif_transpose(image)
                    details.update(width=image.width, height=image.height)
                    if unique and ext != '.gif':
                        thumbnail = ART / 'web/thumbs' / (source.stem + '.webp')
                        if not thumbnail.exists() or source.stat().st_mtime > thumbnail.stat().st_mtime:
                            image.thumbnail((640, 640))
                            image.convert('RGBA' if 'A' in image.getbands() else 'RGB').save(
                                thumbnail, 'WEBP', quality=76)
                        details['thumbnail'] = 'web/thumbs/' + thumbnail.name
            # Replacing artwork under the same filename must also refresh browser caches.
            for key, path in [('web', web), ('thumbnail', details.get('thumbnail'))]:
                if path:
                    version = hashlib.sha256((ART / path.split('?', 1)[0]).read_bytes()).hexdigest()[:12]
                    versioned = path.split('?', 1)[0] + '?v=' + version
                    if key == 'web':
                        web = versioned
                    else:
                        details[key] = versioned
            files.append(dict(name=source.name, type='image', web=web, highRes=original, **details))
        elif ext in VIDEOS:
            playback = ART / 'web' / ('film.mp4' if source.name == 'Film.mp4' else source.name)
            web = video_url(playback) if playback.exists() else original
            files.append(dict(name=source.name, title='Film' if source.name == 'Film.mp4' else source.stem,
                              type='video', web=web, highRes=web if source.name == 'Film.mp4' else original,
                              **video_details(playback)))
        else:
            print(f'Skipped {source.name}: export as an image, MP4, or WebM for the gallery.')
    listed = {file['web'].split('?', 1)[0] for file in files}
    for playback in sorted((ART / 'web').iterdir()):
        web = 'web/' + playback.name
        if playback.suffix.lower() in VIDEOS and web not in listed and '.encoding.' not in playback.name:
            info = video_info.get(playback.name.casefold(), {})
            files.append(dict(name=info.get('name', playback.name), title=info.get('title', playback.stem),
                              type='video', web=video_url(playback), highRes=video_url(playback), **video_details(playback)))
    files.sort(key=lambda file: file['name'].casefold())
    (ART / 'gallery.json').write_text(json.dumps(files, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Gallery updated: {len(files)} artworks.')
    if Image is None:
        print('Pillow is optional. Existing previews or original images will be used.')


if __name__ == '__main__':
    update_art()
