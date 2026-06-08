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
    throw new Error("Cannot load songs-manifest.json. Check whether the file exists in the repository root.");
  }
  return response.json();
}

async function loadSongs() {
  const manifest = await loadManifest();
  const songPromises = manifest.map(async item => {
    const response = await fetch(item.path + "?cache=" + Date.now());
    if (!response.ok) throw new Error("Cannot load " + item.path);
    return response.json();
  });
  const songs = await Promise.all(songPromises);
  return songs.sort((a, b) => a.title.localeCompare(b.title));
}

function createBadge(text) {
  return `<span class="badge">${text}</span>`;
}

function normalizeChordName(chord) {
  return String(chord || "").trim().replace(/\s+/g, "");
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
    <div class="chord-card" data-chord-category="${chord.category || "Other"}">
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

function renderSongCards(targetSelector, songs, limit = null) {
  const grid = document.querySelector(targetSelector);
  if (!grid) return;

  const shownSongs = limit ? songs.slice(0, limit) : songs;

  grid.innerHTML = shownSongs.map(song => {
    const chordCount = getChordNamesFromSong(song).length;
    return `
      <a class="song-card" href="song.html?id=${encodeURIComponent(song.id)}">
        <h3>${song.title}</h3>
        <p>${song.subtitle || ""}</p>
        <div class="meta-line">
          ${createBadge(song.level || "Unknown")}
          ${createBadge(song.chords || "-")}
          ${createBadge(`${chordCount} Chord${chordCount > 1 ? "s" : ""}`)}
          ${createBadge(song.tempo || "-")}
        </div>
      </a>
    `;
  }).join("");

  if (shownSongs.length === 0) {
    grid.innerHTML = `<p class="muted">No song found.</p>`;
  }
}

function renderHomePage() {
  const latestGrid = document.querySelector("#latestSongGrid");
  if (!latestGrid) return;
  renderSongCards("#latestSongGrid", allSongs, 5);
}

function renderSongsPage() {
  const grid = document.querySelector("#songGrid");
  const levelFilter = document.querySelector("#levelFilter");
  const chordFilter = document.querySelector("#chordFilter");
  if (!grid) return;

  const chordNames = [...new Set(allSongs.flatMap(getChordNamesFromSong))].sort();
  if (chordFilter) {
    chordFilter.innerHTML = `<option value="all">All Chords</option>` + chordNames.map(name => `<option value="${name}">${name}</option>`).join("");
  }

  function renderList() {
    const level = levelFilter?.value || "all";
    const chord = chordFilter?.value || "all";
    const filteredSongs = allSongs.filter(song => {
      const matchesLevel = level === "all" || song.level === level;
      const songChords = getChordNamesFromSong(song);
      const matchesChord = chord === "all" || songChords.includes(chord);
      return matchesLevel && matchesChord;
    });
    renderSongCards("#songGrid", filteredSongs);
  }

  levelFilter?.addEventListener("change", renderList);
  chordFilter?.addEventListener("change", renderList);
  renderList();
}

function renderChordLibraryPage() {
  const grid = document.querySelector("#chordLibraryGrid");
  const categoryButtons = document.querySelector("#chordCategoryButtons");
  if (!grid) return;

  const allChordKeys = Object.keys(CHORD_LIBRARY);
  const categories = ["All Chords", ...new Set(Object.values(CHORD_LIBRARY).map(chord => chord.category || "Other"))];

  if (categoryButtons) {
    categoryButtons.innerHTML = categories.map((category, index) => `
      <button class="filter-button ${index === 0 ? "active" : ""}" data-category="${category}">${category}</button>
    `).join("");

    categoryButtons.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      document.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderChordCategory(button.dataset.category);
    });
  }

  function renderChordCategory(category) {
    const keys = category === "All Chords"
      ? allChordKeys
      : allChordKeys.filter(key => (CHORD_LIBRARY[key].category || "Other") === category);
    renderChordGrid("#chordLibraryGrid", keys);
  }

  renderChordCategory("All Chords");
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
    hero.innerHTML = `<h1>Song not found</h1><p>Please go back to the home page.</p>`;
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
    renderHomePage();
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
