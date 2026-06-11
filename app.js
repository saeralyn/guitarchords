let allSongs = [];

function escapeHtml(str) {
  if (str == null) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showStatus(message, type = "normal") {
  const statusBox = document.querySelector("#statusBox");
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.className = `status-card ${type}`;
}

async function loadManifest() {
  const response = await fetch("songs-manifest.json?cache=" + Date.now());
  if (!response.ok) {
    throw new Error("Cannot load songs-manifest.json.");
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
  if (Array.isArray(song.chordList)) return song.chordList.map(normalizeChordName);

  if (song.chords) {
    return song.chords
      .split(/[·,\/\s]+/)
      .map(normalizeChordName)
      .filter(Boolean);
  }

  return [...new Set((song.lines || []).map(line => normalizeChordName(line.chord)).filter(Boolean))];
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

  svg += `</svg></div>`;
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

  target.innerHTML = diagrams || `<p class="muted">No chord diagrams available.</p>`;
}

function getChordsByCategory(categoryId) {
  return Object.values(CHORD_LIBRARY)
    .filter(chord => (chord.category || ["all"]).includes(categoryId))
    .map(chord => chord.name);
}

function renderCategoryButtons() {
  const holder =
    document.querySelector("#categoryButtons") ||
    document.querySelector("#chordCategoryButtons") ||
    document.querySelector(".category-pills");

  if (!holder) return;

  holder.innerHTML = CHORD_CATEGORIES.map((cat, index) => `
    <button class="category-pill ${index === 0 ? "active" : ""}" data-category="${cat.id}">
      ${cat.label}
    </button>
  `).join("");

  holder.querySelectorAll(".category-pill").forEach(button => {
    button.addEventListener("click", () => {
      holder.querySelectorAll(".category-pill").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const categoryId = button.dataset.category;
      const title = document.querySelector("#chordCategoryTitle");
      if (title) {
        const label = CHORD_CATEGORIES.find(cat => cat.id === categoryId)?.label || "Chord Diagrams";
        title.textContent = label;
      }

      renderChordGrid("#chordLibraryGrid", getChordsByCategory(categoryId));
    });
  });
}

function renderSongCards(targetSelector, songs, compact = false) {
  const grid = document.querySelector(targetSelector);
  if (!grid) return;

  grid.innerHTML = songs.map(song => {
    const chordNames = getChordNamesFromSong(song);
    return `
      <a class="song-card" href="song.html?id=${encodeURIComponent(song.id)}">
        <h3>${song.title}</h3>
        <p>${song.subtitle || ""}</p>
        <div class="meta-line">
          ${createBadge(song.level || "Unknown")}
          ${createBadge(song.chords || chordNames.join(" · ") || "-")}
          ${createBadge(song.capo || "No Capo")}
          ${createBadge(song.tempo || "-")}
          ${createBadge(`${chordNames.length} Chord${chordNames.length === 1 ? "" : "s"}`)}
        </div>
      </a>
    `;
  }).join("");

  if (songs.length === 0) grid.innerHTML = `<p class="muted">No song found.</p>`;
}

function renderHomePage() {
  const latestGrid = document.querySelector("#latestSongsGrid") || document.querySelector("#songGrid");
  if (!latestGrid) return;

  const latestSongs = allSongs.slice(0, 5);
  renderSongCards(`#${latestGrid.id}`, latestSongs, true);
}

function renderSongsPage() {
  const grid = document.querySelector("#allSongsGrid") || document.querySelector("#songGrid");
  const levelFilter = document.querySelector("#levelFilter");
  const chordFilter = document.querySelector("#chordFilter");

  if (!grid || !levelFilter || !chordFilter) return;

  const allChordNames = [...new Set(allSongs.flatMap(getChordNamesFromSong))].sort();
  chordFilter.innerHTML = `<option value="all">All Chords</option>` +
    allChordNames.map(chord => `<option value="${chord}">${chord}</option>`).join("");

  function renderFilteredSongs() {
    const level = levelFilter.value;
    const chord = chordFilter.value;

    const filtered = allSongs.filter(song => {
      const chordNames = getChordNamesFromSong(song);
      const matchesLevel = level === "all" || song.level === level;
      const matchesChord = chord === "all" || chordNames.includes(chord);
      return matchesLevel && matchesChord;
    });

    renderSongCards(`#${grid.id}`, filtered);
  }

  levelFilter.addEventListener("change", renderFilteredSongs);
  chordFilter.addEventListener("change", renderFilteredSongs);
  renderFilteredSongs();
}

function renderChordLibraryPage() {
  const grid = document.querySelector("#chordLibraryGrid");
  if (!grid) return;

  renderCategoryButtons();

  const title = document.querySelector("#chordCategoryTitle");
  if (title) title.textContent = "All Chords";

  renderChordGrid("#chordLibraryGrid", getChordsByCategory("all"));
}

function getSongById(id) {
  return allSongs.find(song => song.id === id);
}

function renderTab(tab) {
  if (!tab || !tab.systems || tab.systems.length === 0) return "";

  return tab.systems.map(system => {
    const title = system.title
      ? `<p class="tab-title">${escapeHtml(system.title)}</p>`
      : "";

    if (system.builder) {

      const chords =
        system.builder.chords
          ? system.builder.chords.split(/\s+/)
          : [];

      const numbers =
        system.builder.numbers
          ? system.builder.numbers.split(/\s+/)
          : [];

      const lyrics =
        system.builder.lyrics
          ? system.builder.lyrics.split(/\s+/)
          : [];

      const total =
        Math.max(chords.length, numbers.length, lyrics.length);

      return `
        ${title}

        <div class="tab-builder">

          <div class="tab-builder-row chords">
            ${chords.map(ch =>
              `<span class="tab-item chord">${ch}</span>`
            ).join("")}
          </div>

          <div class="tab-builder-row numbers">
            ${numbers.map(n =>
              `<span class="tab-item number">${n}</span>`
            ).join("")}
          </div>

          <div class="tab-builder-row lyrics">
            ${lyrics.map(w =>
              `<span class="tab-item lyric">${w}</span>`
            ).join("")}
          </div>

        </div>
      `;
    }

    const lines =
      Array.isArray(system.lines)
        ? system.lines.join("\n")
        : "";

    return `
      ${title}
      <pre class="tab-staff">${escapeHtml(lines)}</pre>
    `;
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
          <h3>[${section.name}]</h3>
          ${
            section.progression
              ? `<pre class="progression-row">${section.progression.join("\\n")}</pre>`
              : ""
          }
          ${
            (section.lines || []).map(line => {
              const lyric = line.lyric || "";
              const chordRow = padChordLine(line.chords || [], lyric);
              return `
                <pre class="chord-sheet-line chord-row">${chordRow}</pre>
                <pre class="chord-sheet-line lyric-row">${lyric}</pre>
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

  const formatLabel = song.sheetType === "chord-sheet" ? "Chord Sheet" : "Strumming Grid";

  hero.innerHTML = `
    <h1>${song.title}</h1>
    <p>${song.subtitle || ""}</p>
    <div class="info-grid">
      <div class="info-card"><span>Format</span><strong class="song-format-badge">${formatLabel}</strong></div>
      <div class="info-card"><span>Capo</span><strong>${song.capo || "No Capo"}</strong></div>
      <div class="info-card"><span>Chords</span><strong>${song.chords || "-"}</strong></div>
      <div class="info-card"><span>Time</span><strong>${song.time || "-"}</strong></div>
      <div class="info-card"><span>Tempo</span><strong>${song.tempo || "-"}</strong></div>
      <div class="info-card"><span>Key</span><strong>${song.key || "-"}</strong></div>
      <div class="info-card"><span>Level</span><strong>${song.level || "-"}</strong></div>
    </div>
  `;

  renderChordGrid("#songChordGrid", getChordNamesFromSong(song));

  if (strummingBox) {
    strummingBox.innerHTML = `
      <div class="pattern">${song.strumming?.pattern || "-"}</div>
      <div class="count">${song.strumming?.count || ""}</div>
      <p class="note-text">${song.strumming?.note || ""}</p>
    `;
  }

  if (song.sheetType === "chord-sheet") {
    sheet.innerHTML = renderChordSheetSections(song);
  } else {
    sheet.innerHTML = renderGridSheet(song);
  }

  const renderedTab = renderTab(song.tab);
  if (renderedTab && tabBox && tabSection) {
    tabBox.innerHTML = renderedTab;
    tabSection.classList.remove("hidden");
  } else if (tabSection) {
    tabSection.classList.add("hidden");
  }

  if (capoNotes) {
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
            <tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  if (practiceNotes) {
    practiceNotes.innerHTML = `
      <ul class="note-list">
        ${(song.practiceNotes || []).map(note => `<li>${note}</li>`).join("")}
      </ul>
    `;
  }
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
