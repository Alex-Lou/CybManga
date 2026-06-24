// ============================================
// SumiWire PRO - Générateur de curseur de sélection SVG (pur)
// ============================================

export const getSelectionCursor = (isDark) => {
  const fill = isDark ? '#ffffff' : '#000000';
  const stroke = isDark ? '#000000' : '#ffffff';

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L11 28L16 17L26 15L2 2Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `.trim();

  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') 0 0, auto`;
};
