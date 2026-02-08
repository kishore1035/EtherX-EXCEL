import { useState } from 'react';

interface ShapesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shape: string) => void;
}

// MS Excel shapes - drawable geometric shapes only
const SHAPES = {
  'Rectangles': [
    { name: 'Rectangle', icon: '▭' },
    { name: 'Rounded Rectangle', icon: '▢' },
    { name: 'Snip Single Corner Rectangle', icon: '▭' },
    { name: 'Snip Same Side Corner Rectangle', icon: '▭' },
    { name: 'Snip Diagonal Corner Rectangle', icon: '▭' },
    { name: 'Round Single Corner Rectangle', icon: '▢' },
    { name: 'Round Same Side Corner Rectangle', icon: '▢' },
    { name: 'Round Diagonal Corner Rectangle', icon: '▢' }
  ],
  'Basic Shapes': [
    { name: 'Oval', icon: '○' },
    { name: 'Isosceles Triangle', icon: '△' },
    { name: 'Right Triangle', icon: '◿' },
    { name: 'Parallelogram', icon: '▱' },
    { name: 'Trapezoid', icon: '▱' },
    { name: 'Diamond', icon: '◇' },
    { name: 'Pentagon', icon: '⬟' },
    { name: 'Hexagon', icon: '⬡' },
    { name: 'Heptagon', icon: '⬢' },
    { name: 'Octagon', icon: '⯄' },
    { name: 'Decagon', icon: '⬢' },
    { name: 'Dodecagon', icon: '⬢' }
  ],
  'Block Arrows': [
    { name: 'Right Arrow', icon: '►' },
    { name: 'Left Arrow', icon: '◄' },
    { name: 'Up Arrow', icon: '▲' },
    { name: 'Down Arrow', icon: '▼' },
    { name: 'Left-Right Arrow', icon: '◄►' },
    { name: 'Up-Down Arrow', icon: '▲▼' },
    { name: 'Quad Arrow', icon: '✦' },
    { name: 'Left-Right-Up Arrow', icon: '▴' },
    { name: 'Bent Arrow', icon: '↱' },
    { name: 'U-Turn Arrow', icon: '↶' },
    { name: 'Curved Right Arrow', icon: '⤴' },
    { name: 'Curved Left Arrow', icon: '⤵' },
    { name: 'Curved Up Arrow', icon: '↰' },
    { name: 'Curved Down Arrow', icon: '↴' },
    { name: 'Striped Right Arrow', icon: '⇨' },
    { name: 'Notched Right Arrow', icon: '►' },
    { name: 'Pentagon Arrow', icon: '⬟' },
    { name: 'Chevron Arrow', icon: '›' },
    { name: 'Right Arrow Callout', icon: '►' },
    { name: 'Down Arrow Callout', icon: '▼' }
  ],
  'Stars': [
    { name: '4-Point Star', icon: '✦' },
    { name: '5-Point Star', icon: '★' },
    { name: '6-Point Star', icon: '✶' },
    { name: '7-Point Star', icon: '✸' },
    { name: '8-Point Star', icon: '✴' },
    { name: '10-Point Star', icon: '✺' },
    { name: '12-Point Star', icon: '✺' },
    { name: '16-Point Star', icon: '✳' },
    { name: '24-Point Star', icon: '✳' },
    { name: '32-Point Star', icon: '✳' }
  ],
  'Callouts': [
    { name: 'Rectangular Callout', icon: '▭' },
    { name: 'Rounded Rectangular Callout', icon: '▢' },
    { name: 'Oval Callout', icon: '○' },
    { name: 'Cloud Callout', icon: '☁' },
    { name: 'Line Callout 1', icon: '╱' },
    { name: 'Line Callout 2', icon: '╲' },
    { name: 'Line Callout 3', icon: '╱' },
    { name: 'Line Callout 4', icon: '╲' }
  ],
  'Flowchart': [
    { name: 'Process', icon: '▭' },
    { name: 'Alternate Process', icon: '▢' },
    { name: 'Decision', icon: '◇' },
    { name: 'Data', icon: '▱' },
    { name: 'Predefined Process', icon: '▯' },
    { name: 'Internal Storage', icon: '▭' },
    { name: 'Document', icon: '▭' },
    { name: 'Multi-Document', icon: '▭' },
    { name: 'Terminator', icon: '▢' },
    { name: 'Preparation', icon: '⬡' },
    { name: 'Manual Input', icon: '▱' },
    { name: 'Manual Operation', icon: '▱' },
    { name: 'Connector', icon: '○' },
    { name: 'Off-Page Connector', icon: '⬟' },
    { name: 'Card', icon: '▭' },
    { name: 'Punched Tape', icon: '▱' },
    { name: 'Summing Junction', icon: '○' },
    { name: 'Or', icon: '○' },
    { name: 'Collate', icon: '⧓' },
    { name: 'Sort', icon: '◇' },
    { name: 'Extract', icon: '△' },
    { name: 'Merge', icon: '▽' },
    { name: 'Stored Data', icon: '◐' },
    { name: 'Delay', icon: '◗' },
    { name: 'Sequential Access', icon: '◗' },
    { name: 'Magnetic Disk', icon: '▭' },
    { name: 'Direct Access Storage', icon: '▭' },
    { name: 'Display', icon: '▱' }
  ]
};

export function ShapesDropdown({ isOpen, onClose, onSelectShape }: ShapesDropdownProps) {
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShapeSelect = (shapeName: string) => {
    setSelectedShape(shapeName);
  };

  const handleInsert = () => {
    if (selectedShape) {
      onSelectShape(selectedShape);
      setSelectedShape(null);
      onClose();
    }
  };

  return (
    <div className="w-[600px]">
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden relative"
        style={{
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%) 1',
        }}
      >
        {/* HEADER */}
        <div className="relative p-4 overflow-hidden" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">◇</span>
              <h2 className="text-lg font-semibold text-black">Insert Shape</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
        
        {/* CONTENT */}
        <div className="p-2 space-y-2 bg-white">
          <div>
            <label className="block text-xs font-medium mb-1 text-black text-center">
              Choose a shape
            </label>
            <div className="flex gap-2 justify-between overflow-auto" style={{maxWidth: '100%'}}>
              {Object.entries(SHAPES).map(([category, shapes]) => (
                <div key={category} className="flex flex-col items-center min-w-[80px]">
                  <span className="text-xs font-semibold mb-1 text-gray-700 whitespace-nowrap">{category}</span>
                  {shapes.slice(0, 10).map((shape) => (
                    <button
                      key={shape.name}
                      type="button"
                      title={shape.name}
                      className={`text-xl w-10 h-10 mb-1 flex items-center justify-center rounded border transition-all cursor-pointer ${
                        selectedShape === shape.name ? 'border-black' : 'bg-gray-100 border-gray-300'
                      }`}
                      style={selectedShape === shape.name ? {
                        background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                      } : {}}
                      onClick={() => handleShapeSelect(shape.name)}
                      onMouseEnter={(e) => {
                        if (selectedShape !== shape.name) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedShape !== shape.name) {
                          e.currentTarget.style.background = '';
                        }
                      }}
                      aria-label={`Select ${shape.name}`}
                    >
                      {shape.icon}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* BUTTONS */}
          <div className="flex justify-end gap-2 p-2 border-t">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-100 text-black hover:bg-gray-200 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!selectedShape}
              className={`px-3 py-1 rounded font-bold transition-all text-xs ${
                selectedShape
                  ? ""
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={selectedShape ? {
                background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                color: "#000",
              } : {}}
            >
              Draw Shape
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
