const CHORD_LIBRARY = {
  C: {
    name: "C",
    category: ["Main Chords", "Open Chords"],
    frets: ["x", "3", "2", "0", "1", "0"],
    fingers: ["", "3", "2", "", "1", ""],
    startFret: 1
  },
  G: {
    name: "G",
    category: ["Main Chords", "Open Chords"],
    frets: ["3", "2", "0", "0", "0", "3"],
    fingers: ["2", "1", "", "", "", "3"],
    startFret: 1
  },
  A: {
    name: "A",
    category: ["Main Chords", "Open Chords"],
    frets: ["x", "0", "2", "2", "2", "0"],
    fingers: ["", "", "1", "2", "3", ""],
    startFret: 1
  },
  D: {
    name: "D",
    category: ["Main Chords", "Open Chords"],
    frets: ["x", "x", "0", "2", "3", "2"],
    fingers: ["", "", "", "1", "3", "2"],
    startFret: 1
  },
  E: {
    name: "E",
    category: ["Main Chords", "Open Chords"],
    frets: ["0", "2", "2", "1", "0", "0"],
    fingers: ["", "2", "3", "1", "", ""],
    startFret: 1
  },
  F: {
    name: "F",
    category: ["Main Chords", "F Variations", "Barre Chords"],
    frets: ["1", "3", "3", "2", "1", "1"],
    fingers: ["1", "3", "4", "2", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  EasyF: {
    name: "Easy F",
    aliases: ["F easy", "FEasy", "EasyF", "F_Easy"],
    category: ["F Variations", "Beginner Variations"],
    frets: ["x", "x", "3", "2", "1", "1"],
    fingers: ["", "", "3", "2", "1", "1"],
    startFret: 1
  },
  FMaj7: {
    name: "FMaj7",
    aliases: ["Fmaj7", "Fmaj"],
    category: ["F Variations", "Beginner Variations"],
    frets: ["x", "x", "3", "2", "1", "0"],
    fingers: ["", "", "3", "2", "1", ""],
    startFret: 1
  },
  Am: {
    name: "Am",
    category: ["Main Chords", "Minor Chords", "Open Chords"],
    frets: ["x", "0", "2", "2", "1", "0"],
    fingers: ["", "", "2", "3", "1", ""],
    startFret: 1
  },
  Em: {
    name: "Em",
    category: ["Main Chords", "Minor Chords", "Open Chords"],
    frets: ["0", "2", "2", "0", "0", "0"],
    fingers: ["", "2", "3", "", "", ""],
    startFret: 1
  },
  Dm: {
    name: "Dm",
    category: ["Main Chords", "Minor Chords", "Open Chords"],
    frets: ["x", "x", "0", "2", "3", "1"],
    fingers: ["", "", "", "2", "3", "1"],
    startFret: 1
  },
  Fm: {
    name: "Fm",
    aliases: ["Fm Barre", "F minor"],
    category: ["Minor Chords", "F Variations", "Fm Variations", "Barre Chords"],
    frets: ["1", "3", "3", "1", "1", "1"],
    fingers: ["1", "3", "4", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  EasyFm: {
    name: "Easy Fm",
    aliases: ["Fm Easy", "EasyFm", "F_m_Easy"],
    category: ["Fm Variations", "Beginner Variations"],
    frets: ["x", "x", "3", "1", "1", "1"],
    fingers: ["", "", "3", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 3, toString: 5 }
  },
  B: {
    name: "B",
    aliases: ["B Barre"],
    category: ["Main Chords", "B Variations", "Barre Chords"],
    frets: ["x", "2", "4", "4", "4", "2"],
    fingers: ["", "1", "3", "3", "3", "1"],
    startFret: 1,
    barre: { fret: 2, fromString: 1, toString: 5 }
  },
  B7: {
    name: "B7",
    aliases: ["Easy B", "B Easy"],
    category: ["B Variations", "Beginner Variations", "Open Chords"],
    frets: ["x", "2", "1", "2", "0", "2"],
    fingers: ["", "2", "1", "3", "", "4"],
    startFret: 1
  },
  Bm: {
    name: "Bm",
    aliases: ["Bm Barre", "B minor"],
    category: ["Minor Chords", "B Variations", "Bm Variations", "Barre Chords"],
    frets: ["x", "2", "4", "4", "3", "2"],
    fingers: ["", "1", "3", "4", "2", "1"],
    startFret: 1,
    barre: { fret: 2, fromString: 1, toString: 5 }
  },
  EasyBm: {
    name: "Easy Bm",
    aliases: ["Bm Easy", "EasyBm"],
    category: ["Bm Variations", "B Variations", "Beginner Variations"],
    frets: ["x", "x", "4", "4", "3", "2"],
    fingers: ["", "", "3", "4", "2", "1"],
    startFret: 1
  },
  Bm7: {
    name: "Bm7",
    aliases: ["Easy Bm7"],
    category: ["Bm Variations", "B Variations", "Beginner Variations"],
    frets: ["x", "2", "0", "2", "0", "2"],
    fingers: ["", "1", "", "2", "", "3"],
    startFret: 1
  }
};
