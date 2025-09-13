import React, { useState, useEffect } from 'react';
import { PlusIcon, SlashIcon } from './Icon';

interface ColorPickerProps {
  label: string;
  color: string;
  setColor: (color: string) => void;
  paletteKey: string;
}

// --- Color Conversion Utilities ---
function hexToHsl(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
// --- Component ---

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, setColor, paletteKey }) => {
  const [memoryColors, setMemoryColors] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const MAX_MEMORY_COLORS = 6;
  const isTransparent = color === 'transparent';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(paletteKey);
      if (saved) {
        setMemoryColors(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load palette from localStorage", e);
    }
  }, [paletteKey]);
  
  // Effect to handle editing of an active memory color
  useEffect(() => {
    if (activeIndex !== null && !isTransparent && memoryColors[activeIndex] !== color) {
        const newPalette = [...memoryColors];
        newPalette[activeIndex] = color;
        setMemoryColors(newPalette);
        try {
            localStorage.setItem(paletteKey, JSON.stringify(newPalette));
        } catch (e) {
            console.error("Failed to save edited palette to localStorage", e);
        }
    }
  }, [color, activeIndex, memoryColors, paletteKey, isTransparent]);


  const saveColorToMemory = () => {
    if (isTransparent || memoryColors.includes(color)) {
        setActiveIndex(null); // Deselect even if not adding
        return;
    }
    const newPalette = [color, ...memoryColors].slice(0, MAX_MEMORY_COLORS);
    setMemoryColors(newPalette);
    setActiveIndex(null); // Deselect after adding a new color
    try {
      localStorage.setItem(paletteKey, JSON.stringify(newPalette));
    } catch (e) {
      console.error("Failed to save palette to localStorage", e);
    }
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTransparent) return;
    const newHue = parseInt(e.target.value, 10);
    let [, s, l] = hexToHsl(color);

    // If color is grayscale, give it full saturation and mid lightness to show the hue
    if (s === 0 || l === 0 || l === 100) {
        s = 100;
        l = 50;
    }
    
    setColor(hslToHex(newHue, s, l));
  };

  const [hue] = isTransparent ? [0] : hexToHsl(color);

  return (
    <div>
      <label className="text-xs text-slate-400 block mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-md border-2 border-slate-600 overflow-hidden shrink-0">
          <input
            type="color"
            value={isTransparent ? '#FFFFFF' : color}
            onChange={(e) => { setColor(e.target.value); setActiveIndex(null); }}
            className="absolute -top-1 -left-1 w-12 h-12 p-0 border-none cursor-pointer bg-transparent"
            title="選擇自訂顏色"
          />
          {isTransparent && (
            <div className="absolute inset-0 bg-white flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-checkerboard opacity-20"></div>
              <SlashIcon className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>
        <div className="flex-1">
            <input 
                type="range" 
                min="0" 
                max="360" 
                value={hue}
                onChange={handleHueChange}
                className="w-full h-3 appearance-none rounded-full cursor-pointer bg-hue-gradient disabled:opacity-50"
                title="調整色相"
            />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-slate-400">記憶:</span>
        {memoryColors.map((memColor, index) => (
             <button
                key={`${memColor}-${index}`}
                onClick={() => { setColor(memColor); setActiveIndex(index); }}
                className={`w-5 h-5 rounded-full border-2 ${activeIndex === index ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600'} transition-transform hover:scale-110`}
                style={{ backgroundColor: memColor }}
                title={`修改 ${memColor}`}
              />
        ))}
        {Array(MAX_MEMORY_COLORS - memoryColors.length).fill(0).map((_, index) => (
             <div key={`empty-${index}`} className="w-5 h-5 rounded-full border-2 border-dashed border-slate-700 bg-black/20"></div>
        ))}
        <button onClick={saveColorToMemory} title="儲存為新顏色" className="ml-1 text-slate-400 hover:text-white transition-colors">
            <PlusIcon className="w-4 h-4" />
        </button>
        <button onClick={() => { setColor('transparent'); setActiveIndex(null); }} title="透明" className={`w-5 h-5 rounded-full border-2 ${isTransparent ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600'} bg-white relative overflow-hidden flex items-center justify-center transition-transform hover:scale-110 ml-auto`}>
            <div className="absolute inset-0 bg-checkerboard opacity-20"></div>
            <SlashIcon className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};

const globalStyles = `
  .bg-checkerboard {
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  }
  .bg-hue-gradient {
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  }
  input[type=range]::-webkit-slider-thumb {
     -webkit-appearance: none;
     appearance: none;
     width: 16px;
     height: 16px;
     border-radius: 50%;
     background: #ffffff;
     border: 2px solid #555;
     cursor: pointer;
  }
  input[type=range]::-moz-range-thumb {
     width: 16px;
     height: 16px;
     border-radius: 50%;
     background: #ffffff;
     border: 2px solid #555;
     cursor: pointer;
  }
`;

if (!document.getElementById('color-picker-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'color-picker-styles';
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
}
