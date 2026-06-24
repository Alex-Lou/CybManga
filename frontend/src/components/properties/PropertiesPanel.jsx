// ============================================
// SumiWire PRO - Properties Panel
// Advanced Edition (Geometry, Style, Image)
// ============================================

import React, { useCallback, useRef, useState } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { PROPERTIES, cn } from '../../styles/tailwind';
import { PANEL_TYPES, BUBBLE_TYPES, FONTS } from '../../utils/constants';
import { readFileAsDataURL } from '../../utils/helpers';

// Petite aide pour convertir PX <-> CM pour l'affichage
// 1 inch = 2.54 cm = 96 px (standard web) => 1 cm ≈ 37.79 px
const PX_PER_CM = 37.7952755906;

const toCM = (px) => (px / PX_PER_CM).toFixed(2);
const toPX = (cm) => Math.round(parseFloat(cm) * PX_PER_CM);

const InputRow = ({ label, children }) => (
  <div className={PROPERTIES.row}>
    <span className={PROPERTIES.label}>{label}</span>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className={PROPERTIES.section}>
    <div className={PROPERTIES.sectionTitle}>{title}</div>
    {children}
  </div>
);

const PropertiesPanel = () => {
  const { state, dispatch, currentPage, theme } = useStudio();
  const fileInputRef = useRef(null);
  const bubbleFileInputRef = useRef(null); // Nouveau ref pour les bulles
  const [unit, setUnit] = useState('px'); // 'px' ou 'cm'

  const selectedPanel = currentPage?.panels.find(p => state.selectedPanelIds.includes(p.id));
  const selectedBubble = currentPage?.bubbles.find(b => state.selectedBubbleIds.includes(b.id));
  
  const updatePanel = useCallback((updates) => {
    if (!selectedPanel) return;
    dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: selectedPanel.id, updates } });
  }, [selectedPanel, dispatch]);
  
  const updateBubble = useCallback((updates) => {
    if (!selectedBubble) return;
    dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: selectedBubble.id, updates } });
  }, [selectedBubble, dispatch]);

  // --- GESTION IMAGE CASE ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPanel) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = new Image();
      img.onload = () => {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const scale = Math.min(selectedPanel.width / imgW, selectedPanel.height / imgH);
        updatePanel({
          image: dataUrl,
          imageScaleX: scale,
          imageScaleY: scale,
          imageX: 0,
          imageY: 0,
          originalImageWidth: imgW,
          originalImageHeight: imgH,
          imageOpacity: 1, // Reset opacity
        });
      };
      img.src = dataUrl;
    } catch (err) { console.error(err); }
    e.target.value = '';
  };

  // --- GESTION IMAGE BULLE (NOUVEAU) ---
  const handleBubbleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBubble) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = new Image();
      img.onload = () => {
        // On adapte l'échelle pour que l'image rentre dans la bulle
        const scale = Math.min(selectedBubble.width / img.naturalWidth, selectedBubble.height / img.naturalHeight);
        updateBubble({ 
            image: dataUrl, 
            imageScaleX: scale, 
            imageScaleY: scale, 
            imageX: 0, 
            imageY: 0, 
            originalImageWidth: img.naturalWidth, 
            originalImageHeight: img.naturalHeight,
            imageOpacity: 1
        });
      };
      img.src = dataUrl;
    } catch (err) { console.error(err); }
    e.target.value = '';
  };

  const handleDelete = () => {
    if (selectedPanel) dispatch({ type: ACTIONS.DELETE_PANELS, payload: [selectedPanel.id] });
    if (selectedBubble) dispatch({ type: ACTIONS.DELETE_BUBBLES, payload: [selectedBubble.id] });
  };

  // --- RENDU VIDE ---
  if (!selectedPanel && !selectedBubble) {
    return (
      <aside className={PROPERTIES.container} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
        <div className={PROPERTIES.header} style={{ borderColor: theme.border }}>Propriétés</div>
        <div className={PROPERTIES.content}>
          <p className="text-sm opacity-50 text-center py-8">Sélectionnez un élément</p>
        </div>
      </aside>
    );
  }
  
  // ==============================================
  // ÉDITION DE CASE (PANEL)
  // ==============================================
  if (selectedPanel) {
    return (
      <aside className={PROPERTIES.container} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
        <div className={PROPERTIES.header} style={{ borderColor: theme.border }}>
            <span>⬜ Case</span>
            <div className="flex rounded p-0.5 ml-auto" style={{ backgroundColor: theme.bg }}>
                <button onClick={() => setUnit('px')} className={cn("text-[10px] px-2 rounded transition-colors", unit === 'px' ? "shadow" : "")}
                  style={{ backgroundColor: unit === 'px' ? theme.surface : 'transparent', color: unit === 'px' ? theme.text : theme.textSecondary }}>PX</button>
                <button onClick={() => setUnit('cm')} className={cn("text-[10px] px-2 rounded transition-colors", unit === 'cm' ? "shadow" : "")}
                  style={{ backgroundColor: unit === 'cm' ? theme.surface : 'transparent', color: unit === 'cm' ? theme.text : theme.textSecondary }}>CM</button>
            </div>
        </div>

        <div className={PROPERTIES.content}>
          
          <Section title="Géométrie">
             <div className="grid grid-cols-2 gap-2 mb-2">
                <InputRow label={`X (${unit})`}>
                    <input type="number" className={PROPERTIES.inputSmall} value={unit === 'px' ? Math.round(selectedPanel.x) : toCM(selectedPanel.x)} onChange={(e) => updatePanel({ x: unit === 'px' ? parseInt(e.target.value) : toPX(e.target.value) })} />
                </InputRow>
                <InputRow label={`Y (${unit})`}>
                    <input type="number" className={PROPERTIES.inputSmall} value={unit === 'px' ? Math.round(selectedPanel.y) : toCM(selectedPanel.y)} onChange={(e) => updatePanel({ y: unit === 'px' ? parseInt(e.target.value) : toPX(e.target.value) })} />
                </InputRow>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <InputRow label={`L (${unit})`}>
                    <input type="number" className={PROPERTIES.inputSmall} value={unit === 'px' ? Math.round(selectedPanel.width) : toCM(selectedPanel.width)} onChange={(e) => updatePanel({ width: unit === 'px' ? parseInt(e.target.value) : toPX(e.target.value) })} />
                </InputRow>
                <InputRow label={`H (${unit})`}>
                    <input type="number" className={PROPERTIES.inputSmall} value={unit === 'px' ? Math.round(selectedPanel.height) : toCM(selectedPanel.height)} onChange={(e) => updatePanel({ height: unit === 'px' ? parseInt(e.target.value) : toPX(e.target.value) })} />
                </InputRow>
             </div>
          </Section>

          <Section title="Apparence">
            <InputRow label="Fond">
                <div className="flex gap-2 w-full">
                    <input type="color" className={PROPERTIES.colorInput} value={selectedPanel.backgroundColor || '#ffffff'} onChange={(e) => updatePanel({ backgroundColor: e.target.value })} />
                    <input type="range" min="0" max="1" step="0.1" title="Opacité du fond" value={selectedPanel.backgroundOpacity !== undefined ? selectedPanel.backgroundOpacity : 1} onChange={(e) => updatePanel({ backgroundOpacity: parseFloat(e.target.value) })} className="flex-1" />
                </div>
            </InputRow>
            <div className="border-t my-2" style={{borderColor: theme.border}}></div>
            <InputRow label="Bordure"><input type="color" className={PROPERTIES.colorInput} value={selectedPanel.borderColor || '#000000'} onChange={(e) => updatePanel({ borderColor: e.target.value })} /></InputRow>
            <InputRow label="Épaisseur"><input type="number" className={PROPERTIES.inputSmall} value={selectedPanel.borderWidth || 1} onChange={(e) => updatePanel({ borderWidth: parseInt(e.target.value) })} /></InputRow>
            <InputRow label="Style">
               <select className={PROPERTIES.select} value={selectedPanel.borderStyle || 'solid'} onChange={(e) => updatePanel({ borderStyle: e.target.value })}>
                  <option value="solid">Trait continu</option>
                  <option value="dashed">Tirets</option>
                  <option value="dotted">Pointillés</option>
                  <option value="none">Aucune</option>
               </select>
            </InputRow>
          </Section>

          <Section title="Forme">
            <select className={PROPERTIES.select} value={selectedPanel.type} onChange={(e) => updatePanel({ type: e.target.value })} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
              {Object.entries(PANEL_TYPES).map(([key, type]) => (<option key={key} value={key}>{type.icon} {type.name}</option>))}
            </select>
          </Section>

          <Section title="Image">
            <button className={cn(PROPERTIES.button, "w-full mb-2")} onClick={() => fileInputRef.current?.click()}>
              {selectedPanel.image ? 'Changer l\'image' : 'Importer une image'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            
            {selectedPanel.image && (
              <div className="space-y-2 mt-2">
                 <div className="flex justify-between text-xs opacity-70">
                    <span>Pos X/Y</span>
                    <span className="text-[10px] cursor-pointer text-blue-500" onClick={() => updatePanel({ imageX: 0, imageY: 0 })}>Reset</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <input type="number" className={PROPERTIES.inputSmall} value={Math.round(selectedPanel.imageX || 0)} onChange={(e) => updatePanel({ imageX: parseInt(e.target.value) })} />
                    <input type="number" className={PROPERTIES.inputSmall} value={Math.round(selectedPanel.imageY || 0)} onChange={(e) => updatePanel({ imageY: parseInt(e.target.value) })} />
                 </div>
                 <div className="flex justify-between text-xs opacity-70 mt-2">
                    <span>Échelle</span>
                    <span className="text-[10px] cursor-pointer text-blue-500" onClick={() => {
                        const scale = Math.min(selectedPanel.width / selectedPanel.originalImageWidth, selectedPanel.height / selectedPanel.originalImageHeight);
                        updatePanel({ imageScaleX: scale, imageScaleY: scale });
                    }}>Fit</span>
                 </div>
                 <input type="range" min="0.1" max="5" step="0.1" value={selectedPanel.imageScaleX || 1} onChange={(e) => { const s = parseFloat(e.target.value); updatePanel({ imageScaleX: s, imageScaleY: s }); }} className="w-full" />
                 <div className="text-xs opacity-70 mt-2">Opacité Image</div>
                 <input type="range" min="0" max="1" step="0.1" value={selectedPanel.imageOpacity !== undefined ? selectedPanel.imageOpacity : 1} onChange={(e) => updatePanel({ imageOpacity: parseFloat(e.target.value) })} className="w-full" />
              </div>
            )}
          </Section>
          
          <button className={cn(PROPERTIES.button, 'w-full mt-6 text-red-500 border-red-500 hover:bg-red-50')} onClick={handleDelete}>
            🗑️ Supprimer la case
          </button>
        </div>
      </aside>
    );
  }
  
  // ==============================================
  // ÉDITION DE BULLE (BUBBLE) - VERSION COMPLÈTE
  // ==============================================
  if (selectedBubble) {
    return (
      <aside className={PROPERTIES.container} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
        <div className={PROPERTIES.header} style={{ borderColor: theme.border }}>💬 Bulle</div>
        <div className={PROPERTIES.content}>
          
          <Section title="Type">
            <div className="grid grid-cols-4 gap-1 mb-1">
              {Object.entries(BUBBLE_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => updateBubble({ type: key })}
                  className={cn("flex flex-col items-center p-2 rounded border transition-all", selectedBubble.type === key ? "" : "border-transparent opacity-60 hover:opacity-100")}
                  style={selectedBubble.type === key ? { borderColor: theme.primary, backgroundColor: `${theme.primary}15`, color: theme.primary } : {}}
                  title={config.name}
                >
                  <span className="text-xl">{config.icon}</span>
                </button>
              ))}
            </div>
          </Section>
          
          <Section title="Apparence">
            <InputRow label="Queue (°) ">
              <input type="range" min="0" max="360" value={selectedBubble.tailAngle !== undefined ? selectedBubble.tailAngle : 180} onChange={(e) => updateBubble({ tailAngle: parseInt(e.target.value) })} className="w-full" />
            </InputRow>
            <InputRow label="Bordure">
              <input type="color" className={PROPERTIES.colorInput} value={selectedBubble.borderColor} onChange={(e) => updateBubble({ borderColor: e.target.value })} />
            </InputRow>
            <InputRow label="Fond">
              <input type="color" className={PROPERTIES.colorInput} value={selectedBubble.backgroundColor} onChange={(e) => updateBubble({ backgroundColor: e.target.value })} />
            </InputRow>
            <InputRow label="Épaisseur">
               <input type="number" className={PROPERTIES.inputSmall} value={selectedBubble.borderWidth} onChange={(e) => updateBubble({ borderWidth: parseInt(e.target.value) })} />
            </InputRow>
          </Section>

          {/* --- NOUVELLE SECTION IMAGE POUR BULLE --- */}
          <Section title="Image / Contenu">
            <button className={cn(PROPERTIES.button, "w-full mb-2")} onClick={() => bubbleFileInputRef.current?.click()}>
              {selectedBubble.image ? 'Changer l\'image' : 'Ajouter une image'}
            </button>
            <input ref={bubbleFileInputRef} type="file" accept="image/*" onChange={handleBubbleImageUpload} className="hidden" />
            
            {selectedBubble.image && (
                <div className="space-y-2 mt-2 border-t pt-2 border-dashed border-gray-300">
                    <div className="flex justify-between text-xs opacity-70">
                        <span>Opacité Image</span>
                        <span className="text-[10px] cursor-pointer text-red-500" onClick={() => updateBubble({ image: null })}>Supprimer</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={selectedBubble.imageOpacity !== undefined ? selectedBubble.imageOpacity : 1} onChange={(e) => updateBubble({ imageOpacity: parseFloat(e.target.value) })} className="w-full" />
                    <div className="text-[10px] text-gray-500 italic text-center">Double-cliquez sur la bulle pour ajuster l'image</div>
                </div>
            )}
          </Section>

          <Section title="Texte">
            <textarea
              id="properties-bubble-text"
              className={cn(PROPERTIES.input, "w-full mb-2 font-sans")}
              value={selectedBubble.text || ''}
              onChange={(e) => updateBubble({ text: e.target.value })}
              rows={3}
              placeholder="Écrivez votre texte ici..."
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            />
            <div className="flex gap-1 mb-3">
              <button onClick={() => updateBubble({ fontWeight: selectedBubble.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={cn("flex-1 p-1 border rounded text-xs font-bold transition-colors", selectedBubble.fontWeight === 'bold' ? "bg-blue-100 border-blue-400 text-blue-700" : "")}
                style={selectedBubble.fontWeight !== 'bold' ? { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border } : {}}>B</button>
              <button onClick={() => updateBubble({ fontStyle: selectedBubble.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={cn("flex-1 p-1 border rounded text-xs italic transition-colors", selectedBubble.fontStyle === 'italic' ? "bg-blue-100 border-blue-400 text-blue-700" : "")}
                style={selectedBubble.fontStyle !== 'italic' ? { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border } : {}}>I</button>
              <button onClick={() => updateBubble({ textDecoration: selectedBubble.textDecoration === 'underline' ? 'none' : 'underline' })}
                className={cn("flex-1 p-1 border rounded text-xs underline transition-colors", selectedBubble.textDecoration === 'underline' ? "bg-blue-100 border-blue-400 text-blue-700" : "")}
                style={selectedBubble.textDecoration !== 'underline' ? { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border } : {}}>U</button>
              <div className="w-[1px] mx-1" style={{ backgroundColor: theme.border }}></div>
              <button onClick={() => updateBubble({ textAlign: 'left' })} className={cn("flex-1 p-1 border rounded text-[10px] transition-colors", selectedBubble.textAlign === 'left' ? "bg-blue-100 border-blue-400 text-blue-700" : "")} style={{ backgroundColor: selectedBubble.textAlign === 'left' ? undefined : theme.bg, color: selectedBubble.textAlign === 'left' ? undefined : theme.text, borderColor: selectedBubble.textAlign === 'left' ? undefined : theme.border }}>☰</button>
              <button onClick={() => updateBubble({ textAlign: 'center' })} className={cn("flex-1 p-1 border rounded text-[10px] transition-colors", selectedBubble.textAlign === 'center' ? "bg-blue-100 border-blue-400 text-blue-700" : "")} style={{ backgroundColor: selectedBubble.textAlign === 'center' ? undefined : theme.bg, color: selectedBubble.textAlign === 'center' ? undefined : theme.text, borderColor: selectedBubble.textAlign === 'center' ? undefined : theme.border }}>⫼</button>
              <button onClick={() => updateBubble({ textAlign: 'right' })} className={cn("flex-1 p-1 border rounded text-[10px] transition-colors", selectedBubble.textAlign === 'right' ? "bg-blue-100 border-blue-400 text-blue-700" : "")} style={{ backgroundColor: selectedBubble.textAlign === 'right' ? undefined : theme.bg, color: selectedBubble.textAlign === 'right' ? undefined : theme.text, borderColor: selectedBubble.textAlign === 'right' ? undefined : theme.border }}>☰</button>
            </div>
            <InputRow label="Police">
              <select className={PROPERTIES.select} value={selectedBubble.fontFamily} onChange={(e) => updateBubble({ fontFamily: e.target.value })}>
                {FONTS.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
              </select>
            </InputRow>
            <InputRow label="Taille">
              <input type="number" className={PROPERTIES.inputSmall} value={selectedBubble.fontSize} onChange={(e) => updateBubble({ fontSize: parseInt(e.target.value) })} />
            </InputRow>
            <InputRow label="Couleur">
              <input type="color" className={PROPERTIES.colorInput} value={selectedBubble.textColor || '#000000'} onChange={(e) => updateBubble({ textColor: e.target.value })} />
            </InputRow>
          </Section>
          
          <button className={cn(PROPERTIES.button, 'w-full mt-6 text-red-500 border-red-500 hover:bg-red-50')} onClick={handleDelete}>
            🗑️ Supprimer la bulle
          </button>
        </div>
      </aside>
    );
  }
  return null;
};

export default PropertiesPanel;