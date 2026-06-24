// ============================================
// SumiWire PRO — Color Harmony Engine
// Generate palettes by mood using color theory
// ============================================

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const MOOD_PROFILES = {
  calm: {
    name: 'Calme',
    icon: '🌊',
    hueBase: [190, 220],
    satRange: [25, 50],
    lightRange: [55, 80],
  },
  rage: {
    name: 'Rage',
    icon: '🔥',
    hueBase: [0, 20],
    satRange: [75, 100],
    lightRange: [35, 55],
  },
  melancholy: {
    name: 'Mélancolie',
    icon: '🌧️',
    hueBase: [220, 260],
    satRange: [20, 40],
    lightRange: [30, 50],
  },
  joy: {
    name: 'Joie',
    icon: '☀️',
    hueBase: [40, 65],
    satRange: [65, 90],
    lightRange: [60, 80],
  },
  horror: {
    name: 'Horreur',
    icon: '💀',
    hueBase: [280, 320],
    satRange: [30, 55],
    lightRange: [15, 35],
  },
  romance: {
    name: 'Romance',
    icon: '💕',
    hueBase: [330, 355],
    satRange: [45, 70],
    lightRange: [60, 80],
  },
  cyberpunk: {
    name: 'Cyberpunk',
    icon: '⚡',
    hueBase: [175, 195],
    satRange: [80, 100],
    lightRange: [45, 65],
  },
  nature: {
    name: 'Nature',
    icon: '🌿',
    hueBase: [90, 140],
    satRange: [35, 65],
    lightRange: [40, 65],
  },
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generate a 5-color harmony palette for a given mood.
 * @param {string} mood - Key from MOOD_PROFILES
 * @returns {string[]} Array of 5 hex colors
 */
export function generateHarmonyPalette(mood) {
  const profile = MOOD_PROFILES[mood];
  if (!profile) return ['#000000', '#333333', '#666666', '#999999', '#cccccc'];

  const baseHue = rand(profile.hueBase[0], profile.hueBase[1]);
  const baseSat = rand(profile.satRange[0], profile.satRange[1]);
  const baseLight = rand(profile.lightRange[0], profile.lightRange[1]);

  return [
    // Base color
    hslToHex(baseHue, baseSat, baseLight),
    // Analogous (close neighbor)
    hslToHex(baseHue + 25, baseSat * 0.9, baseLight * 0.95),
    // Analogous opposite
    hslToHex(baseHue - 20, baseSat * 0.85, baseLight * 1.1),
    // Complementary (opposite hue)
    hslToHex(baseHue + 180, baseSat * 0.7, baseLight * 0.8),
    // Triadic accent
    hslToHex(baseHue + 120, baseSat * 0.6, baseLight * 0.9),
  ];
}

export { MOOD_PROFILES };
