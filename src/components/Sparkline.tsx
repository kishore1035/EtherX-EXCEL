import React, { useMemo } from 'react';
import { SparklineConfig } from '../types/documentState';

interface SparklineProps {
  config: SparklineConfig;
  cellData: { [key: string]: string };
  width: number;
  height: number;
}

export function Sparkline({ config, cellData, width, height }: SparklineProps) {
  const data = useMemo(() => {
    // Parse the source range (e.g., "A1:A10")
    const match = config.sourceRange.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) return [];

    const [, startCol, startRow, endCol, endRow] = match;
    
    // Convert column letter to index
    const colToIndex = (col: string) => {
      let index = 0;
      for (let i = 0; i < col.length; i++) {
        index = index * 26 + (col.charCodeAt(i) - 64);
      }
      return index - 1;
    };

    const startColIndex = colToIndex(startCol);
    const endColIndex = colToIndex(endCol);
    const startRowIndex = parseInt(startRow) - 1;
    const endRowIndex = parseInt(endRow) - 1;

    const values: number[] = [];

    // Extract numeric values from range
    for (let row = startRowIndex; row <= endRowIndex; row++) {
      for (let col = startColIndex; col <= endColIndex; col++) {
        const cellKey = `${String.fromCharCode(65 + col)}${row + 1}`;
        const value = cellData[cellKey];
        if (value !== undefined && value !== '') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            values.push(numValue);
          }
        }
      }
    }

    return values;
  }, [config.sourceRange, cellData]);

  if (data.length === 0) {
    return null;
  }

  const minValue = config.min ?? Math.min(...data);
  const maxValue = config.max ?? Math.max(...data);
  const range = maxValue - minValue || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate path for line sparkline
  const generatePath = () => {
    if (data.length === 0) return '';

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  if (config.type === 'line') {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <path
          d={generatePath()}
          fill="none"
          stroke={config.color || '#0078d4'}
          strokeWidth={config.lineWidth || 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {config.showMarkers && data.map((value, index) => {
          const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
          const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={2}
              fill={config.color || '#0078d4'}
            />
          );
        })}
      </svg>
    );
  }

  if (config.type === 'column') {
    const barWidth = chartWidth / data.length;
    return (
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {data.map((value, index) => {
          const x = padding + index * barWidth;
          const barHeight = ((value - minValue) / range) * chartHeight;
          const y = padding + chartHeight - barHeight;
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={barHeight}
              fill={value < 0 ? '#dc3545' : config.color || '#28a745'}
            />
          );
        })}
      </svg>
    );
  }

  return null;
}
