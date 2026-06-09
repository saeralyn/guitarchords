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
    return response.json();
  });
  const songs = await Promise.all(songPromises);
  return songs.sort((a, b) => a.title.localeCompare(b.title));
}

function createBadge(text) {
  return `<span class="badge">${text}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
      const hiddenByBarre = chord.barre && chord.barre.fret === fretNumber && finger === "1";

      if (!hiddenByBarre) {
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

function getChordsByCategory(categoryId) {
  return Object.values(CHORD_LIBRARY)
    .filter(chord => {
      if (!chord.category) return categoryId === "all";
      if (Array.isArray(chord.category)) return chord.category.includes(categoryId);
      return chord.category === categoryId;
    })
    .map(chord => chord.name);
}

function createClickableChord(chordName, className = "clickable-chord") {
  const cleanName = normalizeChordName(chordName);
  const chord = findChordDefinition(cleanName);
  const disabledClass = chord ? "" : " is-missing";
  const title = chord ? `Show ${cleanName} chord` : `${cleanName} chord diagram not found`;

  return `
    <button 
      type="button" 
      class="${className}${disabledClass}" 
      data-chord="${escapeHtml(cleanName)}"
      title="${escapeHtml(title)}"
    >${escapeHtml(chordName)}</button>
  `;
}

function ensureChordPopup() {
  if (document.querySelector("#chordPopupOverlay")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div id="chordPopupOverlay" class="chord-popup-overlay" hidden>
      <div class="chord-popup-panel" role="dialog" aria-modal="true" aria-labelledby="chordPopupTitle">
        <button type="button" class="chord-popup-close" aria-label="Close chord popup">×</button>
        <div id="chordPopupContent"></div>
      </div>
    </div>
  `);

  document.querySelector("#chordPopupOverlay").addEventListener("click", event => {
    if (event.target.id === "chordPopupOverlay") closeChordPopup();
  });

  document.querySelector(".chord-popup-close").addEventListener("click", closeChordPopup);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeChordPopup();
  });
}

function openChordPopup(chordName) {
  const chord = findChordDefinition(chordName);
  if (!chord) return;

  ensureChordPopup();

  const overlay = document.querySelector("#chordPopupOverlay");
  const content = document.querySelector("#chordPopupContent");

  content.innerHTML = renderChordDiagram(chord);
  overlay.hidden = false;
  document.body.classList.add("popup-open");
}

function closeChordPopup() {
  const overlay = document.querySelector("#chordPopupOverlay");
  if (!overlay) return;

  overlay.hidden = true;
  document.body.classList.remove("popup-open");
}

function setupChordPopupEvents() {
  ensureChordPopup();

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-chord]");
    if (!button) return;

    const chordName = button.dataset.chord;
    if (!chordName) return;

    openChordPopup(chordName);
  });
}

function renderHomePage() {
  const grid = document.querySelector("#songGrid");
  const searchInput = document.querySelector("#searchInput");
  const levelFilter = document.querySelector("#levelFilter");

  renderChordGrid("#chordLibraryGrid", Object.keys(CHORD_LIBRARY));

  if (!grid) return;

  function renderList() {
    const keyword = searchInput?.value.toLowerCase().trim() || "";
    const level = levelFilter?.value || "all";

    const filteredSongs = allSongs.filter(song => {
      const searchable = `${song.title} ${song.subtitle} ${song.chords} ${song.language} ${song.level}`.toLowerCase();
      const matchesKeyword = searchable.includes(keyword);
      const matchesLevel = level === "all" || song.level === level;
      return matchesKeyword && matchesLevel;
    });

    grid.innerHTML = filteredSongs.map(song => `
      <a class="song-card" href="song.html?id=${song.id}">
        <h3>${song.title}</h3>
        <p>${song.subtitle || ""}</p>
        <div class="meta-line">
          ${createBadge(song.level || "Unknown")}
          ${createBadge(song.chords || "-")}
          ${createBadge(song.capo || "No Capo")}
          ${createBadge(song.tempo || "-")}
        </div>
      </a>
    `).join("");

    if (filteredSongs.length === 0) {
      grid.innerHTML = `<p class="muted">No song found.</p>`;
    }
  }

  searchInput?.addEventListener("input", renderList);
  levelFilter?.addEventListener("change", renderList);
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

function padChordLine(chords, lyric) {
  const length = Math.max(lyric.length, 1);
  const chars = Array(length + 8).fill(" ");

  (chords || []).forEach(item => {
    const chord = item.chord || "";
    const pos = Math.max(0, item.position || 0);
    for (let i = 0; i < chord.length; i++) {
      chars[pos + i] = chord[i];
    }
  });

  return chars.join("").trimEnd();
}

function renderChordSheetSections(song) {
  const sections = song.chordSheet?.sections || [];
  if (!sections.length) return "";

  return `
    <div class="chord-sheet-box">
      ${sections.map(section => `
        <div class="chord-sheet-section">
          <h3>[${escapeHtml(section.name)}]</h3>
          ${
            section.progression
              ? `<pre class="progression-row">${section.progression.map(escapeHtml).join("\n")}</pre>`
              : ""
          }
          ${
            (section.lines || []).map(line => {
              const lyric = line.lyric || "";
              const chords = line.chords || [];

              return `
                <div class="chord-sheet-line-wrap" style="--line-chars: ${Math.max(lyric.length, 24)};">
                  <div class="chord-sheet-chord-row">
                    ${chords.map(item => `
                      <span class="floating-chord" style="--chord-pos: ${Math.max(0, item.position || 0)};">
                        ${createClickableChord(item.chord, "inline-chord-button")}
                      </span>
                    `).join("")}
                  </div>
                  <pre class="chord-sheet-line lyric-row">${escapeHtml(lyric)}</pre>
                </div>
              `;
            }).join("")
          }
        </div>
      `).join("")}
    </div>
  `;
}

function renderGridSheet(song) {
  return (song.lines || []).map(line => {
    const cols = Math.max(line.beats?.length || 0, line.strums?.length || 0, line.lyrics?.length || 0);

    const makeCells = (items = [], className) => {
      const cells = [];
      for (let i = 0; i < cols; i++) {
        const value = items[i] || "";
        cells.push(`<div class="cell ${className} ${value ? "" : "empty"}">${escapeHtml(value || "·")}</div>`);
      }
      return cells.join("");
    };

    return `
      <article class="song-line">
        <div class="chord-label">${createClickableChord(line.chord, "chord-label-button")}</div>
        <div class="align-grid" style="--cols: ${cols};">
          ${makeCells(line.beats, "beat-cell")}
          ${makeCells(line.strums, "strum-cell")}
          ${makeCells(line.lyrics, "lyric-cell")}
        </div>
      </article>
    `;
  }).join("");
}

function renderPhraseSheet(song) {
  const phrases = song.phrases || [];

  return `
    <div class="phrase-sheet">
      ${phrases.map(phrase => `
        <article class="phrase-block">
          <div class="phrase-chord">${createClickableChord(phrase.chord, "phrase-chord-button")}</div>
          <div class="phrase-pattern">${escapeHtml(phrase.strumming || song.strumming?.pattern || "")}</div>
          <div class="phrase-lyrics">${escapeHtml(phrase.lyrics || "")}</div>
        </article>
      `).join("")}
    </div>
  `;
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

  const formatLabel = song.sheetType === "chord-sheet"
    ? "Chord Sheet"
    : song.sheetType === "phrase"
      ? "Phrase Practice"
      : "Strumming Grid";

  hero.innerHTML = `
    <h1>${escapeHtml(song.title)}</h1>
    <p>${escapeHtml(song.subtitle || "")}</p>
    <div class="info-grid">
      <div class="info-card"><span>Format</span><strong class="song-format-badge">${formatLabel}</strong></div>
      <div class="info-card"><span>Capo</span><strong>${escapeHtml(song.capo || "No Capo")}</strong></div>
      <div class="info-card"><span>Chords</span><strong>${escapeHtml(song.chords || "-")}</strong></div>
      <div class="info-card"><span>Time</span><strong>${escapeHtml(song.time || "-")}</strong></div>
      <div class="info-card"><span>Tempo</span><strong>${escapeHtml(song.tempo || "-")}</strong></div>
      <div class="info-card"><span>Key</span><strong>${escapeHtml(song.key || "-")}</strong></div>
      <div class="info-card"><span>Level</span><strong>${escapeHtml(song.level || "-")}</strong></div>
    </div>
  `;

  renderChordGrid("#songChordGrid", getChordNamesFromSong(song));

  strummingBox.innerHTML = `
    <div class="pattern">${escapeHtml(song.strumming?.pattern || "-")}</div>
    <div class="count">${escapeHtml(song.strumming?.count || "")}</div>
    <p class="note-text">${escapeHtml(song.strumming?.note || "")}</p>
  `;

  if (song.sheetType === "chord-sheet") {
    sheet.innerHTML = renderChordSheetSections(song);
  } else if (song.sheetType === "phrase") {
    sheet.innerHTML = renderPhraseSheet(song);
  } else {
    sheet.innerHTML = renderGridSheet(song);
  }

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
            <td>${escapeHtml(row[0])}</td>
            <td>${escapeHtml(row[1])}</td>
            <td>${escapeHtml(row[2])}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  practiceNotes.innerHTML = `
    <ul class="note-list">
      ${(song.practiceNotes || []).map(note => `<li>${escapeHtml(note)}</li>`).join("")}
    </ul>
  `;
}

async function start() {
  try {
    setupChordPopupEvents();
    allSongs = await loadSongs();
    showStatus(`${allSongs.length} song(s) loaded.`, "success");
    renderHomePage();
    renderSongPage();
  } catch (error) {
    console.error(error);
    showStatus(error.message, "error");
    renderChordGrid("#chordLibraryGrid", Object.keys(CHORD_LIBRARY));
  }
}

start();
