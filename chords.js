const CHORD_LIBRARY = {
  C: {
    name: "C",
    frets: ["x", "3", "2", "0", "1", "0"],
    fingers: ["", "3", "2", "", "1", ""],
    startFret: 1
  },
  G: {
    name: "G",
    frets: ["3", "2", "0", "0", "0", "3"],
    fingers: ["2", "1", "", "", "", "3"],
    startFret: 1
  },
  A: {
    name: "A",
    frets: ["x", "0", "2", "2", "2", "0"],
    fingers: ["", "", "1", "2", "3", ""],
    startFret: 1
  },
  D: {
    name: "D",
    frets: ["x", "x", "0", "2", "3", "2"],
    fingers: ["", "", "", "1", "3", "2"],
    startFret: 1
  },
  E: {
    name: "E",
    frets: ["0", "2", "2", "1", "0", "0"],
    fingers: ["", "2", "3", "1", "", ""],
    startFret: 1
  },
  F: {
    name: "F",
    frets: ["1", "3", "3", "2", "1", "1"],
    fingers: ["1", "3", "4", "2", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  },
  FMaj7: {
    name: "FMaj7",
    aliases: ["Fmaj7", "Fmaj"],
    frets: ["x", "x", "3", "2", "1", "0"],
    fingers: ["", "", "3", "2", "1", ""],
    startFret: 1
  },
  Am: {
    name: "Am",
    frets: ["x", "0", "2", "2", "1", "0"],
    fingers: ["", "", "2", "3", "1", ""],
    startFret: 1
  },
  Em: {
    name: "Em",
    frets: ["0", "2", "2", "0", "0", "0"],
    fingers: ["", "2", "3", "", "", ""],
    startFret: 1
  },
  Dm: {
    name: "Dm",
    frets: ["x", "x", "0", "2", "3", "1"],
    fingers: ["", "", "", "2", "3", "1"],
    startFret: 1
  },
  Fm: {
    name: "Fm",
    frets: ["1", "3", "3", "1", "1", "1"],
    fingers: ["1", "3", "4", "1", "1", "1"],
    startFret: 1,
    barre: { fret: 1, fromString: 0, toString: 5 }
  }
};
