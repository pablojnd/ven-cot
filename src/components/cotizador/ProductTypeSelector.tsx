'use client';

import { useQuoteStore } from '@/stores/quoteStore';
import { MoveDiagonal, DoorOpen, Square, Columns2, Blinds, ShowerHead } from 'lucide-react';

const productIcons: Record<string, React.ReactNode> = {
  corredera: <Columns2 className="w-6 h-6" />,
  abatible: <MoveDiagonal className="w-6 h-6" />,
  puerta: <DoorOpen className="w-6 h-6" />,
  fijo: <Square className="w-6 h-6" />,
  celosia: <Blinds className="w-6 h-6" />,
  'shower-door': <ShowerHead className="w-6 h-6" />,
};

const productDescriptions: Record<string, string> = {
  corredera: 'Apertura lateral con rieles',
  abatible: 'Apertura hacia adentro o afuera',
  puerta: 'Puerta de acceso principal',
  fijo: 'Panel fijo sin apertura',
  celosia: 'Celosías de aluminio',
  'shower-door': 'Puerta de ducha',
};

export default function ProductTypeSelector() {
  const store = useQuoteStore();
  const productTypes = store.catalog?.productTypes.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const selectedId = store.productTypeId;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          1
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Tipo de producto</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {productTypes.map((pt) => {
          const isSelected = pt.id === selectedId;
          return (
            <button
              key={pt.id}
              onClick={() => store.setProductType(pt.id)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
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
              <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-[#0D5C63]/10 text-[#0D5C63]' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                {productIcons[pt.code] || <Square className="w-6 h-6" />}
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-[#0D5C63]' : 'text-gray-700'}`}>
                {pt.name}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                {productDescriptions[pt.code] || pt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
