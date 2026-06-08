let allSongs = [];

function showStatus(message, type = "normal") {
  const statusBox = document.querySelector("#statusBox");
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.className = `status-card ${type}`;
}

async function loadManifest() {
  const response = await fetch("songs-manifest.json?cache=" + Date.now());
  if (!response.ok) {
    throw new Error("Cannot load songs-manifest.json. Check whether GitHub Actions generated it.");
  }
  return response.json();
}

async function loadSongs() {
  const manifest = await loadManifest();
  const songPromises = manifest.map(async item => {
    const response = await fetch(item.path + "?cache=" + Date.now());
    if (!response.ok) throw new Error("Cannot load " + item.path);
    const song = await response.json();
    song.__manifestIndex = manifest.indexOf(item);
    return song;
  });
  return Promise.all(songPromises);
}

function createBadge(text) {
  return `<span class="badge">${text}</span>`;
}

function normalizeChordName(chord) {
  return chord.trim().replace(/\s+/g, "");
}

function getChordNamesFromSong(song) {
  if (Array.isArray(song.chordList)) {
    return song.chordList.map(normalizeChordName);
  }

  if (song.chords) {
    return song.chords
      .split(/[·,\/\s]+/)
      .map(normalizeChordName)
      .filter(Boolean);
  }

  const fromLines = (song.lines || []).map(line => normalizeChordName(line.chord || "")).filter(Boolean);
  return [...new Set(fromLines)];
}

function findChordDefinition(chordName) {
  if (CHORD_LIBRARY[chordName]) return CHORD_LIBRARY[chordName];

  return Object.values(CHORD_LIBRARY).find(chord =>
    chord.name === chordName || (chord.aliases || []).includes(chordName)
  );
}

function renderChordDiagram(chord) {
  const width = 150;
  const height = 190;
  const left = 26;
  const top = 42;
  const stringGap = 18;
  const fretGap = 24;
  const strings = 6;
  const frets = 5;

  let svg = `
    <div class="chord-card">
      <div class="chord-name">${chord.name}</div>
      <svg class="chord-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${chord.name} chord diagram">
        <text x="${left}" y="24" class="small-label">E</text>
        <text x="${left + stringGap}" y="24" class="small-label">A</text>
        <text x="${left + stringGap * 2}" y="24" class="small-label">D</text>
        <text x="${left + stringGap * 3}" y="24" class="small-label">G</text>
        <text x="${left + stringGap * 4}" y="24" class="small-label">B</text>
        <text x="${left + stringGap * 5}" y="24" class="small-label">e</text>
  `;

  for (let i = 0; i < strings; i++) {
    const x = left + i * stringGap;
    svg += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + fretGap * frets}" class="chord-line" />`;
  }

  for (let i = 0; i <= frets; i++) {
    const y = top + i * fretGap;
    const className = i === 0 ? "nut-line" : "chord-line";
    svg += `<line x1="${left}" y1="${y}" x2="${left + stringGap * (strings - 1)}" y2="${y}" class="${className}" />`;
  }

  if (chord.barre) {
    const y = top + (chord.barre.fret - 0.5) * fretGap;
    const x1 = left + chord.barre.fromString * stringGap;
    const x2 = left + chord.barre.toString * stringGap;
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="barre-line" />`;
  }

  chord.frets.forEach((fret, i) => {
    const x = left + i * stringGap;
    if (fret === "x" || fret === "X") {
      svg += `<text x="${x}" y="${top - 10}" class="mute-open">x</text>`;
    } else if (String(fret) === "0") {
      svg += `<text x="${x}" y="${top - 10}" class="mute-open">o</text>`;
    } else {
      const fretNumber = Number(fret);
      const y = top + (fretNumber - 0.5) * fretGap;
      const finger = chord.fingers?.[i] || "";
      if (!chord.barre || chord.barre.fret !== fretNumber || finger !== "1") {
        svg += `<circle cx="${x}" cy="${y}" r="8" class="finger-dot" />`;
        if (finger) svg += `<text x="${x}" y="${y + 4}" class="finger-text">${finger}</text>`;
      }
    }
  });

  svg += `
      </svg>
    </div>
  `;

  return svg;
}

function renderChordGrid(targetSelector, chordNames) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const uniqueNames = [...new Set(chordNames)];
  const diagrams = uniqueNames
    .map(name => findChordDefinition(name))
    .filter(Boolean)
    .map(renderChordDiagram)
    .join("");

  target.innerHTML = diagrams || `<p class="muted">No chord diagrams available yet.</p>`;
}

function getSongCardHtml(song) {
  return `
    <a class="song-card" href="song.html?id=${encodeURIComponent(song.id)}">
      <h3>${song.title}</h3>
      <p>${song.subtitle || ""}</p>
      <div class="meta-line">
        ${createBadge(song.level || "Unknown")}
        ${createBadge(song.chords || "-")}
        ${createBadge(song.capo || "No Capo")}
        ${createBadge(song.tempo || "-")}
      </div>
    </a>
  `;
}

function renderLatestSongs() {
  const grid = document.querySelector("#latestSongGrid");
  if (!grid) return;

  const latestSongs = [...allSongs]
    .sort((a, b) => (b.addedAt || b.__manifestIndex || 0) > (a.addedAt || a.__manifestIndex || 0) ? 1 : -1)
    .slice(0, 5);

  grid.innerHTML = latestSongs.map(getSongCardHtml).join("");

  if (latestSongs.length === 0) {
    grid.innerHTML = `<p class="muted">No song found.</p>`;
  }
}

function renderSongsPage() {
  const grid = document.querySelector("#songGrid");
  const searchInput = document.querySelector("#searchInput");
  const levelFilter = document.querySelector("#levelFilter");

  if (!grid || !searchInput || !levelFilter) return;

  function renderList() {
    const keyword = searchInput.value.toLowerCase().trim();
    const level = levelFilter.value;

    const filteredSongs = allSongs.filter(song => {
      const searchable = `${song.title} ${song.subtitle} ${song.chords} ${song.language} ${song.level}`.toLowerCase();
      const matchesKeyword = searchable.includes(keyword);
      const matchesLevel = level === "all" || song.level === level;
      return matchesKeyword && matchesLevel;
    });

    grid.innerHTML = filteredSongs.map(getSongCardHtml).join("");

    if (filteredSongs.length === 0) {
      grid.innerHTML = `<p class="muted">No song found.</p>`;
    }
  }

  searchInput.addEventListener("input", renderList);
  levelFilter.addEventListener("change", renderList);
  renderList();
}

function renderChordLibraryPage() {
  const input = document.querySelector("#chordSearchInput");
  const grid = document.querySelector("#chordLibraryGrid");
  if (!grid) return;

  function renderList() {
    const keyword = (input?.value || "").toLowerCase().trim();
    const chordNames = Object.keys(CHORD_LIBRARY).filter(key => {
      const chord = CHORD_LIBRARY[key];
      const text = `${key} ${chord.name} ${(chord.aliases || []).join(" ")}`.toLowerCase();
      return text.includes(keyword);
    });

    renderChordGrid("#chordLibraryGrid", chordNames);
  }

  if (input) input.addEventListener("input", renderList);
  renderList();
}

function getSongById(id) {
  return allSongs.find(song => song.id === id);
}

function renderTab(tab) {
  if (!tab || !tab.systems || tab.systems.length === 0) return "";

  return tab.systems.map(system => {
    const title = system.title ? `<p class="tab-title">${system.title}</p>` : "";
    const lines = system.lines.join("\n");
    return `${title}<pre class="tab-staff">${lines}</pre>`;
  }).join("");
}

function renderSongPage() {
  const hero = document.querySelector("#songHero");
  const strummingBox = document.querySelector("#strummingBox");
  const sheet = document.querySelector("#sheet");
  const capoNotes = document.querySelector("#capoNotes");
  const practiceNotes = document.querySelector("#practiceNotes");
  const tabBox = document.querySelector("#tabBox");
  const tabSection = document.querySelector("#tabSection");

  if (!hero || !sheet) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const song = getSongById(id);

  if (!song) {
    hero.innerHTML = `<h1>Song not found</h1><p>Please go back to the Songs page.</p>`;
    showStatus("Song not found.", "error");
    return;
  }

  document.title = song.title;
  showStatus("Song loaded.", "success");

  hero.innerHTML = `
    <h1>${song.title}</h1>
    <p>${song.subtitle || ""}</p>
    <div class="info-grid">
      <div class="info-card"><span>Capo</span><strong>${song.capo || "No Capo"}</strong></div>
      <div class="info-card"><span>Chords</span><strong>${song.chords || "-"}</strong></div>
      <div class="info-card"><span>Time</span><strong>${song.time || "-"}</strong></div>
      <div class="info-card"><span>Tempo</span><strong>${song.tempo || "-"}</strong></div>
      <div class="info-card"><span>Key</span><strong>${song.key || "-"}</strong></div>
      <div class="info-card"><span>Level</span><strong>${song.level || "-"}</strong></div>
    </div>
  `;

  renderChordGrid("#songChordGrid", getChordNamesFromSong(song));

  strummingBox.innerHTML = `
    <div class="pattern">${song.strumming?.pattern || "-"}</div>
    <div class="count">${song.strumming?.count || ""}</div>
    <p class="note-text">${song.strumming?.note || ""}</p>
  `;

  sheet.innerHTML = (song.lines || []).map(line => {
    const cols = Math.max(line.beats?.length || 0, line.strums?.length || 0, line.lyrics?.length || 0);

    const makeCells = (items = [], className) => {
      const cells = [];
      for (let i = 0; i < cols; i++) {
        const value = items[i] || "";
        cells.push(`<div class="cell ${className} ${value ? "" : "empty"}">${value || "·"}</div>`);
      }
      return cells.join("");
    };

    return `
      <article class="song-line">
        <div class="chord-label">${line.chord}</div>
        <div class="align-grid" style="--cols: ${cols};">
          ${makeCells(line.beats, "beat-cell")}
          ${makeCells(line.strums, "strum-cell")}
          ${makeCells(line.lyrics, "lyric-cell")}
        </div>
      </article>
    `;
  }).join("");

  const renderedTab = renderTab(song.tab);
  if (renderedTab) {
    tabBox.innerHTML = renderedTab;
    tabSection.classList.remove("hidden");
  } else {
    tabSection.classList.add("hidden");
  }

  capoNotes.innerHTML = `
    <table class="capo-table">
      <thead>
        <tr>
          <th>Capo</th>
          <th>Chord Shapes</th>
          <th>Actual Sound</th>
        </tr>
      </thead>
      <tbody>
        ${(song.capoNotes || []).map(row => `
          <tr>
            <td>${row[0]}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  practiceNotes.innerHTML = `
    <ul class="note-list">
      ${(song.practiceNotes || []).map(note => `<li>${note}</li>`).join("")}
    </ul>
  `;
}

async function start() {
  try {
    allSongs = await loadSongs();
    showStatus(`${allSongs.length} song(s) loaded.`, "success");
    renderLatestSongs();
    renderSongsPage();
    renderChordLibraryPage();
    renderSongPage();
  } catch (error) {
    console.error(error);
    showStatus(error.message, "error");
    renderChordLibraryPage();
  }
}

start();
