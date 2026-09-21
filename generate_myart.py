from pathlib import Path
import json

ROOT = Path(__file__).parent
MYART = ROOT / "art" / "myart"
HTML = ROOT / "art" / "index.html"

IMAGE_TYPES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}
VIDEO_TYPES = {".mp4", ".webm", ".ogg", ".mov"}

files = []

for file in sorted(MYART.iterdir()):
    if not file.is_file():
        continue

    ext = file.suffix.lower()

    if ext in IMAGE_TYPES:
        files.append({
            "name": file.name,
            "type": "image"
        })

    elif ext in VIDEO_TYPES:
        files.append({
            "name": file.name,
            "type": "video"
        })

data = json.dumps(files, indent=4)

script = f"""
<script>

const files = {data};

const gallery = document.getElementById("gallery");

files.forEach(file => {{

    const item = document.createElement("div");

    item.className = "item";


    if (file.type === "image") {{

        const image = document.createElement("img");

        image.src = "myart/" + file.name;

        image.alt = file.name;

        image.loading = "lazy";

        item.appendChild(image);

    }}


    if (file.type === "video") {{

        const video = document.createElement("video");

        video.src = "myart/" + file.name;

        video.controls = true;

        video.preload = "metadata";

        item.appendChild(video);

    }}


    gallery.appendChild(item);

}});

</script>
"""

html = HTML.read_text(encoding="utf-8")

start = "<!-- GALLERY_SCRIPT_START -->"
end = "<!-- GALLERY_SCRIPT_END -->"

start_pos = html.find(start)
end_pos = html.find(end)

if start_pos == -1 or end_pos == -1:
    print("Gallery markers not found.")
    exit()

end_pos += len(end)

html = (
    html[:start_pos]
    + start
    + "\n"
    + script
    + "\n"
    + end
    + html[end_pos:]
)

HTML.write_text(html, encoding="utf-8")

print(f"Found {len(files)} files.")
