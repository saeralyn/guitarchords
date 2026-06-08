import json
from pathlib import Path

songs_dir = Path("songs")
manifest_path = Path("songs-manifest.json")

items = []

for path in sorted(songs_dir.glob("*.json")):
    if "template" in path.stem.lower():
        continue

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        items.append({
            "id": data.get("id", path.stem),
            "title": data.get("title", path.stem),
            "path": str(path).replace("\\", "/")
        })
    except Exception as exc:
        print(f"Skipping {path}: {exc}")

manifest_path.write_text(
    json.dumps(items, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print(f"Generated {manifest_path} with {len(items)} song(s).")
