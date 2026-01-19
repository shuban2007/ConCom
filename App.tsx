import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FileStatus, 
  ConvertedFile, 
  CompressionLevel, 
  SupportedFormat 
} from './types';
import { CONVERSION_MAP, EXTENSION_TO_MIME } from './constants';
import { processFile } from './services/conversionService';
import Header from './components/Header';
import Hero from './components/Hero';
import DropZone from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import ResultsChart from './components/ResultsChart';
import { 
  X, 
  File as FileIcon, 
  CheckCircle, 
  Loader2, 
  Download, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat | ''>('');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(CompressionLevel.MEDIUM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Determine allowed formats based on the first file (assuming batch must be same type)
  const availableFormats = React.useMemo(() => {
    if (files.length === 0) return [];
    const firstFileType = files[0].originalType;
    return CONVERSION_MAP[firstFileType] || [];
  }, [files]);

  // Determine if we are working with images (for compression UI)
  const isImageBatch = React.useMemo(() => {
    if (files.length === 0) return false;
    return files[0].originalType.startsWith('image/');
  }, [files]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setGlobalError(null);

    // If we already have files, check consistency
    if (files.length > 0 && newFiles.length > 0) {
      const existingType = files[0].originalType;
      // Simple check: do they share the same conversion map?
      // Strict check: must be same MIME type for simplicity in batch logic
      const incompatible = newFiles.some(f => f.type !== existingType && !areTypesCompatible(existingType, f.type));
      
      if (incompatible) {
        setGlobalError("Batch uploads must be of the same file type to apply settings correctly.");
        return;
      }
    }

    const newEntries: ConvertedFile[] = newFiles.map(f => ({
      id: uuidv4(),
      originalName: f.name,
      originalSize: f.size,
      originalType: f.type,
      file: f,
      targetFormat: '', // Will be set by global state or default
      status: FileStatus.PENDING,
      progress: 0
    }));

    setFiles(prev => {
      const combined = [...prev, ...newEntries];
      // If we didn't have a target format, maybe set one default?
      return combined;
    });
  }, [files]);

  // Helper for loose compatibility (e.g. png and jpg are both images)
  const areTypesCompatible = (t1: string, t2: string) => {
    if (t1.startsWith('image/') && t2.startsWith('image/')) return true;
    return false;
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) {
      setTargetFormat('');
      setGlobalError(null);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setTargetFormat('');
    setGlobalError(null);
  };

  const handleConvert = async () => {
    if (!targetFormat) return;
    setIsProcessing(true);

    const pendingFiles = files.filter(f => f.status === FileStatus.PENDING || f.status === FileStatus.ERROR);
    
    // Process sequentially to not freeze browser main thread too much
    for (const fileItem of pendingFiles) {
      // Update status to processing
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: FileStatus.PROCESSING, targetFormat } : f));

      try {
        // Run conversion
        const result = await processFile({ ...fileItem, targetFormat }, compressionLevel);
        
        // Create download URL
        const url = URL.createObjectURL(result.blob);
        
        setFiles(prev => prev.map(f => f.id === fileItem.id ? {
          ...f,
          status: FileStatus.COMPLETED,
          resultBlob: result.blob,
          resultUrl: url,
          resultSize: result.size,
          progress: 100
        } : f));

      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? {
          ...f,
          status: FileStatus.ERROR,
          errorMessage: (err as Error).message
        } : f));
      }
    }
    
    setIsProcessing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <Hero />
      
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        
        <DropZone onFilesSelected={handleFilesSelected} hasFiles={files.length > 0} />

        {globalError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{globalError}</p>
            <button onClick={() => setGlobalError(null)} className="ml-auto hover:text-red-900 dark:hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        )}

        {files.length > 0 && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Files ({files.length})</h2>
              <button 
                onClick={clearAll}
                disabled={isProcessing}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Clear All
              </button>
            </div>

            <SettingsPanel 
              targetFormat={targetFormat}
              availableFormats={availableFormats}
              onFormatChange={(fmt) => setTargetFormat(fmt as SupportedFormat)}
              compressionLevel={compressionLevel}
              onCompressionChange={setCompressionLevel}
              isImage={isImageBatch}
              disabled={isProcessing}
            />

            <div className="space-y-3">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 shadow-sm dark:shadow-none"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-brand-600 dark:bg-gray-800 dark:text-brand-400">
                     <FileIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.originalName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>{formatBytes(file.originalSize)}</span>
                      {file.status === FileStatus.COMPLETED && file.resultSize && (
                        <>
                          <span>→</span>
                          <span className={file.resultSize < file.originalSize ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                            {formatBytes(file.resultSize)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-4">
                    {file.status === FileStatus.PENDING && (
                      <span className="text-xs text-gray-500">Ready</span>
                    )}
                    
                    {file.status === FileStatus.PROCESSING && (
                      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs font-medium">Converting...</span>
                      </div>
                    )}

                    {file.status === FileStatus.COMPLETED && (
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-green-600 dark:text-green-500 font-medium">Done</span>
                        <a 
                          href={file.resultUrl} 
                          download={`${file.originalName.split('.')[0]}.${targetFormat}`}
                          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-500"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </div>
                    )}

                    {file.status === FileStatus.ERROR && (
                      <div className="text-right">
                         <span className="block text-xs font-bold text-red-600 dark:text-red-500">Failed</span>
                         <span className="text-[10px] text-red-500 dark:text-red-400 max-w-[150px] truncate">{file.errorMessage}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 disabled:opacity-30"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-6 mt-8 flex justify-center">
               <button
                 onClick={handleConvert}
                 disabled={!targetFormat || isProcessing || files.every(f => f.status === FileStatus.COMPLETED)}
                 className={`
                   group relative flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold shadow-2xl transition-all
                   ${!targetFormat || isProcessing || files.every(f => f.status === FileStatus.COMPLETED)
                     ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
                     : 'bg-brand-500 text-white hover:bg-brand-400 hover:scale-105 hover:shadow-brand-500/50'
                   }
                 `}
               >
                 {isProcessing ? (
                   <>
                     <Loader2 className="h-5 w-5 animate-spin" />
                     Processing...
                   </>
                 ) : (
                   <>
                     Convert {files.length > 0 && files.filter(f => f.status === FileStatus.PENDING).length > 0 ? `(${files.filter(f => f.status === FileStatus.PENDING).length})` : ''} Files
                   </>
                 )}
               </button>
            </div>

            <ResultsChart files={files} />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 text-center text-gray-500">
           <p>&copy; {new Date().getFullYear()} ConCom. No data leaves your browser.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;