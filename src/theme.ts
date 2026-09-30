// src/theme.ts
// Brand: pink background, white UI. Display font falls back to Georgia/serif on web.

export const theme = {
  colors: {
    bg: "#FCE2F7",
    white: "#FFFFFF",
    ink: "#3A2438",
    inkSoft: "#6B5468",
    accent: "#C4499B",
    accentDeep: "#9E3A7C",
    line: "#F0C7E8",
    correct: "#E3F5E6",
    correctText: "#2F8A4A",
    incorrect: "#FBE4E8",
    incorrectText: "#C23A52",
  },
  fonts: {
    // Amatic SC when loaded; Georgia looks similar on web without extra setup
    display: "Amatic SC, Georgia, serif",
    body: "System",
  },
};
