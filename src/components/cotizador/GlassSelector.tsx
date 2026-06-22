'use client';

import { useQuoteStore } from '@/stores/quoteStore';
import { Layers } from 'lucide-react';

const glassIcons: Record<string, string> = {
  simple: '◑',
  termopanel: '◫',
  'low-e': '◪',
  laminado: '◬',
};

export default function GlassSelector() {
  const store = useQuoteStore();
  const glassOptions = store.catalog?.glassOptions.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const selectedId = store.glassOptionId;

  if (!store.productLineId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          5
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Vidrio</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {glassOptions.map((glass) => {
          const isSelected = glass.id === selectedId;
          return (
            <button
              key={glass.id}
              onClick={() => store.setGlassOption(glass.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#0D5C63] bg-[#0D5C63]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-2xl">{glassIcons[glass.code] || '◫'}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-[#0D5C63]' : 'text-gray-700'}`}>
                {glass.name}
              </span>
              {glass.description && (
                <span className="text-xs text-gray-400 text-center leading-tight">{glass.description}</span>
              )}
              {glass.surchargePct > 0 && (
                <span className="text-xs font-semibold text-amber-600">+{glass.surchargePct}%</span>
              )}
              {glass.surchargePct === 0 && (
                <span className="text-xs font-medium text-emerald-600">Incluido</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
