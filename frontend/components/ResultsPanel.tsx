import React from 'react';
import { Download, CheckCircle, XCircle, Loader2, BarChart2, TrendingDown } from 'lucide-react';
import { ConvertedFile, FileStatus } from '../types';

interface ResultsProps {
  files: ConvertedFile[];
  targetFormat: string;
  tokenUsed?: boolean | null;
  tokenRefunded?: boolean | null;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ResultsPanel: React.FC<ResultsProps> = ({ files, targetFormat, tokenUsed, tokenRefunded }) => {
  const completed = files.filter((f) => f.status === FileStatus.COMPLETED);
  const failed = files.filter((f) => f.status === FileStatus.ERROR);

  const totalOriginal = completed.reduce((s, f) => s + f.originalSize, 0);
  const totalResult = completed.reduce((s, f) => s + (f.resultSize ?? 0), 0);
  const savedPct = totalOriginal > 0 ? ((totalOriginal - totalResult) / totalOriginal) * 100 : 0;

  if (files.every((f) => f.status === FileStatus.PENDING)) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 size={16} className="text-brand-500" />
            Results
          </h3>
          {/* Token feedback */}
          {tokenUsed !== null && tokenUsed !== undefined && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              tokenRefunded ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
            }`}>
              {tokenRefunded ? '↩ Token refunded' : '⚡ 1 Token used'}
            </span>
          )}
        </div>

        {/* Summary stats */}
        {completed.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Original</p>
              <p className="text-sm font-semibold text-gray-700">{formatBytes(totalOriginal)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Output</p>
              <p className="text-sm font-semibold text-gray-700">{formatBytes(totalResult)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${savedPct > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                <TrendingDown size={10} /> Saved
              </p>
              <p className={`text-sm font-semibold ${savedPct > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {savedPct > 0 ? `${savedPct.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="divide-y divide-gray-50">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-shrink-0">
              {file.status === FileStatus.COMPLETED && <CheckCircle size={16} className="text-green-500" />}
              {file.status === FileStatus.ERROR && <XCircle size={16} className="text-red-400" />}
              {file.status === FileStatus.PROCESSING && <Loader2 size={16} className="text-brand-500 animate-spin" />}
              {file.status === FileStatus.PENDING && <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate font-medium">{file.originalName}</p>
              {file.status === FileStatus.ERROR && (
                <p className="text-xs text-red-400 truncate">{file.errorMessage}</p>
              )}
              {file.status === FileStatus.COMPLETED && file.resultSize && (
                <p className="text-xs text-gray-400">
                  {formatBytes(file.originalSize)} → {formatBytes(file.resultSize)}
                  {file.resultSize < file.originalSize && (
                    <span className="text-green-500 ml-1">
                      ↓{(((file.originalSize - file.resultSize) / file.originalSize) * 100).toFixed(1)}%
                    </span>
                  )}
                </p>
              )}
            </div>
            {file.status === FileStatus.COMPLETED && file.resultUrl && (
              <a
                href={file.resultUrl}
                download={`${file.originalName.replace(/\.[^.]+$/, '')}.${targetFormat}`}
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all shadow-brand hover:shadow-lg"
              >
                <Download size={12} />
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
