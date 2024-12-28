"use client";

import React, { useEffect, useRef, useState } from "react";
import { EyeIcon as EyeDropperIcon } from 'lucide-react';
import { Button } from "@kit/ui/button";
import { Input } from "@kit/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";

const predefinedPalettes = [
  ["#FF0000", "#00FF00", "#0000FF"],
  ["#FFA500", "#800080", "#008000"],
  ["#FFFF00", "#00FFFF", "#FF00FF"],
  ["#FFC0CB", "#ADD8E6", "#90EE90"],
  ["#800000", "#008080", "#000080"],
  ["#FF4500", "#9ACD32", "#4169E1"],
  ["#FF1493", "#00CED1", "#32CD32"],
  ["#FF69B4", "#1E90FF", "#228B22"],
  ["#FF6347", "#4682B4", "#2E8B57"],
  ["#DC143C", "#4169E1", "#008000"],
  ["#FF8C00", "#8A2BE2", "#20B2AA"],
  ["#FF7F50", "#6A5ACD", "#3CB371"],
  ["#FFA07A", "#87CEEB", "#98FB98"],
  ["#F08080", "#B0C4DE", "#90EE90"],
  ["#CD5C5C", "#4682B4", "#66CDAA"],
];

interface ColorPaletteProps {
  selectedColors: string[];
  onSelectColor: (colors: string[]) => void;
  custom: boolean;
  onToggleCustom: (custom: boolean) => void;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hsv2rgb({ h, s, v }: HSV): RGB {
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
}

function rgb2hsv({ r, g, b }: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  const h = c && ((v === r) ? (g - b) / c : ((v === g) ? 2 + (b - r) / c : 4 + (r - g) / c));
  return { h: 60 * (h < 0 ? h + 6 : h), s: v ? c / v : 0, v };
}

function rgb2hex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
}

function hex2rgb(hex: string): RGB {
  const [r = 0, g = 0, b = 0] = (hex.match(/\w\w/g) || []).map(x => parseInt(x, 16) || 0);
  return { r, g, b };
}

export function ColorPalette({ selectedColors, onSelectColor, custom, onToggleCustom }: ColorPaletteProps) {
  const [colors, setColors] = useState<HSV[]>(selectedColors.map(hex => rgb2hsv(hex2rgb(hex))));
  const [hexValues, setHexValues] = useState(selectedColors);
  const [tempHexValues, setTempHexValues] = useState(selectedColors);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const gradientRef = useRef<HTMLDivElement>(null);
  const spectrumRef = useRef<HTMLDivElement>(null);
  const [isDraggingGradient, setIsDraggingGradient] = useState(false);
  const [isDraggingSpectrum, setIsDraggingSpectrum] = useState(false);

  const handleGradientMouseDown = (e: React.MouseEvent) => {
    setIsDraggingGradient(true);
    updateGradientColor(e);
  };

  const handleSpectrumMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSpectrum(true);
    updateSpectrumColor(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingGradient) {
        updateGradientColor(e);
      }
      if (isDraggingSpectrum) {
        updateSpectrumColor(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingGradient(false);
      setIsDraggingSpectrum(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingGradient, isDraggingSpectrum]);

  const updateGradientColor = (e: React.MouseEvent | MouseEvent) => {
    if (!gradientRef.current) return;

    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setColors(prev => {
      const newColors = [...prev];
      if (newColors[activeColorIndex]) {
        newColors[activeColorIndex] = { 
          ...newColors[activeColorIndex], 
          h: newColors[activeColorIndex].h,
          s: x, 
          v: 1 - y 
        };
        const rgb = hsv2rgb(newColors[activeColorIndex]);
        const hex = rgb2hex(rgb);
        setTempHexValues(prevHex => {
          const newHex = [...prevHex];
          newHex[activeColorIndex] = hex;
          return newHex;
        });
      }
      return newColors;
    });
  };

  const updateSpectrumColor = (e: React.MouseEvent | MouseEvent) => {
    if (!spectrumRef.current) return;

    const rect = spectrumRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setColors(prev => {
      const newColors = [...prev];
      if (newColors[activeColorIndex]) {
        newColors[activeColorIndex] = { 
          ...newColors[activeColorIndex], 
          h: newColors[activeColorIndex].h,
          s: x, 
          v: 1 - y 
        };
        const rgb = hsv2rgb(newColors[activeColorIndex]);
        const hex = rgb2hex(rgb);
        setTempHexValues(prevHex => {
          const newHex = [...prevHex];
          newHex[activeColorIndex] = hex;
          return newHex;
        });
      }
      return newColors;
    });
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newHex = e.target.value;
    setTempHexValues(prev => {
      const newHexValues = [...prev];
      newHexValues[index] = newHex;
      return newHexValues;
    });
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      const rgb = hex2rgb(newHex);
      const hsv = rgb2hsv(rgb);
      setColors(prev => {
        const newColors = [...prev];
        newColors[index] = hsv;
        return newColors;
      });
    }
  };

  const handlePredefinedPaletteSelect = (palette: string[]) => {
    setHexValues(palette);
    setColors(palette.map(hex => rgb2hsv(hex2rgb(hex))));
    onSelectColor(palette);
  };

  const handleConfirmCustomPalette = () => {
    setHexValues(tempHexValues);
    onSelectColor(tempHexValues);
    onToggleCustom(false);
  };

  if (custom && colors[activeColorIndex]) {
    const currentRGB = hsv2rgb(colors[activeColorIndex]);
    const gradientBackground = `
      linear-gradient(to right, white, transparent),
      linear-gradient(to bottom, transparent, black),
      linear-gradient(to bottom, hsl(${colors[activeColorIndex].h}, 100%, 50%), hsl(${colors[activeColorIndex].h}, 100%, 50%))
    `;

    return (
      <div className="space-y-4">
        <div className="relative w-full" style={{ height: '200px' }}>
          <div
            ref={gradientRef}
            className="absolute inset-0 rounded-lg cursor-crosshair"
            style={{ background: gradientBackground }}
            onMouseDown={handleGradientMouseDown}
          >
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${colors[activeColorIndex].s * 100}%`,
                top: `${(1 - colors[activeColorIndex].v) * 100}%`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>

        <div className="relative h-5">
          <div
            ref={spectrumRef}
            className="absolute inset-0 rounded-md cursor-pointer"
            style={{
              background:
                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
            onMouseDown={handleSpectrumMouseDown}
          >
            <div
              className="absolute w-2 h-full border-2 border-white -translate-x-1/2 pointer-events-none"
              style={{
                left: `${(colors[activeColorIndex].h / 360) * 100}%`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {tempHexValues.map((hex, index) => (
            <div key={index} className="flex-1 space-y-2">
              <Input
                value={hex}
                onChange={(e) => handleHexChange(e, index)}
                className="font-mono uppercase"
                maxLength={7}
              />
              <Button
                variant="outline"
                className="w-full h-10"
                style={{ backgroundColor: hex }}
                onClick={() => setActiveColorIndex(index)}
              >
                {index === activeColorIndex && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white"
                    style={{ pointerEvents: 'none' }}
                  >
                    Active
                  </div>
                )}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onToggleCustom(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirmCustomPalette} variant="default" className="flex-1">
            Confirm Palette
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {predefinedPalettes.map((palette, index) => (
          <Button
            key={index}
            variant="outline"
            className={`w-full h-10 p-0 ${hexValues.join(',') === palette.join(',') ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handlePredefinedPaletteSelect(palette)}
          >
            <div className="flex w-full h-full">
              {palette.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="flex-1 h-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </Button>
        ))}
      </div>
      <Button onClick={() => onToggleCustom(true)} variant="outline" className="w-full">
        Create Custom Palette
      </Button>
    </div>
  );
} 