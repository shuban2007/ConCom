import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  hasFiles: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, hasFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndPassFiles = (fileList: FileList | null) => {
    setError(null);
    if (!fileList) return;

    const validFiles: File[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        return; // Stop processing batch if one is too big
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    // Reset value so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-8">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-brand-500 bg-brand-500/10 scale-[1.02]' 
            : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-gray-500 dark:hover:bg-gray-800'
          }
          ${hasFiles ? 'h-32' : 'h-64'}
        `}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className={`
            mb-4 rounded-full p-4 transition-transform duration-300 group-hover:scale-110
            ${isDragging 
              ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' 
              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }
          `}>
            {isDragging ? <FileType className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
            {isDragging ? 'Drop files here' : 'Click or Drag files here'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Up to {MAX_FILE_SIZE_MB}MB per file.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;