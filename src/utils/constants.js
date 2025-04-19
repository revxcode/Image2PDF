// Paper size presets (in pixels)
export const PAPER_SIZES = {
  A4: { width: 595, height: 842 },
  A5: { width: 420, height: 595 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 },
};

// Margin presets
export const MARGIN_PRESETS = {
  NONE: { top: 0, right: 0, bottom: 0, left: 0 },
  NARROW: { top: 20, right: 20, bottom: 20, left: 20 },
  MODERATE: { top: 40, right: 40, bottom: 40, left: 40 },
  WIDE: { top: 60, right: 60, bottom: 60, left: 60 },
  MIRROR: { top: 40, right: 60, bottom: 40, left: 20 }, // For bound printing
};
