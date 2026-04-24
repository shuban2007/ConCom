import React, { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ConvertedFile, FileStatus } from '../types';

interface ResultsChartProps {
  files: ConvertedFile[];
}

const ResultsChart: React.FC<ResultsChartProps> = ({ files }) => {
  const [isDark, setIsDark] = useState(true);

  // Re-check theme for charts colors when it changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    // Use MutationObserver to watch for class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    const completed = files.filter(f => f.status === FileStatus.COMPLETED && f.resultSize);
    if (completed.length === 0) return [];

    let totalOriginal = 0;
    let totalResult = 0;

    completed.forEach(f => {
      totalOriginal += f.originalSize;
      totalResult += (f.resultSize || 0);
    });

    const saved = Math.max(0, totalOriginal - totalResult);
    
    return [
      { name: 'Original', size: totalOriginal, color: isDark ? '#6b7280' : '#9ca3af' },
      { name: 'New Size', size: totalResult, color: '#0ea5e9' },
      { name: 'Saved', size: saved, color: '#10b981' },
    ];
  }, [files, isDark]);

  if (data.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50 transition-colors duration-300">
      <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Compression Statistics
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 12 }} 
              width={80}
            />
            <Tooltip 
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              contentStyle={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff', 
                borderColor: isDark ? '#374151' : '#e5e7eb', 
                color: isDark ? '#f3f4f6' : '#111827',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [formatSize(value), 'Size']}
            />
            <Bar dataKey="size" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center text-sm text-gray-500 dark:text-gray-400">
        <p>Total Reduction: <span className="text-green-600 dark:text-green-400 font-bold">{formatSize(data[2].size)}</span></p>
      </div>
    </div>
  );
};

export default ResultsChart;