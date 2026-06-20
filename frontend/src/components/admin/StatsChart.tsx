import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface StatsChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  showTrend?: boolean;
  trendValue?: number;
  height?: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  title,
  data,
  type = 'bar',
  showTrend = false,
  trendValue = 0,
  height = 300,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  const getPiePercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  const defaultColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-yellow-500',
  ];

  const renderBarChart = () => (
    <div className="flex items-end justify-around h-full px-4 pb-8">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1 mx-2">
          <div className="relative w-full flex items-end justify-center" style={{ height: `${height - 80}px` }}>
            <div
              className={`w-full ${item.color || defaultColors[index % defaultColors.length]} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group`}
              style={{ height: `${getBarHeight(item.value)}%` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 text-center font-medium truncate w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-full px-4 pb-8">
      <svg width="100%" height={height - 80} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1="0"
            y1={`${percent}%`}
            x2="100%"
            y2={`${percent}%`}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Line path */}
        <polyline
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - getBarHeight(item.value);
            return `${x}%,${y}%`;
          }).join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - getBarHeight(item.value);
          return (
            <g key={index}>
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="5"
                fill="#3b82f6"
                className="hover:r-7 transition-all cursor-pointer"
              />
              <title>{`${item.label}: ${item.value.toLocaleString()}`}</title>
            </g>
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 text-center font-medium">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-8">
          {/* Pie Chart */}
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              // Calculate path
              const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
              const largeArc = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
                'Z'
              ].join(' ');

              currentAngle += angle;

              const colorMap: { [key: string]: string } = {
                'bg-blue-500': '#3b82f6',
                'bg-green-500': '#22c55e',
                'bg-purple-500': '#a855f7',
                'bg-orange-500': '#f97316',
                'bg-red-500': '#ef4444',
                'bg-indigo-500': '#6366f1',
                'bg-pink-500': '#ec4899',
                'bg-yellow-500': '#eab308',
              };

              const color = item.color ? colorMap[item.color] || colorMap[defaultColors[index % defaultColors.length]] : colorMap[defaultColors[index % defaultColors.length]];

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <title>{`${item.label}: ${item.value.toLocaleString()} (${getPiePercentage(item.value)}%)`}</title>
                  </path>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${item.color || defaultColors[index % defaultColors.length]}`}></div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-gray-500 ml-2">
                    {item.value.toLocaleString()} ({getPiePercentage(item.value)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {showTrend && (
          <div className={`flex items-center text-sm font-semibold ${
            trendValue >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trendValue >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Activity className="w-12 h-12 mb-2" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <>
            {type === 'bar' && renderBarChart()}
            {type === 'line' && renderLineChart()}
            {type === 'pie' && renderPieChart()}
          </>
        )}
      </div>

      {/* Summary */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-gray-900">{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob