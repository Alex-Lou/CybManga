// ============================================
// SumiWire PRO - Constantes : bulles & polices
// ============================================

// === BUBBLE TYPES ===
export const BUBBLE_TYPES = {
  'speech': {
    name: 'Dialogue',
    icon: '💬',
    defaults: {
      fontFamily: "'Comic Neue', cursive",
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 3,
    }
  },
  'thought': {
    name: 'Pensée',
    icon: '💭',
    defaults: {
      fontFamily: "'Comic Neue', cursive",
      fontSize: 15,
      fontWeight: 'normal',
      fontStyle: 'italic',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'shout': {
    name: 'Cri',
    icon: '💥',
    defaults: {
      fontFamily: "'Bangers', cursive",
      fontSize: 22,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
    }
  },
  'whisper': {
    name: 'Murmure',
    icon: '🤫',
    defaults: {
      fontFamily: "'Patrick Hand', cursive",
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'italic',
      backgroundColor: '#ffffff',
      borderColor: '#666666',
      borderWidth: 1.5,
    }
  },
  'narration': {
    name: 'Narration',
    icon: '📜',
    defaults: {
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#fef9c3',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'radio': {
    name: 'Radio/TV',
    icon: '📻',
    defaults: {
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'robot': {
    name: 'Robot/IA',
    icon: '🤖',
    defaults: {
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#e5e7eb',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'chant': {
    name: 'Chant',
    icon: '🎵',
    defaults: {
      fontFamily: "'Gloria Hallelujah', cursive",
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
};

// === FONTS ===
export const FONTS = [
  { name: 'Comic Neue', value: "'Comic Neue', cursive" },
  { name: 'Bangers', value: "'Bangers', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
  { name: 'Indie Flower', value: "'Indie Flower', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" },
  { name: 'Gloria Hallelujah', value: "'Gloria Hallelujah', cursive" },
  { name: 'Amatic SC', value: "'Amatic SC', cursive" },
  { name: 'Kranky', value: "'Kranky', cursive" },
  { name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
  { name: 'M PLUS Rounded 1c', value: "'M PLUS Rounded 1c', sans-serif" },
  { name: 'Kosugi Maru', value: "'Kosugi Maru', sans-serif" },
  { name: 'Arial', value: 'Arial, sans-serif' },
];

// === DEFAULT BUBBLE ===
export const DEFAULT_BUBBLE = {
  type: 'speech',
  x: 100,
  y: 100,
  width: 180,
  height: 100,
  tailAngle: 180,
  tailLength: 40,
  tailWidth: 20,
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: 3,
  zIndex: 10,
  text: '',
  textOffsetX: 0,
  textOffsetY: 0,
  textLocked: true,
  fontSize: 16,
  fontFamily: "'Comic Neue', cursive",
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  textColor: '#000000',
  lineHeight: 1.3,
  autoSize: true,
};
