import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, FileText, X, Image, Film, Music } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  hasFiles: boolean;
  disabled?: boolean;
}

const fileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
  if (type.startsWith('video/')) return <Film size={16} className="text-purple-500" />;
  if (type.startsWith('audio/')) return <Music size={16} className="text-green-500" />;
  return <FileText size={16} className="text-gray-400" />;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, hasFiles, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesSelected(Array.from(e.target.files));
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
        transition-all duration-300 group
        ${isDragging
          ? 'border-brand-400 bg-brand-50 scale-[1.01]'
          : 'border-gray-200 hover:border-brand-300 hover:bg-blue-50/50 bg-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />

      <div className={`
        w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
        transition-all duration-300
        ${isDragging ? 'bg-brand-500 scale-110' : 'bg-gradient-to-br from-brand-100 to-brand-200 group-hover:from-brand-200 group-hover:to-brand-300'}
      `}>
        <UploadCloud size={28} className={isDragging ? 'text-white' : 'text-brand-600'} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {isDragging ? 'Drop files here' : 'Drop files or click to browse'}
      </h3>
      <p className="text-sm text-gray-400">Images, videos, audio, PDFs, documents, spreadsheets</p>
      <p className="text-xs text-gray-300 mt-1">Up to 500MB per file</p>
    </div>
  );
};

interface FileListProps {
  files: { id: string; file: File }[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, disabled }) => (
  <div className="space-y-2">
    {files.map(({ id, file }) => (
      <div key={id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex-shrink-0">{fileIcon(file.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
        </div>
        <button
          onClick={() => !disabled && onRemove(id)}
          disabled={disabled}
          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
        >
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
);

export default DropZone;