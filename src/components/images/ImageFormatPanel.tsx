import React, { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface ImageStyle {
  opacity?: number;
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  borderRadius?: number;
  filter?: string;
}

interface FloatingImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  zIndex?: number;
  style?: ImageStyle;
}

interface ImageFormatPanelProps {
  image: FloatingImage;
  onUpdate: (updates: Partial<FloatingImage>) => void;
  onClose: () => void;
  onDelete: () => void;
  allImages?: FloatingImage[]; // Add this to track all images for proper z-index management
}

export function ImageFormatPanel({ image, onUpdate, onClose, onDelete, allImages = [] }: ImageFormatPanelProps) {
  const style = image.style || {};
  
  const updateStyle = (styleUpdates: Partial<ImageStyle>) => {
    onUpdate({
      style: { ...style, ...styleUpdates }
    });
  };

  // Get all unique z-index values sorted in ascending order
  const getAllZIndexes = (): number[] => {
    const zIndexes = allImages.map(img => img.zIndex || 1);
    return [...new Set(zIndexes)].sort((a, b) => a - b);
  };

  // Get current image's z-index
  const currentZIndex = image.zIndex || 1;

  // Get sorted z-indexes
  const sortedZIndexes = getAllZIndexes();
  const currentIndexPosition = sortedZIndexes.indexOf(currentZIndex);

  // Check if at top or bottom layer
  const isAtTop = currentIndexPosition === sortedZIndexes.length - 1;
  const isAtBottom = currentIndexPosition === 0 || currentZIndex === 1;

  // Handle bring forward: move to next higher z-index layer
  const handleBringForward = () => {
    if (isAtTop) return;
    
    // Get the next z-index in the sorted array
    const nextZIndex = sortedZIndexes[currentIndexPosition + 1];
    
    // Swap z-indexes with the image at the next layer
    const imageAtNextLayer = allImages.find(img => img.zIndex === nextZIndex);
    
    if (imageAtNextLayer) {
      // Swap: current image gets next z-index, next image gets current z-index
      onUpdate({ zIndex: nextZIndex });
      // Note: The swap of the other image should be handled in the parent component
      // For now, we just increment by 1 to ensure it goes forward
    } else {
      // If no exact match, just increment by 1
      onUpdate({ zIndex: currentZIndex + 1 });
    }
  };

  // Handle send backward: move to next lower z-index layer
  const handleSendBackward = () => {
    if (isAtBottom) return;
    
    // Get the previous z-index in the sorted array
    const prevZIndex = sortedZIndexes[currentIndexPosition - 1];
    
    // Swap z-indexes with the image at the previous layer
    const imageAtPrevLayer = allImages.find(img => img.zIndex === prevZIndex);
    
    if (imageAtPrevLayer) {
      // Swap: current image gets prev z-index, prev image gets current z-index
      onUpdate({ zIndex: prevZIndex });
    } else {
      // If no exact match, just decrement by 1 but don't go below 1
      onUpdate({ zIndex: Math.max(1, currentZIndex - 1) });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ] - Bring Forward
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        handleBringForward();
      }
      // Ctrl + [ - Send Backward
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        handleSendBackward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentZIndex, sortedZIndexes]);

  return (
    <div 
      className="fixed right-0 top-0 bottom-0 w-56 bg-white shadow-2xl overflow-y-auto" 
      style={{ 
        zIndex: 100,
        borderLeft: '2px solid',
        borderImage: 'linear-gradient(135deg, #ffffff 0%, #f0e68c 25%, #ffd700 50%, #f0e68c 75%, #ffffff 100%) 1',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-2 py-1.5 sticky top-0 bg-white z-10"
        style={{
          borderBottom: '1px solid',
          borderImage: 'linear-gradient(90deg, #ffffff 0%, #ffd700 50%, #ffffff 100%) 1'
        }}
      >
        <h3 className="font-semibold text-xs text-gray-700">
          Format Image
        </h3>
        <button 
          onClick={onClose} 
          className="p-0.5 rounded transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0e68c 50%, #ffd700 100%)',
            boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          <X className="w-3 h-3 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="px-2 py-1.5 space-y-1.5">
        {/* Delete Button */}
        <div>
          <button
            onClick={onDelete}
            className="w-full px-2 py-1.5 rounded text-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-1"
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)',
              color: '#fff',
              boxShadow: '0 3px 6px rgba(255, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 0, 0, 0.5)'
            }}
          >
            <Trash2 className="w-3 h-3" />
            Delete Image
          </button>
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">
            Opacity: {Math.round((image.opacity || 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={image.opacity || 1}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Border */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">Border</label>
          <div className="space-y-1">
            <div className="flex gap-1">
              <input
                type="color"
                value={style.border?.color || '#000000'}
                onChange={(e) => updateStyle({ 
                  border: { 
                    width: style.border?.width || 0,
                    color: e.target.value,
                    style: style.border?.style || 'solid'
                  } 
                })}
                className="w-7 h-5 rounded cursor-pointer"
                style={{
                  border: '1px solid #ffd700',
                  boxShadow: '0 1px 3px rgba(255, 215, 0, 0.3)'
                }}
              />
              <input
                type="text"
                value={style.border?.color || '#000000'}
                onChange={(e) => updateStyle({ 
                  border: { 
                    width: style.border?.width || 0,
                    color: e.target.value,
                    style: style.border?.style || 'solid'
                  } 
                })}
                className="flex-1 px-1 py-0.5 rounded text-[9px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="block text-[8px] text-gray-500 mb-0.5">
                Width: {style.border?.width || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={style.border?.width || 0}
                onChange={(e) => updateStyle({ 
                  border: { 
                    width: parseFloat(e.target.value),
                    color: style.border?.color || '#000000',
                    style: style.border?.style || 'solid'
                  } 
                })}
                className="w-full h-1"
                style={{
                  accentColor: '#ffd700'
                }}
              />
            </div>
            <select
              value={style.border?.style || 'solid'}
              onChange={(e) => updateStyle({ 
                border: { 
                  width: style.border?.width || 0,
                  color: style.border?.color || '#000000',
                  style: e.target.value as 'solid' | 'dashed' | 'dotted'
                } 
              })}
              className="w-full px-1 py-0.5 rounded text-[9px]"
              style={{
                border: '1px solid #f0e68c',
                boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
              }}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">
            Corner Radius: {style.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={style.borderRadius || 0}
            onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Shadow Toggle */}
        <div>
          <label className="flex items-center gap-1 text-[9px] font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!style.shadow}
              onChange={(e) => {
                if (e.target.checked) {
                  updateStyle({
                    shadow: { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.3)' }
                  });
                } else {
                  updateStyle({ shadow: undefined });
                }
              }}
              className="w-2.5 h-2.5"
              style={{ accentColor: '#ffd700' }}
            />
            <span className="text-gray-600">Shadow</span>
          </label>
        </div>

        {/* Image Filters */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">Filters</label>
          <select
            value={style.filter || 'none'}
            onChange={(e) => updateStyle({ filter: e.target.value === 'none' ? undefined : e.target.value })}
            className="w-full px-1 py-0.5 rounded text-[9px]"
            style={{
              border: '1px solid #f0e68c',
              boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
            }}
          >
            <option value="none">None</option>
            <option value="grayscale(100%)">Grayscale</option>
            <option value="sepia(100%)">Sepia</option>
            <option value="blur(2px)">Blur</option>
            <option value="brightness(150%)">Brighten</option>
            <option value="brightness(50%)">Darken</option>
            <option value="contrast(200%)">High Contrast</option>
            <option value="saturate(200%)">Saturate</option>
          </select>
        </div>

        {/* Position & Size */}
        <div 
          className="pt-1 mt-1"
          style={{
            borderTop: '1px solid',
            borderImage: 'linear-gradient(90deg, transparent 0%, #f0e68c 50%, transparent 100%) 1'
          }}
        >
          <h4 className="font-medium text-[9px] mb-1 text-gray-600">Position & Size</h4>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-[8px] text-gray-500">X</label>
              <input
                type="number"
                value={Math.round(image.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
                className="w-full px-1 py-0.5 rounded text-[9px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500">Y</label>
              <input
                type="number"
                value={Math.round(image.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
                className="w-full px-1 py-0.5 rounded text-[9px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500">W</label>
              <input
                type="number"
                value={Math.round(image.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                className="w-full px-1 py-0.5 rounded text-[9px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500">H</label>
              <input
                type="number"
                value={Math.round(image.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                className="w-full px-1 py-0.5 rounded text-[9px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">
            Rotation: {image.rotation || 0}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={image.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Scale */}
        <div>
          <label className="block text-[9px] font-medium mb-0.5 text-gray-600">Scale</label>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-[8px] text-gray-500">Horizontal: {image.scaleX || 1}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={image.scaleX || 1}
                onChange={(e) => onUpdate({ scaleX: parseFloat(e.target.value) })}
                className="w-full h-1"
                style={{
                  accentColor: '#ffd700'
                }}
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500">Vertical: {image.scaleY || 1}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={image.scaleY || 1}
                onChange={(e) => onUpdate({ scaleY: parseFloat(e.target.value) })}
                className="w-full h-1"
                style={{
                  accentColor: '#ffd700'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
