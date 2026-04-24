import React from 'react';
import { Monitor, Server, Lock, Zap, AlertTriangle } from 'lucide-react';
import { DecisionResult, ProcessingMode } from '../types';
import { useAuth } from '../context/AuthContext';

interface DecisionCardProps {
  decision: DecisionResult | null;
  manualOverride: ProcessingMode | null;
  setManualOverride: (m: ProcessingMode | null) => void;
  hasFiles: boolean;
  targetFormat: string;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  decision, manualOverride, setManualOverride, hasFiles, targetFormat
}) => {
  const { isLoggedIn, user } = useAuth();
  const effectiveMode = manualOverride || decision?.mode;

  if (!hasFiles || !targetFormat || !decision) return null;

  const modeConfig = {
    client: {
      icon: <Monitor size={20} className="text-green-600" />,
      label: '🟢 Client Processing',
      sub: 'Your file stays on your device. Zero uploads.',
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700',
    },
    server: {
      icon: <Server size={20} className="text-blue-600" />,
      label: '🔵 Server Processing',
      sub: 'File is uploaded, processed securely, then deleted.',
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
    },
    blocked: {
      icon: <Lock size={20} className="text-red-500" />,
      label: '🔴 Processing Blocked',
      sub: 'Cannot process with current settings.',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
    },
  };

  const cfg = modeConfig[effectiveMode || 'blocked'];

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2 ${cfg.badge}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{cfg.label}</p>
            {decision.confidence && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                decision.confidence === 'high' ? 'bg-gray-100 text-gray-500' :
                decision.confidence === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-500'
              }`}>
                {decision.confidence} confidence
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{decision.reason}</p>
          <p className="text-xs text-gray-400 mt-0.5">{cfg.sub}</p>
        </div>
      </div>

      {/* Token warning for server mode */}
      {effectiveMode === 'server' && isLoggedIn && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm">
          <Zap size={14} className="text-amber-500 flex-shrink-0" />
          <span className="text-amber-700">
            ⚡ This action will use <strong>1 token</strong>.
            You have <strong>{user?.tokens ?? 0} remaining</strong>.
          </span>
        </div>
      )}

      {/* Override buttons (logged-in only) */}
      {isLoggedIn && effectiveMode !== 'blocked' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setManualOverride(null)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              !manualOverride
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Auto (Recommended)
          </button>
          <button
            onClick={() => setManualOverride('client')}
            disabled={effectiveMode === 'blocked'}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              manualOverride === 'client'
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            } disabled:opacity-40`}
          >
            <Monitor size={12} /> Force Client
          </button>
          <button
            onClick={() => setManualOverride('server')}
            disabled={(user?.tokens ?? 0) < 1}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              manualOverride === 'server'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            } disabled:opacity-40`}
          >
            <Server size={12} /> Use Server
          </button>
        </div>
      )}

      {/* Guest block nudge */}
      {!isLoggedIn && effectiveMode === 'blocked' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle size={14} />
          <span>Login required to unlock server processing.</span>
        </div>
      )}
    </div>
  );
};

export default DecisionCard;
