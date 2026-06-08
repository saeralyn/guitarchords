const CHORD_LIBRARY = {
  C: {
    name: "C",
    category: ["all", "main", "open"],
    frets: ["x", "3", "2", "0", "1", "0"],
    fingers: ["", "3", "2", "", "1", ""],
    startFret: 1
  },
  G: {
    name: "G",
    category: ["all", "main", "open"],
    frets: ["3", "2", "0", "0", "0", "3"],
    fingers: ["2", "1", "", "", "", "3"],
    startFret: 1
  },
  A: {
    name: "A",
    category: ["all", "main", "open"],
    frets: ["x", "0", "2", "2", "2", "0"],
    fingers: ["", "", "1", "2", "3", ""],
    startFret: 1
  },
  D: {
    name: "D",
    category: ["all", "main", "open"],
    frets: ["x", "x", "0", "2", "3", "2"],
    fingers: ["", "", "", "1", "3", "2"],
    startFret: 1
  },
  E: {
    name: "E",
    category: ["all", "main", "open"],
    frets: ["0", "2", "2", "1", "0", "0"],
    fingers: ["", "2", "3", "1", "", ""],
    startFret: 1
  },
  F: {
    name: "F",
    category: ["all", "main", "f-variations", "barre"],
    frets: ["1", "3", "3", "2", "1", "1"],
    fingers: ["1", "3", "4", "2", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  EasyF: {
    name: "Easy F",
    aliases: ["F Easy", "EasyF"],
    category: ["all", "f-variations", "beginner"],
    frets: ["x", "x", "3", "2", "1", "1"],
    fingers: ["", "", "3", "2", "1", "1"],
    startFret: 1
  },
  FMaj7: {
    name: "FMaj7",
    aliases: ["Fmaj7", "Fmaj"],
    category: ["all", "f-variations", "beginner"],
    frets: ["x", "x", "3", "2", "1", "0"],
    fingers: ["", "", "3", "2", "1", ""],
    startFret: 1
  },
  Fm: {
    name: "Fm",
    category: ["all", "minor", "fm-variations", "barre"],
    frets: ["1", "3", "3", "1", "1", "1"],
    fingers: ["1", "3", "4", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  Fm7: {
    name: "Fm7",
    category: ["all", "minor", "fm-variations", "barre"],
    frets: ["1", "3", "1", "1", "1", "1"],
    fingers: ["1", "3", "1", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  Am: {
    name: "Am",
    category: ["all", "minor", "open"],
    frets: ["x", "0", "2", "2", "1", "0"],
    fingers: ["", "", "2", "3", "1", ""],
    startFret: 1
  },
  Em: {
    name: "Em",
    category: ["all", "minor", "open"],
    frets: ["0", "2", "2", "0", "0", "0"],
    fingers: ["", "2", "3", "", "", ""],
    startFret: 1
  },
  Dm: {
    name: "Dm",
    category: ["all", "minor", "open"],
    frets: ["x", "x", "0", "2", "3", "1"],
    fingers: ["", "", "", "2", "3", "1"],
    startFret: 1
  },
  B: {
    name: "B",
    category: ["all", "main", "b-variations", "barre"],
    frets: ["x", "2", "4", "4", "4", "2"],
    fingers: ["", "1", "3", "3", "3", "1"],
    startFret: 1,
    barre: { fret: 2, fromString: 1, toString: 5 }
  },
  B7: {
    name: "B7",
    category: ["all", "b-variations", "beginner"],
    frets: ["x", "2", "1", "2", "0", "2"],
    fingers: ["", "2", "1", "3", "", "4"],
    startFret: 1
  },
  Bm: {
    name: "Bm",
    category: ["all", "minor", "bm-variations", "barre"],
    frets: ["x", "2", "4", "4", "3", "2"],
    fingers: ["", "1", "3", "4", "2", "1"],
    startFret: 1,
    barre: { fret: 2, fromString: 1, toString: 5 }
  },
  EasyBm: {
    name: "Easy Bm",
    aliases: ["Bm Easy", "EasyBm"],
    category: ["all", "minor", "bm-variations", "beginner"],
    frets: ["x", "x", "0", "4", "3", "2"],
    fingers: ["", "", "", "3", "2", "1"],
    startFret: 1
  },
  Bm7: {
    name: "Bm7",
    category: ["all", "minor", "bm-variations", "beginner"],
    frets: ["x", "2", "0", "2", "0", "2"],
    fingers: ["", "1", "", "2", "", "3"],
    startFret: 1
  }
};

const CHORD_CATEGORIES = [
  { id: "all", label: "All Chords" },
  { id: "main", label: "Main Chords" },
  { id: "open", label: "Open Chords" },
  { id: "minor", label: "Minor Chords" },
  { id: "f-variations", label: "F Variations" },
  { id: "fm-variations", label: "Fm Variations" },
  { id: "b-variations", label: "B Variations" },
  { id: "bm-variations", label: "Bm Variations" },
  { id: "barre", label: "Barre Chords" },
  { id: "beginner", label: "Beginner Variations" }
];
