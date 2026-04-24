import React from 'react';
import { CONVERSION_MAP } from '../constants';
import { CompressionLevel, OperationType } from '../types';
import { RefreshCw, Minimize2, Layers } from 'lucide-react';

interface SettingsPanelProps {
  files: { file: File }[];
  targetFormat: string;
  setTargetFormat: (f: string) => void;
  operation: OperationType;
  setOperation: (o: OperationType) => void;
  compressionLevel: CompressionLevel;
  setCompressionLevel: (c: CompressionLevel) => void;
  disabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  files, targetFormat, setTargetFormat,
  operation, setOperation, compressionLevel, setCompressionLevel, disabled
}) => {
  // Get available formats from the first file
  const availableFormats: string[] = files.length > 0
    ? CONVERSION_MAP[files[0].file.type] || []
    : [];

  const ops: { key: OperationType; label: string; icon: React.ReactNode }[] = [
    { key: 'convert', label: 'Convert', icon: <RefreshCw size={14} /> },
    { key: 'compress', label: 'Compress', icon: <Minimize2 size={14} /> },
    { key: 'both', label: 'Both', icon: <Layers size={14} /> },
  ];

  const levels: { key: CompressionLevel; label: string; sub: string }[] = [
    { key: 'low', label: 'Best Quality', sub: '90%' },
    { key: 'medium', label: 'Balanced', sub: '75%' },
    { key: 'high', label: 'Max Compression', sub: '50%' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Conversion Settings</h3>

      {/* Operation Toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Operation</label>
        <div className="flex gap-2">
          {ops.map(({ key, label, icon }) => (
            <button
              key={key}
              disabled={disabled}
              onClick={() => setOperation(key)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${operation === key
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Format Picker */}
      {availableFormats.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Target Format</label>
          <div className="flex flex-wrap gap-2">
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                disabled={disabled}
                onClick={() => setTargetFormat(fmt)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-all
                  ${targetFormat === fmt
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                .{fmt}
              </button>
            ))}
          </div>
          {availableFormats.length === 0 && (
            <p className="text-sm text-gray-400">No supported formats for selected file type</p>
          )}
        </div>
      )}

      {/* Compression Level (only shown when relevant) */}
      {(operation === 'compress' || operation === 'both') && (
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Compression Level</label>
          <div className="flex gap-2">
            {levels.map(({ key, label, sub }) => (
              <button
                key={key}
                disabled={disabled}
                onClick={() => setCompressionLevel(key)}
                className={`
                  flex-1 py-2 px-3 rounded-xl text-sm font-medium text-center transition-all
                  ${compressionLevel === key
                    ? 'bg-brand-50 border-2 border-brand-400 text-brand-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div>{label}</div>
                <div className={`text-xs mt-0.5 ${compressionLevel === key ? 'text-brand-500' : 'text-gray-400'}`}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;