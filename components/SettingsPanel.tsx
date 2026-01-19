import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import { CompressionLevel, COMPRESSION_SETTINGS, SupportedFormat } from '../types';

interface SettingsPanelProps {
  targetFormat: SupportedFormat | '';
  availableFormats: SupportedFormat[];
  onFormatChange: (fmt: string) => void;
  compressionLevel: CompressionLevel;
  onCompressionChange: (level: CompressionLevel) => void;
  isImage: boolean;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  targetFormat,
  availableFormats,
  onFormatChange,
  compressionLevel,
  onCompressionChange,
  isImage,
  disabled
}) => {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4 text-brand-600 dark:text-brand-400 font-semibold">
        <Settings className="h-5 w-5" />
        <span>Conversion Settings</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Output Format */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
            Output Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                disabled={disabled}
                onClick={() => onFormatChange(fmt)}
                className={`
                  rounded-lg border px-4 py-2 text-sm font-medium uppercase transition-all
                  ${targetFormat === fmt 
                    ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-md dark:bg-brand-500/20 dark:text-brand-400 dark:shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Compression Level - Only for images or PDF */}
        <div className={!isImage ? 'opacity-50 pointer-events-none grayscale' : ''}>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Compression Level
            </label>
            <span className="text-xs text-brand-600 dark:text-brand-400">
              {COMPRESSION_SETTINGS[compressionLevel].label}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(COMPRESSION_SETTINGS) as CompressionLevel[]).map((level) => (
              <button
                key={level}
                disabled={disabled || !isImage}
                onClick={() => onCompressionChange(level)}
                className={`
                  rounded-lg border px-3 py-2 text-xs font-medium transition-all
                  ${compressionLevel === level
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' 
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;