import React from 'react';

interface RewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  suggestedText?: string;
  reasoning?: string;
  missingInfo?: string[];
  isLoading: boolean;
  onRewrite: (text: string) => Promise<void>;
}

export default function RewriteModal({
  isOpen,
  onClose,
  originalText,
  suggestedText,
  reasoning,
  missingInfo,
  isLoading,
  onRewrite,
}: RewriteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg text-sm">AI</span>
            Bullet Optimizer
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original Bullet</span>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 italic">
              "{originalText}"
            </div>
          </div>

          {suggestedText ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Suggestion</span>
                <div className="p-4 bg-blue-50 rounded-xl text-slate-900 border border-blue-100 font-medium">
                  {suggestedText}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-xs font-semibold text-amber-700 uppercase block mb-1">Why this is better</span>
                <p className="text-sm text-amber-800">{reasoning}</p>
              </div>

              {missingInfo && missingInfo.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">How to improve further</span>
                  <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                    {missingInfo.map((info, i) => <li key={i}>{info}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>AI is analyzing your experience...</p>
                </div>
              ) : (
                <p>Click the button below to generate a high-impact version.</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          {!suggestedText ? (
            <button
              onClick={() => onRewrite(originalText)}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:bg-blue-300 flex items-center gap-2"
            >
              {isLoading && <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Generate Suggestion
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
            >
              Accept Suggestion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
