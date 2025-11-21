import React from 'react';
import { ImageStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onSelect: (style: ImageStyle) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  // Helper to get display name from enum key
  const getStyleLabel = (style: ImageStyle) => {
    const key = Object.keys(ImageStyle).find(k => ImageStyle[k as keyof typeof ImageStyle] === style);
    return key ? key.charAt(0) + key.slice(1).toLowerCase() : 'Unknown';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Image Style</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.values(ImageStyle).map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`
              px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 text-left
              ${selectedStyle === style 
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            {getStyleLabel(style)}
          </button>
        ))}
      </div>
    </div>
  );
};