import React from 'react';

interface ChartProps {
  title: string;
  data: { label: string; value: number }[];
  /** Denominator for the bar width (e.g. 5 for an average rating). Defaults to the max value in data. */
  max?: number;
  /** Cap the height and scroll the rows internally when there are many entries. */
  scrollable?: boolean;
}

const Chart: React.FC<ChartProps> = ({ title, data, max, scrollable }) => {
  const maxValue = max ?? Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className={`space-y-4 ${scrollable ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
        {data.length === 0 && (
          <p className="text-sm text-gray-400">Sin datos</p>
        )}
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-20 text-sm text-gray-600 font-medium truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm font-medium text-gray-900 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;