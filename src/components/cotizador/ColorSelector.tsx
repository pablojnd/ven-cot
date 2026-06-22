'use client';

import { useQuoteStore, getAvailableColors } from '@/stores/quoteStore';

export default function ColorSelector() {
  const store = useQuoteStore();
  const colors = getAvailableColors(store);
  const selectedId = store.colorId;

  if (!store.productLineId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          4
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Color del perfil</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = color.id === selectedId;
          const isLight = color.hexValue && ['#FFFFFF', '#FFF', '#C0C0C0'].some(v => color.hexValue?.toUpperCase().startsWith(v));

          return (
            <button
              key={color.id}
              onClick={() => store.setColor(color.id)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer min-w-[80px] ${
                isSelected
                  ? 'border-[#0D5C63] bg-[#0D5C63]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-lg border-2 ${isLight ? 'border-gray-300' : 'border-transparent'} shadow-inner`}
                style={{ backgroundColor: color.hexValue || '#888888' }}
              />
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-[#0D5C63]' : 'text-gray-600'}`}>
                {color.name}
              </span>
              {color.surchargePct > 0 && (
                <span className="text-[10px] text-amber-600 font-medium">
                  +{color.surchargePct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
