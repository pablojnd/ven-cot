'use client';

import { useQuoteStore, getAvailableLines } from '@/stores/quoteStore';

export default function LineSelector() {
  const store = useQuoteStore();
  const lines = getAvailableLines(store);
  const selectedId = store.productLineId;

  if (!store.productTypeId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          2
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Línea / Serie</h3>
      </div>

      {lines.length === 0 ? (
        <p className="text-sm text-gray-400">Seleccione un tipo de producto primero</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lines.map((line) => {
            const isSelected = line.id === selectedId;
            return (
              <button
                key={line.id}
                onClick={() => store.setProductLine(line.id)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
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
                <div className="font-medium text-sm text-gray-800">{line.name}</div>
                {line.description && (
                  <div className="text-xs text-gray-400 mt-1">{line.description}</div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-medium text-[#0D5C63]">
                    Margen: {line.marginPct}%
                  </span>
                  {line.marginPctCafe !== line.marginPct && (
                    <span className="text-xs text-amber-600">
                      Café: {line.marginPctCafe}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
