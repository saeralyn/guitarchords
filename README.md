# Saeralyn Guitar Chords

This version avoids runtime GitHub API calls.

## How it works

1. You add a new `.json` file into the `songs/` folder.
2. GitHub Actions runs `scripts/generate_manifest.py`.
3. The action updates `songs-manifest.json`.
4. The homepage reads `songs-manifest.json` and shows the song automatically.

## Folder structure

```text
guitarchords/
├── index.html
├── song.html
├── style.css
├── app.js
├── songs-manifest.json
├── songs/
│   ├── two-tigers.json
│   └── new-song-template.json
├── scripts/
│   └── generate_manifest.py
└── .github/
    └── workflows/
        └── update-songs-manifest.yml
```

## How to add a song

1. Copy `songs/new-song-template.json`.
2. Rename it, for example `little-star.json`.
3. Change `id`, `title`, `chords`, `lines`, and optional `tab`.
4. Commit the new file.
5. Wait for GitHub Actions to finish.
6. The homepage will show the new song.

## GitHub Pages

Use:

- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

## Extended chord library includes:

C, G, A, D, E, F, FMaj7, Am, Em, Dm, Fm.

## Replace old files

Upload all files/folders in this zip to the repository root.
