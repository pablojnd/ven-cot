'use client';

import { useQuoteStore, getAvailableGlassForState } from '@/stores/quoteStore';
import { getGlassPrice } from '@/lib/api';
import { Layers } from 'lucide-react';

const glassIcons: Record<string, string> = {
  'doble-inc': '◫',
  'triple-inc': '◫◫',
  'vitrea-inc': '◪',
  'bronc-4mm': '◑',
  'bronc-5mm': '◑',
  'bronc-6mm': '◑',
  'catedral': '◬',
  'cat-color': '◬',
  'stop-sol': '☀',
  'solar-cool': '☀',
  'inast-6mm': '◆',
  'inast-8mm': '◆',
  'cr-inc-6mm': '◇',
  'termopanel': '◫◫◫',
  'reflex-bronc': '◉',
  'inc-4mm': '□',
  'inc-5mm': '□',
  'inc-6mm': '□',
};

export default function GlassSelector() {
  const store = useQuoteStore();
  const glassOptions = getAvailableGlassForState(store);

  if (!store.productLineId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          5
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Vidrio</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {glassOptions.map((glass) => {
          const isSelected = glass.id === store.glassOptionId;
          const pricePerM2 = store.catalog ? getGlassPrice(store.catalog, store.productLineId!, glass.id) : 0;

          return (
            <button
              key={glass.id}
              onClick={() => store.setGlassOption(glass.id)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#0D5C63] bg-[#0D5C63]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-xl">{glassIcons[glass.code] || '◫'}</span>
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-[#0D5C63]' : 'text-gray-700'}`}>
                {glass.name}
              </span>
              {pricePerM2 > 0 && (
                <span className="text-[10px] font-semibold text-emerald-600">
                  ${Math.round(pricePerM2).toLocaleString('es-CL')}/m²
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
