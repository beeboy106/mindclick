// Cross Bubble uses an explicit in-app palette. It intentionally does not
// follow the device color scheme, so Android/iPad dark-mode changes cannot
// leave part of the experience with unreadable mixed colors.
export const CROSS_BUBBLE_THEMES = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "สีเดียวกับ Mindclick ปกติ",
    canvas: "#f8fafc",
    surface: "#ffffff",
    ink: "#17171c",
    muted: "#64748b",
    border: "#dbe3ea",
    accent: "#84cc16",
    accentSoft: "#ecfccb",
    statusBar: "dark-content",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    description: "ฟ้าเขียว สงบและอ่านง่าย",
    canvas: "#f0fdfa",
    surface: "#ffffff",
    ink: "#12343b",
    muted: "#527177",
    border: "#bfe5df",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    statusBar: "dark-content",
  },
  violet: {
    id: "violet",
    label: "Violet",
    description: "ม่วงหม่น มีบรรยากาศแต่ไม่ฉูดฉาด",
    canvas: "#f7f5ff",
    surface: "#ffffff",
    ink: "#30254d",
    muted: "#6e6485",
    border: "#ded8f1",
    accent: "#6d4aff",
    accentSoft: "#ede9fe",
    statusBar: "dark-content",
  },
  coral: {
    id: "coral",
    label: "Coral",
    description: "ส้มอิฐ อบอุ่นและเป็นกันเอง",
    canvas: "#fff7f2",
    surface: "#ffffff",
    ink: "#44271f",
    muted: "#7c6259",
    border: "#f0d6ca",
    accent: "#d65d42",
    accentSoft: "#ffe1d6",
    statusBar: "dark-content",
  },
};

export const DEFAULT_CROSS_BUBBLE_THEME_ID = "classic";
