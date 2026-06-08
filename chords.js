const CHORD_LIBRARY = {
  C: {
    name: "C",
    category: "Open Chords",
    frets: ["x", "3", "2", "0", "1", "0"],
    fingers: ["", "3", "2", "", "1", ""],
    startFret: 1
  },
  G: {
    name: "G",
    category: "Open Chords",
    frets: ["3", "2", "0", "0", "0", "3"],
    fingers: ["2", "1", "", "", "", "3"],
    startFret: 1
  },
  A: {
    name: "A",
    category: "Open Chords",
    frets: ["x", "0", "2", "2", "2", "0"],
    fingers: ["", "", "1", "2", "3", ""],
    startFret: 1
  },
  D: {
    name: "D",
    category: "Open Chords",
    frets: ["x", "x", "0", "2", "3", "2"],
    fingers: ["", "", "", "1", "3", "2"],
    startFret: 1
  },
  E: {
    name: "E",
    category: "Open Chords",
    frets: ["0", "2", "2", "1", "0", "0"],
    fingers: ["", "2", "3", "1", "", ""],
    startFret: 1
  },
  Am: {
    name: "Am",
    category: "Minor Chords",
    frets: ["x", "0", "2", "2", "1", "0"],
    fingers: ["", "", "2", "3", "1", ""],
    startFret: 1
  },
  Em: {
    name: "Em",
    category: "Minor Chords",
    frets: ["0", "2", "2", "0", "0", "0"],
    fingers: ["", "2", "3", "", "", ""],
    startFret: 1
  },
  Dm: {
    name: "Dm",
    category: "Minor Chords",
    frets: ["x", "x", "0", "2", "3", "1"],
    fingers: ["", "", "", "2", "3", "1"],
    startFret: 1
  },
  EasyF: {
    name: "Easy F",
    aliases: ["F easy", "FEasy", "EasyF", "F_Easy"],
    category: "F Variations",
    frets: ["x", "x", "3", "2", "1", "1"],
    fingers: ["", "", "3", "2", "1", "1"],
    startFret: 1
  },
  FMaj7: {
    name: "FMaj7",
    aliases: ["Fmaj7", "Fmaj"],
    category: "F Variations",
    frets: ["x", "x", "3", "2", "1", "0"],
    fingers: ["", "", "3", "2", "1", ""],
    startFret: 1
  },
  F: {
    name: "F",
    category: "F Variations",
    frets: ["1", "3", "3", "2", "1", "1"],
    fingers: ["1", "3", "4", "2", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  Fm: {
    name: "Fm",
    category: "F Variations",
    frets: ["1", "3", "3", "1", "1", "1"],
    fingers: ["1", "3", "4", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  }
};
