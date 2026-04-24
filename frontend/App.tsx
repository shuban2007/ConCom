import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar, { AuthModal } from './components/Navbar';
import DropZone, { FileList } from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import DecisionCard from './components/DecisionCard';
import ResultsPanel from './components/ResultsPanel';
import { ConvertedFile, FileStatus, OperationType, CompressionLevel, ProcessingMode } from './types';
import { CONVERSION_MAP, decideProcessing } from './constants';
import { processFileClient, processViaServer } from './services/conversionService';

interface FileBatch {
  id: string;
  file: File;
}

const STORAGE_KEY = 'concom_files';

const MainApp: React.FC = () => {
  const { user, token, isLoggedIn, refreshUser } = useAuth();
  const [batches, setBatches] = useState<FileBatch[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [operation, setOperation] = useState<OperationType>('convert');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualOverride, setManualOverride] = useState<ProcessingMode | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [tokenUsed, setTokenUsed] = useState<boolean | null>(null);
  const [tokenRefunded, setTokenRefunded] = useState<boolean | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const decision = useMemo(() => {
    if (batches.length === 0 || !targetFormat) return null;
    return decideProcessing(
      batches.map((b) => b.file),
      targetFormat,
      isLoggedIn,
      user?.tokens ?? 0
    );
  }, [batches, targetFormat, isLoggedIn, user?.tokens]);

  const effectiveMode = manualOverride || decision?.mode;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const newBatches: FileBatch[] = newFiles.map((f) => ({ id: uuidv4(), file: f }));
    setBatches((prev) => {
      const combined = [...prev, ...newBatches];
      return combined;
    });
    setConvertedFiles([]);
    setTargetFormat('');
    setManualOverride(null);
    setTokenUsed(null);
    setTokenRefunded(null);
  }, []);

  const removeFile = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  const clearAll = () => {
    setBatches([]);
    setConvertedFiles([]);
    setTargetFormat('');
    setManualOverride(null);
    setTokenUsed(null);
    setTokenRefunded(null);
  };

  const handleConvert = async () => {
    if (!targetFormat || !effectiveMode || effectiveMode === 'blocked') return;
    if (isProcessing) return;

    setIsProcessing(true);
    setTokenUsed(null);
    setTokenRefunded(null);

    const files = batches.map((b) => b.file);

    // Initialize converted file states
    const initialConverted: ConvertedFile[] = batches.map((b) => ({
      id: b.id,
      originalName: b.file.name,
      originalSize: b.file.size,
      originalType: b.file.type,
      file: b.file,
      status: FileStatus.PROCESSING,
      progress: 0,
    }));
    setConvertedFiles(initialConverted);

    try {
      if (effectiveMode === 'server') {
        // SERVER PATH
        if (!token) {
          showToast('Login required for server processing', 'error');
          return;
        }
        const result = await processViaServer(files, targetFormat, operation, compressionLevel, token);

        const updated: ConvertedFile[] = batches.map((b, i) => {
          const r = result.results[i];
          if (r?.success) {
            const bytes = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: r.mimeType });
            const url = URL.createObjectURL(blob);
            return {
              ...initialConverted[i],
              status: FileStatus.COMPLETED,
              resultBlob: blob,
              resultUrl: url,
              resultSize: r.outputSize,
              progress: 100,
            };
          }
          return { ...initialConverted[i], status: FileStatus.ERROR, errorMessage: r?.error || 'Unknown error' };
        });
        setConvertedFiles(updated);
        setTokenUsed(result.tokenUsed);
        setTokenRefunded(result.tokenRefunded);
        if (result.tokenUsed) showToast('✅ Conversion complete. 1 token used.', 'success');
        else if (result.tokenRefunded) showToast('↩ All files failed. Token refunded.', 'info');
        await refreshUser(); // refresh token count in UI
      } else {
        // CLIENT PATH — process each file sequentially
        const updated = [...initialConverted];
        for (let i = 0; i < batches.length; i++) {
          try {
            const { blob, size } = await processFileClient(
              { ...initialConverted[i], targetFormat },
              targetFormat, operation, compressionLevel
            );
            const url = URL.createObjectURL(blob);
            updated[i] = { ...updated[i], status: FileStatus.COMPLETED, resultBlob: blob, resultUrl: url, resultSize: size, progress: 100 };
          } catch (err: any) {
            updated[i] = { ...updated[i], status: FileStatus.ERROR, errorMessage: err.message };
          }
          setConvertedFiles([...updated]);
        }
        const allFailed = updated.every((f) => f.status === FileStatus.ERROR);
        if (allFailed) showToast('❌ All conversions failed.', 'error');
        else showToast('✅ Conversion complete!', 'success');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
      setConvertedFiles(initialConverted.map((f) => ({ ...f, status: FileStatus.ERROR, errorMessage: err.message })));
    } finally {
      setIsProcessing(false);
    }
  };

  const canConvert = batches.length > 0 && !!targetFormat && effectiveMode !== 'blocked' && !isProcessing;

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar onAuthOpen={(mode = 'login') => setAuthModalMode(mode)} />

      {/* Auth Modal */}
      {authModalMode && <AuthModal onClose={() => setAuthModalMode(null)} defaultMode={authModalMode} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium text-white transition-all ${
          toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-gray-800'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <Zap size={14} className="text-brand-500" />
          100% Private · Browser or Server · Free to Start
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Convert any file,<br />
          <span className="text-brand-600">your way.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Images, videos, PDFs, documents — convert and compress instantly in your browser or on our secure servers.
        </p>
        {!isLoggedIn && (
          <button
            onClick={() => setAuthModalMode('register')}
            className="mt-6 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-brand hover:shadow-lg"
          >
            Get 10 free tokens <ArrowRight size={16} />
          </button>
        )}
      </section>

      {/* Main card */}
      <main className="max-w-3xl mx-auto px-6 pb-20 space-y-4">
        <DropZone onFilesSelected={handleFilesSelected} hasFiles={batches.length > 0} disabled={isProcessing} />

        {batches.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{batches.length} file{batches.length > 1 ? 's' : ''} selected</p>
              <button onClick={clearAll} disabled={isProcessing} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors">
                <Trash2 size={14} /> Clear all
              </button>
            </div>

            <FileList files={batches} onRemove={removeFile} disabled={isProcessing} />
            <SettingsPanel
              files={batches}
              targetFormat={targetFormat}
              setTargetFormat={(f) => { setTargetFormat(f); setManualOverride(null); }}
              operation={operation}
              setOperation={setOperation}
              compressionLevel={compressionLevel}
              setCompressionLevel={setCompressionLevel}
              disabled={isProcessing}
            />
            <DecisionCard
              decision={decision}
              manualOverride={manualOverride}
              setManualOverride={setManualOverride}
              hasFiles={batches.length > 0}
              targetFormat={targetFormat}
            />

            {/* Convert button */}
            <button
              onClick={handleConvert}
              disabled={!canConvert}
              className={`
                w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
                ${canConvert
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:shadow-lg hover:scale-[1.01]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <><Loader2 size={20} className="animate-spin" /> Processing…</>
              ) : (
                <>{effectiveMode === 'server' ? '🔵' : '🟢'} Convert {batches.length} File{batches.length > 1 ? 's' : ''}</>
              )}
            </button>
          </>
        )}

        {convertedFiles.length > 0 && (
          <ResultsPanel
            files={convertedFiles}
            targetFormat={targetFormat}
            tokenUsed={tokenUsed}
            tokenRefunded={tokenRefunded}
          />
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white/60 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} ConCom · Privacy-first file conversion · No data sold
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;