interface SpreadsheetGridProps {}
import { useState, useRef, useEffect } from 'react';
// Simple notification component
function AutosaveNotification({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg font-semibold">
        Spreadsheet autosaved
      </div>
    </div>
  );
}

export { SpreadsheetGrid };
type CellFormat = {
  fontFamily?: string;
  fontSize?: number | string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: string;
  isLink?: boolean;
  color?: string;
  textDecoration?: string;
  linkUrl?: string;
};
import { useClipboard } from '../contexts/ClipboardContext';
import { useSpreadsheetWithHistory } from '../hooks/useSpreadsheetWithHistory';

const COLS = 26; // A-Z
const ROWS = 30;

function SpreadsheetGrid({}: SpreadsheetGridProps) {

  // All state/context variables must be declared at the top, before any useEffect or logic that references them
  const [showAutosave, setShowAutosave] = useState(false);
  const { selectedCell, setSelectedCell, selectedRange, setSelectedRange, cellData, setCellData, cellFormats, floatingImages, setFloatingImages, floatingCharts, setFloatingCharts, floatingTextBoxes, setFloatingTextBoxes, selectedImage, setSelectedImage, setHasTextSelection, isTextBoxMode, setIsTextBoxMode, getCellKey, undo, redo, canUndo, canRedo } = useSpreadsheetWithHistory();

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawPath, setDrawPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  // Fill handle drag state
  const [isFillDragging, setIsFillDragging] = useState(false);
  const [fillStart, setFillStart] = useState<{ row: number; col: number } | null>(null);
  const [fillEnd, setFillEnd] = useState<{ row: number; col: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getColumnLabel = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };


  // New fill handle drag logic
  const handleFillDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCell) {
      setIsFillDragging(true);
      setFillStart(selectedCell);
      setFillEnd(selectedCell);
    }
  };

  const handleFillDragMove = (row: number, col: number) => {
    if (isFillDragging && fillStart) {
      setFillEnd({ row, col });
      const startRow = Math.min(fillStart.row, row);
      const endRow = Math.max(fillStart.row, row);
      const startCol = Math.min(fillStart.col, col);
      const endCol = Math.max(fillStart.col, col);
      setSelectedRange({ startRow, startCol, endRow, endCol });
    }
  };

  const handleFillDragEnd = () => {
    if (isFillDragging && fillStart && fillEnd) {
      const startRow = Math.min(fillStart.row, fillEnd.row);
      const endRow = Math.max(fillStart.row, fillEnd.row);
      const startCol = Math.min(fillStart.col, fillEnd.col);
      const endCol = Math.max(fillStart.col, fillEnd.col);
      const sourceKey = getCellKey(fillStart.row, fillStart.col);
      const sourceValue = cellData[sourceKey] || '';
      const isNumber = /^-?\d+(?:\.\d+)?$/.test(sourceValue);
      const newCellData = { ...cellData };
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r !== fillStart.row || c !== fillStart.col) {
            const targetKey = getCellKey(r, c);
            if (isNumber) {
              // Fill sequentially for numbers (row-wise or col-wise)
              let diff = (r - fillStart.row) + (c - fillStart.col);
              let base = parseFloat(sourceValue);
              newCellData[targetKey] = (base + diff).toString();
            } else {
              newCellData[targetKey] = sourceValue;
            }
          }
        }
      }
      setCellData(newCellData);
    }
    setIsFillDragging(false);
    setFillStart(null);
    setFillEnd(null);
    setSelectedRange(null);
  };

  const isCellInRange = (row: number, col: number) => {
    if (!selectedRange) return false;
    return row >= selectedRange.startRow && row <= selectedRange.endRow &&
           col >= selectedRange.startCol && col <= selectedRange.endCol;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const key = getCellKey(row, col);
    setCellData(prev => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
      if (row < ROWS - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Global key handlers for copy / cut / paste when not editing
  const { copy, cut, paste, clearCut, getCutCellKey } = useClipboard();



  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      // Only handle if not editing a cell
      if (editingCell) return;
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      const cellKey = getCellKey(row, col);
      const val = cellData[cellKey] || '';

      // Arrow keys: move cell selection only, never scroll
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        let newRow = row;
        let newCol = col;
        if (e.key === "ArrowUp" && row > 0) newRow--;
        if (e.key === "ArrowDown" && row < ROWS - 1) newRow++;
        if (e.key === "ArrowLeft" && col > 0) newCol--;
        if (e.key === "ArrowRight" && col < COLS - 1) newCol++;
        setSelectedCell({ row: newRow, col: newCol });
        setSelectedRange(null);
        return;
      }

      // Enter key moves to cell below
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (row < ROWS - 1) {
          setSelectedCell({ row: row + 1, col });
          setSelectedRange(null);
        }
        return;
      }

      // Esc key triggers undo
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (canUndo) undo();
        return;
      }

      // Ctrl/Cmd + C/X/V/Z/Y for clipboard/undo/redo
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        await copy(val, cellKey);
      } else if (key === 'x') {
        e.preventDefault();
        await cut(val, cellKey);
      } else if (key === 'v') {
        e.preventDefault();
        const clipboardData = await paste();
        if (clipboardData?.value !== undefined && clipboardData?.value !== null) {
          setCellData((prev: any) => ({ ...prev, [cellKey]: clipboardData.value }));
          if (clipboardData.isCut && clipboardData.cellKey) {
            setCellData((prev: any) => ({ ...prev, [clipboardData.cellKey!]: '' }));
            clearCut();
          }
        }
      } else if (key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if (key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [selectedCell, editingCell, cellData, copy, cut, paste, clearCut, undo, redo, canUndo, canRedo]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      setHasTextSelection(selection ? selection.toString().length > 0 : false);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // document.addEventListener('mouseup', (e) => handleMouseUp(e as MouseEvent));
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      // document.removeEventListener('mouseup', (e) => handleMouseUp(e as MouseEvent));
    };
  }, [setHasTextSelection]);

  const handleImageResize = (id: string, width: number, height: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, width, height } : img
    ));
  };

  const handleImageMove = (id: string, x: number, y: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, x, y } : img
    ));
  };

  const handleImageRotate = (id: string, rotation: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, rotation } : img
    ));
  };

  const handleImageTransform = (id: string, property: string, value: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, [property]: value } : img
    ));
  };


  const handleChartMove = (id: string, x: number, y: number) => {
    setFloatingCharts((prev: any[]) => prev.map((chart: any) => 
      chart.id === id ? { ...chart, x, y } : chart
    ));
  };

  const handleChartResize = (id: string, width: number, height: number) => {
    setFloatingCharts((prev: any[]) => prev.map((chart: any) => 
      chart.id === id ? { ...chart, width, height } : chart
    ));
  };

  const parseRange = (range: string) => {
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return [];
    
    const [, startCol, startRow, endCol, endRow] = match;
    const startColIndex = startCol.charCodeAt(0) - 65;
    const endColIndex = endCol.charCodeAt(0) - 65;
    const startRowIndex = parseInt(startRow) - 1;
    const endRowIndex = parseInt(endRow) - 1;
    
    const data = [];
    for (let row = startRowIndex; row <= endRowIndex; row++) {
      const rowData = [];
      for (let col = startColIndex; col <= endColIndex; col++) {
        const cellKey = getCellKey(row, col);
        rowData.push(cellData[cellKey] || '');
      }
      data.push(rowData);
    }
    return data;
  };

  const getChartData = (chart: any) => {
    if (!chart.dataRange) return chart.data;
    
    const rangeData = parseRange(chart.dataRange);
    if (rangeData.length === 0) return chart.data;
    
    const chartData = [];
    for (let i = 0; i < rangeData.length; i++) {
      const [label, value] = rangeData[i];
      if (label && value) {
        chartData.push({
          label: label.toString(),
          value: parseFloat(value.toString()) || 0
        });
      }
    }
    return chartData.length > 0 ? chartData : chart.data;
  };


  const renderChart = (chart: any) => {
    const { type, width, height } = chart;
    const data = getChartData(chart);
    const maxValue = Math.max(...data.map((d: any) => d.value));
    
    switch (type) {
      case 'column':
        const barWidth = (width - 60) / data.length;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            {data.map((item: any, index: number) => {
              const barHeight = (item.value / maxValue) * (height - 60);
              return (
                <g key={index}>
                  <rect
                    x={30 + index * barWidth + barWidth * 0.1}
                    y={height - 30 - barHeight}
                    width={barWidth * 0.8}
                    height={barHeight}
                    fill="#3b82f6"
                  />
                  <text
                    x={30 + index * barWidth + barWidth * 0.5}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        );
      case 'line':
        const stepX = (width - 60) / (data.length - 1);
        const points = data.map((item: any, index: number) => {
          const x = 30 + index * stepX;
          const y = height - 30 - (item.value / maxValue) * (height - 60);
          return `${x},${y}`;
        }).join(' ');
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            {data.map((item: any, index: number) => {
              const x = 30 + index * stepX;
              const y = height - 30 - (item.value / maxValue) * (height - 60);
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                  <text
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        );
      case 'pie':
        const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
        let currentAngle = 0;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            {data.map((item: any, index: number) => {
              const angle = (item.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', fontSize: '31.2px' }}>
      <AutosaveNotification visible={showAutosave} />
      <div 
        className={`flex-1 overflow-auto relative bg-gray-100 ${isTextBoxMode ? 'cursor-crosshair' : ''}`}
        style={{ cursor: isTextBoxMode ? 'crosshair' : 'default' }}
      >
        <div className="inline-block min-w-full relative">
          <div style={{ position: 'relative' }}>
            <table className="border-collapse" style={{ fontSize: 'inherit' }}>
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-20 border w-10 sm:w-12 h-6 sm:h-7 text-xs bg-gray-200 border-gray-300"></th>
                  {Array.from({ length: COLS }).map((_, colIndex) => (
                    <th
                      key={colIndex}
                      className="sticky top-0 z-10 border min-w-20 sm:min-w-24 h-6 sm:h-7 text-xs bg-gray-200 border-gray-300 text-gray-800"
                    >
                      {getColumnLabel(colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sticky left-0 z-10 border text-center text-xs bg-gray-200 border-gray-300 text-gray-800">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const isInRange = isCellInRange(rowIndex, colIndex);
                      const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                      const cellKey = getCellKey(rowIndex, colIndex);
                      const cellValue = cellData[cellKey] || '';
                      const cellFormat: CellFormat = cellFormats[cellKey] || {};
                      const isCutCell = getCutCellKey() === cellKey;
                      const getCellStyle = () => {
                        const style: React.CSSProperties = {};
                        if (cellFormat.fontFamily) style.fontFamily = cellFormat.fontFamily;
                        if (cellFormat.fontSize) style.fontSize = typeof cellFormat.fontSize === 'number' ? `${cellFormat.fontSize}px` : cellFormat.fontSize;
                        if (cellFormat.bold) style.fontWeight = 'bold';
                        if (cellFormat.italic) style.fontStyle = 'italic';
                        if (cellFormat.underline) style.textDecoration = 'underline';
                        if (cellFormat.textAlign) style.textAlign = cellFormat.textAlign as any;
                        return style;
                      };
                      return (
                        <td
                          key={colIndex}
                          className={`border h-6 sm:h-7 min-w-20 sm:min-w-24 bg-white border-gray-300 ${
                            isSelected 
                              ? 'ring-2 ring-emerald-600 ring-inset' 
                              : ''
                          } ${
                            isInRange 
                              ? 'bg-blue-200 bg-opacity-50' 
                              : ''
                          } ${
                            isCutCell 
                              ? 'bg-orange-50 border-dashed border-orange-400' 
                              : ''
                          }`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          // onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                          // onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                          onMouseEnter={(e) => {
                            // handleMouseEnter(rowIndex, colIndex, e);
                            if (isFillDragging) handleFillDragMove(rowIndex, colIndex);
                          }}
                          onMouseUp={(e) => {
                            // handleMouseUp(e);
                            if (isFillDragging) handleFillDragEnd();
                            if (isFillDragging) handleFillDragEnd();
                          }}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={cellValue}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                              onBlur={() => setEditingCell(null)}
                              onMouseUp={() => {
                                const selection = window.getSelection();
                                setHasTextSelection(selection ? selection.toString().length > 0 : false);
                              }}
                              onSelect={() => {
                                const target = inputRef.current;
                                if (target) {
                                  setHasTextSelection(target.selectionStart !== target.selectionEnd);
                                }
                              }}
                              style={getCellStyle()}
                              className="w-full h-full px-1 text-xs sm:text-sm outline-none border-none bg-white text-gray-800"
                            />
                          ) : (
                            <div 
                              style={getCellStyle()}
                              className={`px-1 text-xs sm:text-sm h-full flex items-center text-gray-800 ${
                                isCutCell ? 'opacity-50' : ''
                              }`}
                              onMouseUp={() => {
                                const selection = window.getSelection();
                                setHasTextSelection(selection ? selection.toString().length > 0 : false);
                              }}
                            >
                              <span className="w-full" style={{ textAlign: (cellFormat.textAlign as any) || 'left' }}>
                                {cellFormat.isLink && cellFormat.linkUrl ? (
                                  <a
                                    href={cellFormat.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer underline text-blue-700 hover:text-black font-semibold"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {cellValue}
                                  </a>
                                ) : (
                                  cellValue
                                )}
                              </span>
                            </div>
                          )}
                          {/* Fill Handle */}
                          {isSelected && !isEditing && (
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center cursor-crosshair z-10 border border-white rounded-full shadow"
                              onMouseDown={handleFillDragStart}
                              title="Fill handle - drag to copy cell"
                              style={{
                                pointerEvents: 'auto',
                                background: isSelected ? '#059669' : '#059669', // Use the same color as the selection ring
                              }}
                              draggable={true}
                              onDragStart={handleFillDragStart}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="7" fill="#059669" />
                                <path d="M7 3v8M3 7h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Overlays: charts, images, textboxes, drawing path preview */}
            {floatingCharts.map(chart => (
              <div
                key={chart.id}
                className={`absolute select-none ${selectedImage === chart.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{ left: chart.x, top: chart.y, width: chart.width, height: chart.height }}
                onClick={() => setSelectedImage(chart.id)}
              >
                <div
                  className="w-full h-full cursor-move bg-white border rounded shadow"
                  onMouseDown={(e) => {
                    const startX = e.clientX - chart.x;
                    const startY = e.clientY - chart.y;
                    const handleMouseMove = (e: MouseEvent) => {
                      handleChartMove(chart.id, e.clientX - startX, e.clientY - startY);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  {renderChart(chart)}
                </div>
                {selectedImage === chart.id && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                    {/* Add resize handles and delete button as needed */}
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFloatingCharts(prev => prev.filter(c => c.id !== chart.id));
                        setSelectedImage(null);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {floatingImages.map(image => (
              <div
                key={image.id}
                className={`absolute select-none ${selectedImage === image.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: image.x,
                  top: image.y,
                  width: image.width,
                  height: image.height,
                  transform: `rotate(${image.rotation}deg) scaleX(${image.scaleX}) scaleY(${image.scaleY})`,
                  opacity: image.opacity,
                  transformOrigin: 'center'
                }}
                onClick={() => setSelectedImage(image.id)}
              >
                <div
                  className="w-full h-full cursor-move"
                  onMouseDown={(e) => {
                    const startX = e.clientX - image.x;
                    const startY = e.clientY - image.y;
                    const handleMouseMove = (e: MouseEvent) => {
                      handleImageMove(image.id, e.clientX - startX, e.clientY - startY);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <img
                    src={image.src}
                    alt="Floating image"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                {selectedImage === image.id && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFloatingImages(prev => prev.filter(img => img.id !== image.id));
                        setSelectedImage(null);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {floatingTextBoxes.map(textBox => (
              <div
                key={textBox.id}
                className={`absolute select-none ${selectedImage === textBox.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: textBox.x,
                  top: textBox.y,
                  width: textBox.width,
                  height: textBox.height,
                  backgroundColor: textBox.drawPath ? 'transparent' : textBox.backgroundColor,
                  border: textBox.drawPath ? 'none' : `${textBox.borderWidth}px solid ${textBox.borderColor}`,
                  padding: textBox.padding
                }}
                onClick={() => setSelectedImage(textBox.id)}
              >
                {textBox.drawPath && (
                  <svg 
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <path
                      d={`M ${textBox.drawPath.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
                      stroke={textBox.borderColor}
                      strokeWidth={textBox.borderWidth}
                      fill={textBox.backgroundColor}
                    />
                  </svg>
                )}
                <textarea
                  value={textBox.text}
                  onChange={(e) => {
                    setFloatingTextBoxes(prev => prev.map(tb => 
                      tb.id === textBox.id ? { ...tb, text: e.target.value } : tb
                    ));
                  }}
                  className="w-full h-full resize-none border-none outline-none bg-transparent"
                  style={{
                    fontSize: textBox.fontSize,
                    fontFamily: textBox.fontFamily,
                    color: textBox.color,
                    textAlign: textBox.textAlign
                  }}
                />
                {selectedImage === textBox.id && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFloatingTextBoxes(prev => prev.filter(tb => tb.id !== textBox.id));
                        setSelectedImage(null);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {/* Drawing Path Preview */}
            {isDrawingPath && drawPath.length > 0 && (
              <svg 
                className="absolute inset-0 pointer-events-none z-10"
                style={{ width: '100%', height: '100%' }}
              >
                <path
                  d={`M ${drawPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
