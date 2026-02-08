import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChartObject } from '../../types/documentState';
import { useDocumentState } from '../../contexts/DocumentStateContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions as ChartJSOptions
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartElementProps {
  chart: ChartObject;
  sheetId: string;
  isSelected: boolean;
  onSelect: (chartId: string) => void;
  cellData: { [key: string]: string };
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export function ChartElement({ chart, sheetId, isSelected, onSelect, cellData }: ChartElementProps) {
  const { dispatch } = useDocumentState();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, chartX: 0, chartY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, chartX: 0, chartY: 0 });

  const extractChartData = useCallback(() => {
    if (!chart.dataRange) return null;

    try {
      const [startCell, endCell] = chart.dataRange.split(':');
      const startCol = startCell.charCodeAt(0) - 65;
      const startRow = parseInt(startCell.slice(1)) - 1;
      const endCol = endCell.charCodeAt(0) - 65;
      const endRow = parseInt(endCell.slice(1)) - 1;

      const labels: string[] = [];
      const datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string }[] = [];

      for (let col = startCol + 1; col <= endCol; col++) {
        const cellKey = `${col}-${startRow}`;
        labels.push(cellData[cellKey] || `Col ${col}`);
      }

      for (let row = startRow + 1; row <= endRow; row++) {
        const labelCellKey = `${startCol}-${row}`;
        const seriesLabel = cellData[labelCellKey] || `Series ${row - startRow}`;
        const data: number[] = [];

        for (let col = startCol + 1; col <= endCol; col++) {
          const cellKey = `${col}-${row}`;
          const value = parseFloat(cellData[cellKey] || '0');
          data.push(isNaN(value) ? 0 : value);
        }

        const colorIndex = (row - startRow - 1) % 5;
        const colors = chart.options.colors || ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500'];
        
        datasets.push({
          label: seriesLabel,
          data,
          backgroundColor: colors[colorIndex],
          borderColor: colors[colorIndex],
        });
      }

      return { labels, datasets };
    } catch (error) {
      console.error('Error extracting chart data:', error);
      return null;
    }
  }, [chart.dataRange, chart.options.colors, cellData]);

  const chartData = extractChartData();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(chart.id);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      chartX: chart.x,
      chartY: chart.y
    };
  }, [chart.id, chart.x, chart.y, onSelect]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    onSelect(chart.id);
    setIsResizing(handle);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: chart.width,
      height: chart.height,
      chartX: chart.x,
      chartY: chart.y
    };
  }, [chart.id, chart.width, chart.height, chart.x, chart.y, onSelect]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        dispatch({
          type: 'UPDATE_CHART',
          payload: {
            sheetId,
            chartId: chart.id,
            updates: {
              x: dragStartRef.current.chartX + deltaX,
              y: dragStartRef.current.chartY + deltaY
            }
          }
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        
        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = resizeStartRef.current.chartX;
        let newY = resizeStartRef.current.chartY;

        if (isResizing.includes('e')) newWidth += deltaX;
        if (isResizing.includes('w')) {
          newWidth -= deltaX;
          newX += deltaX;
        }
        if (isResizing.includes('s')) newHeight += deltaY;
        if (isResizing.includes('n')) {
          newHeight -= deltaY;
          newY += deltaY;
        }

        newWidth = Math.max(200, newWidth);
        newHeight = Math.max(150, newHeight);

        dispatch({
          type: 'UPDATE_CHART',
          payload: {
            sheetId,
            chartId: chart.id,
            updates: {
              width: newWidth,
              height: newHeight,
              x: newX,
              y: newY
            }
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, chart.id, sheetId, dispatch]);

  const chartOptions: ChartJSOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chart.options.legend?.show !== false,
        position: chart.options.legend?.position || 'bottom',
      },
      title: {
        display: !!chart.options.title,
        text: chart.options.title || '',
        color: '#000',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFD700',
        bodyColor: '#FFF',
      }
    },
    scales: chart.chartType !== 'pie' ? {
      x: {
        grid: {
          display: chart.options.xAxis?.showGridlines !== false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: !!chart.options.xAxis?.title,
          text: chart.options.xAxis?.title || ''
        }
      },
      y: {
        grid: {
          display: chart.options.yAxis?.showGridlines !== false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: !!chart.options.yAxis?.title,
          text: chart.options.yAxis?.title || ''
        }
      }
    } : undefined
  };

  if (!chartData) {
    return (
      <div
        className="absolute pointer-events-auto"
        style={{
          left: chart.x,
          top: chart.y,
          width: chart.width,
          height: chart.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'move'
        }}
        onMouseDown={handleMouseDown}
      >
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  const ChartComponent = chart.chartType === 'line' ? Line :
                        chart.chartType === 'bar' ? Bar :
                        chart.chartType === 'pie' ? Pie :
                        chart.chartType === 'scatter' ? Scatter : Line;

  console.log('🎨 ChartElement rendering:', chart.id, { 
    x: chart.x, 
    y: chart.y, 
    width: chart.width, 
    height: chart.height,
    chartType: chart.chartType,
    dataRange: chart.dataRange
  });

  // HARDCODED: Always show a visible placeholder while debugging
  return (
    <div
      className="absolute select-none"
      style={{
        left: chart.x,
        top: chart.y,
        width: chart.width,
        height: chart.height,
        backgroundColor: '#ffffff',
        border: '5px solid #ff0000',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)',
        padding: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 1000 : 100,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(chart.id)}
    >
      <div style={{ 
        fontWeight: 'bold', 
        fontSize: '16px', 
        color: '#000',
        textAlign: 'center',
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
        {chart.chartType.toUpperCase()} CHART
      </div>
      <div style={{ 
        flex: 1, 
        backgroundColor: '#e8e8e8', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        Data Range: {chart.dataRange}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#999',
        textAlign: 'center'
      }}>
        Chart ID: {chart.id}
      </div>

      {isSelected && (
        <>
          {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => (
            <div
              key={handle}
              className="absolute"
              style={{
                width: handle.length === 1 ? '8px' : '12px',
                height: handle.length === 1 ? '8px' : '12px',
                backgroundColor: '#FFD700',
                border: '2px solid #fff',
                borderRadius: '50%',
                cursor: `${handle}-resize`,
                ...getHandlePosition(handle),
                zIndex: 11
              }}
              onMouseDown={(e) => handleResizeStart(e, handle)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function getHandlePosition(handle: ResizeHandle): React.CSSProperties {
  const offset = -6;
  const centerOffset = 'calc(50% - 6px)';
  
  switch (handle) {
    case 'nw': return { top: offset, left: offset };
    case 'ne': return { top: offset, right: offset };
    case 'sw': return { bottom: offset, left: offset };
    case 'se': return { bottom: offset, right: offset };
    case 'n': return { top: offset, left: centerOffset };
    case 's': return { bottom: offset, left: centerOffset };
    case 'e': return { right: offset, top: centerOffset };
    case 'w': return { left: offset, top: centerOffset };
  }
}
