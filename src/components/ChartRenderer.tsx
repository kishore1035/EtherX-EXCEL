import { useEffect, useRef } from 'react';
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
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ChartConfiguration, ProcessedChartData } from '../utils/chartDataProcessor';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartRendererProps {
  config: ChartConfiguration;
  chartData: ProcessedChartData;
  width?: number;
  height?: number;
  isDarkMode?: boolean;
}

// White-gold gradient colors for elegant chart styling
const generateGradientColors = (count: number) => {
  const gradients = [
    ['rgba(255, 255, 255, 0.9)', 'rgba(255, 215, 0, 0.9)', 'rgba(255, 235, 150, 0.9)'],
    ['rgba(255, 250, 205, 0.9)', 'rgba(255, 215, 0, 0.9)', 'rgba(218, 165, 32, 0.9)'],
    ['rgba(255, 255, 240, 0.9)', 'rgba(255, 223, 0, 0.9)', 'rgba(255, 200, 50, 0.9)'],
    ['rgba(255, 248, 220, 0.9)', 'rgba(255, 215, 0, 0.9)', 'rgba(184, 134, 11, 0.9)'],
    ['rgba(255, 253, 208, 0.9)', 'rgba(255, 215, 0, 0.9)', 'rgba(238, 180, 34, 0.9)']
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(gradients[i % gradients.length]);
  }
  return result;
};

const borderGoldColors = [
  'rgba(255, 215, 0, 1)',
  'rgba(218, 165, 32, 1)',
  'rgba(255, 223, 0, 1)',
  'rgba(184, 134, 11, 1)',
  'rgba(238, 180, 34, 1)'
];

export function ChartRenderer({ config, chartData, width = 400, height = 300, isDarkMode = false }: ChartRendererProps) {
  const chartRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    console.log('ChartRenderer mounted with:', { 
      chartType: config.chartType,
      config, 
      chartData, 
      width, 
      height, 
      isDarkMode,
      hasLabels: chartData?.labels?.length,
      hasDatasets: chartData?.datasets?.length
    });
  }, [config, chartData, width, height, isDarkMode]);

  useEffect(() => {
    // Update chart when data changes
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [chartData]);

  // Validate data
  if (!chartData || !chartData.labels || !chartData.datasets) {
    console.error('Invalid chart data:', chartData);
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: isDarkMode ? '#FFFFFF' : '#000000',
        fontSize: '14px'
      }}>
        Invalid chart data
      </div>
    );
  }

  if (chartData.labels.length === 0 || chartData.datasets.length === 0) {
    console.warn('Empty chart data');
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: isDarkMode ? '#FFFFFF' : '#000000',
        fontSize: '14px'
      }}>
        No data to display
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        right: 8,
        bottom: 50,
        left: 8
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    plugins: {
      legend: {
        display: config.showLegend ?? true,
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#FFFFFF' : '#000000',
          font: {
            size: 8,
            weight: 'bold' as const
          },
          padding: 2,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8
        }
      },
      title: {
        display: !!config.title,
        text: config.title,
        color: isDarkMode ? '#FFD700' : '#000000',
        font: {
          size: 11,
          weight: 'bold' as const,
          family: "'Segoe UI', 'Arial', sans-serif"
        },
        padding: 3
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#FFD700' : '#000000',
        bodyColor: isDarkMode ? '#CCCCCC' : '#374151',
        borderColor: '#F0A500',
        borderWidth: 2,
        padding: 6,
        cornerRadius: 4,
        displayColors: true,
        boxPadding: 3,
        usePointStyle: true,
        titleFont: {
          size: 9,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 8
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat().format(context.parsed.y);
            } else if (context.parsed !== null) {
              label += new Intl.NumberFormat().format(context.parsed);
            }
            return label;
          }
        }
      },
      datalabels: {
        display: config.showDataLabels ?? false,
        color: isDarkMode ? '#FFFFFF' : '#000000',
        font: {
          size: 11,
          weight: 'bold' as const
        },
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        padding: 4
      }
    },
    scales: config.chartType !== 'pie' ? {
      x: {
        title: {
          display: true,
          text: config.xAxisColumn || 'X-Axis',
          color: isDarkMode ? '#FFD700' : '#374151',
          font: {
            size: 8,
            weight: 'bold' as const
          },
          padding: { top: 10 }
        },
        ticks: {
          color: isDarkMode ? '#CCCCCC' : '#374151',
          font: {
            size: 7
          },
          padding: 10,
          maxRotation: 0,
          minRotation: 0
        },
        grid: {
          color: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
          lineWidth: 0.5,
          drawTicks: true,
          tickLength: 4
        },
        border: {
          color: isDarkMode ? '#FFD700' : '#d1d5db',
          width: 1
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: isDarkMode ? '#FFD700' : '#374151',
          font: {
            size: 8,
            weight: 'bold' as const
          },
          padding: { bottom: 2 }
        },
        ticks: {
          color: isDarkMode ? '#CCCCCC' : '#374151',
          font: {
            size: 7
          },
          padding: 2,
          callback: function(value: any) {
            return new Intl.NumberFormat().format(value);
          }
        },
        grid: {
          color: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
          lineWidth: 0.5,
          drawTicks: true,
          tickLength: 4
        },
        border: {
          color: isDarkMode ? '#FFD700' : '#d1d5db',
          width: 1
        },
        beginAtZero: true
      }
    } : undefined,
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
        inflateAmount: 1
      },
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const
      },
      point: {
        hoverBorderWidth: 4,
        hitRadius: 10
      },
      arc: {
        borderWidth: 3,
        hoverBorderWidth: 5,
        offset: 4,
        spacing: 2
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'xy' as const,
      intersect: false
    }
  };

  console.log('Rendering chart type:', config.chartType);
  console.log('Chart data summary:', {
    labels: chartData.labels,
    datasetCount: chartData.datasets.length,
    firstDataset: chartData.datasets[0]
  });

  // Create glossy gradient effects using canvas
  useEffect(() => {
    if (chartRef.current && chartRef.current.canvas) {
      const canvas = chartRef.current.canvas;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvasRef.current = canvas;
      }
    }
  }, [chartRef.current]);

  // Apply white-gold gradient styling with glossy effect
  const styledChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset, index) => {
      const gradientColors = generateGradientColors(chartData.datasets.length);
      
      if (config.chartType === 'pie') {
        // For pie charts, create shiny gradient for each slice
        return {
          ...dataset,
          backgroundColor: chartData.labels.map((_, i) => {
            const baseColor = borderGoldColors[i % borderGoldColors.length];
            return baseColor;
          }),
          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverBorderColor: '#F0A500',
          hoverBorderWidth: 4,
          // Add glossy effect
          borderRadius: 4,
          hoverOffset: 8
        };
      } else if (config.chartType === 'line') {
        // For line charts, use gradient borders with glow
        return {
          ...dataset,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'transparent';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.05)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)');
            return gradient;
          },
          borderColor: borderGoldColors[index % borderGoldColors.length],
          borderWidth: 4,
          pointBackgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx} = chart;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.5, '#FFD700');
            gradient.addColorStop(1, '#DAA520');
            return gradient;
          },
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#F0A500',
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true,
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          shadowBlur: 4,
          shadowColor: 'rgba(255, 215, 0, 0.3)'
        };
      } else {
        // For column/bar charts with glossy gradient effect
        return {
          ...dataset,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return borderGoldColors[index % borderGoldColors.length];
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            // Glossy white-gold gradient
            gradient.addColorStop(0, '#DAA520'); // Dark gold at bottom
            gradient.addColorStop(0.3, '#FFD700'); // Bright gold
            gradient.addColorStop(0.5, '#FFFACD'); // Light gold/cream (shine)
            gradient.addColorStop(0.6, '#FFD700'); // Gold again
            gradient.addColorStop(1, '#FFA500'); // Orange-gold at top
            return gradient;
          },
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverBackgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return '#FFD700';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#B8860B'); // Darker gold
            gradient.addColorStop(0.3, '#FFD700');
            gradient.addColorStop(0.5, '#FFFFFF'); // Bright shine
            gradient.addColorStop(0.6, '#FFD700');
            gradient.addColorStop(1, '#FF8C00');
            return gradient;
          },
          hoverBorderColor: '#FFFFFF',
          hoverBorderWidth: 3,
          borderRadius: 6,
          borderSkipped: false
        };
      }
    })
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '4px 6px 30px 6px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
      borderRadius: '8px',
      boxShadow: isDarkMode
        ? '0 8px 32px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glass effect overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: isDarkMode
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
        pointerEvents: 'none',
        borderRadius: '8px 8px 0 0'
      }} />
      
      {/* Subtle gold glow border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '8px',
        padding: '2px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex' }}>
        {config.chartType === 'column' && (
          <Bar ref={chartRef} data={styledChartData} options={chartOptions} />
        )}
        {config.chartType === 'line' && (
          <Line ref={chartRef} data={styledChartData} options={chartOptions} />
        )}
        {config.chartType === 'pie' && (
          <Pie ref={chartRef} data={styledChartData} options={chartOptions} />
        )}
        {config.chartType !== 'column' && config.chartType !== 'line' && config.chartType !== 'pie' && (
          <div style={{ padding: '20px' }}>
            Unknown chart type: {config.chartType}
          </div>
        )}
      </div>
    </div>
  );
}
