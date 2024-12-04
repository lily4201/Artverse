import React from 'react';

interface ColorPalettePickerProps {
  selectedPalette: string[];
  onChange: (palette: string[]) => void;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({ selectedPalette, onChange }) => {
  const predefinedPalettes = [
    ['#FF5733', '#33FF57', '#3357FF'],
    ['#FF33A1', '#A133FF', '#33FFA1'],
    // Add more predefined palettes
  ];

  const handlePaletteSelect = (palette: string[]) => {
    onChange(palette);
  };

  return (
    <div>
      <h2>Select Color Palette</h2>
      <div className="flex gap-2">
        {predefinedPalettes.map((palette, index) => (
          <button
            key={index}
            className="p-2 border"
            style={{ backgroundColor: palette[0] }}
            onClick={() => handlePaletteSelect(palette)}
          >
            Palette {index + 1}
          </button>
        ))}
      </div>
      <div>
        <h3>Selected Palette:</h3>
        <div className="flex gap-2">
          {selectedPalette.map((color, index) => (
            <div key={index} className="w-6 h-6" style={{ backgroundColor: color }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}; 