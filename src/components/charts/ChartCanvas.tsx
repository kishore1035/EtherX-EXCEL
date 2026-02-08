import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentState } from '../../contexts/DocumentStateContext';
import { ChartElement } from './ChartElement';
import { ChartObject } from '../../types/documentState';

interface ChartCanvasProps {
  sheetId: string;
  selectedChartId: string | null;
  onChartSelect: (chartId: string | null) => void;
  cellData: { [key: string]: string };
}

export function ChartCanvas({ 
  sheetId, 
  selectedChartId, 
  onChartSelect,
  cellData 
}: ChartCanvasProps) {
  const { state } = useDocumentState();
  const sheet = state.sheets.find(s => s.sheetId === sheetId);
  const charts = sheet?.charts || [];

  // DEBUG: Log charts array changes
  useEffect(() => {
    console.log('📊 ChartsLayer - Charts to render:', charts);
    console.log('📊 ChartsLayer - Sheet ID:', sheetId);
    console.log('📊 ChartsLayer - DocumentState sheets:', state.sheets);
  }, [charts, sheetId, state.sheets]);

  const handleChartClick = useCallback((chartId: string) => {
    onChartSelect(chartId);
  }, [onChartSelect]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // If clicked on the canvas background (not a chart), deselect
    if (e.target === e.currentTarget) {
      onChartSelect(null);
    }
  }, [onChartSelect]);

  console.log('📊 ChartsLayer - Rendering', charts.length, 'chart(s)');

  return (
    <>
      {charts.map((chart) => {
        console.log('📊 ChartObject - Rendering chart:', chart.id, {
          x: chart.x,
          y: chart.y,
          width: chart.width,
          height: chart.height,
          type: chart.chartType
        });
        return (
          <ChartElement
            key={chart.id}
            chart={chart}
            sheetId={sheetId}
            isSelected={selectedChartId === chart.id}
            onSelect={handleChartClick}
            cellData={cellData}
          />
        );
      })}
    </>
  );
}
