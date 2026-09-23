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
            "type": "image",
            "web": f"web/{file.stem}.webp",
            "highRes": f"myart/{file.name}"
        })

    elif ext in VIDEO_TYPES:
        files.append({
            "name": file.name,
            "type": "video",
            "web": f"myart/{file.name}",
            "highRes": f"myart/{file.name}"
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

        image.src = file.web || "myart/" + file.name;

        image.alt = file.name;

        image.loading = "lazy";

        item.appendChild(image);

        // Add download button for high-res version
        if (file.highRes) {{
            const downloadBtn = document.createElement("a");
            downloadBtn.href = file.highRes;
            downloadBtn.download = file.name;
            downloadBtn.textContent = "↓ Download High-Res";
            downloadBtn.className = "download-btn";
            downloadBtn.style.cssText = "display: block; margin-top: 8px; font-size: 0.8rem; color: #00ffff; text-decoration: none;";
            item.appendChild(downloadBtn);
        }}

    }}


    if (file.type === "video") {{

        const video = document.createElement("video");

        video.src = file.web || "myart/" + file.name;

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
