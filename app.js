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

function renderHomePage() {
  const grid = document.querySelector("#songGrid");
  const searchInput = document.querySelector("#searchInput");
  const levelFilter = document.querySelector("#levelFilter");

  if (!grid) return;

  function renderList() {
    const keyword = searchInput.value.toLowerCase().trim();
    const level = levelFilter.value;

    const filteredSongs = allSongs.filter(song => {
      const searchable = `${song.title} ${song.subtitle} ${song.chords} ${song.language} ${song.level}`.toLowerCase();
      const matchesKeyword = searchable.includes(keyword);
      const matchesLevel = level === "all" || song.level === level;
      return matchesKeyword && matchesLevel;
    });

    grid.innerHTML = filteredSongs.map(song => `
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
    `).join("");

    if (filteredSongs.length === 0) {
      grid.innerHTML = `<p class="muted">No song found.</p>`;
    }
  }

  searchInput.addEventListener("input", renderList);
  levelFilter.addEventListener("change", renderList);
  renderList();
}

function getSongById(id) {
  return allSongs.find(song => song.id === id);
}

function renderTab(tab) {
  if (!tab || !tab.systems || tab.systems.length === 0) return "";

  return tab.systems.map((system, index) => {
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
    renderSongPage();
  } catch (error) {
    console.error(error);
    showStatus(error.message, "error");
  }
}

start();
