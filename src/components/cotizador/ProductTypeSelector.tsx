'use client';

import { useQuoteStore, getAvailableLines } from '@/stores/quoteStore';
import { MoveDiagonal, DoorOpen, Square, Columns2 } from 'lucide-react';

const productIcons: Record<string, React.ReactNode> = {
  corredera: <Columns2 className="w-6 h-6" />,
  abatible: <MoveDiagonal className="w-6 h-6" />,
  puerta: <DoorOpen className="w-6 h-6" />,
  fijo: <Square className="w-6 h-6" />,
};

const productDescriptions: Record<string, string> = {
  corredera: 'Apertura lateral con rieles',
  abatible: 'Apertura hacia adentro o afuera',
  puerta: 'Puerta de acceso principal',
  fijo: 'Panel fijo sin apertura',
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {productTypes.map((pt) => {
          const isSelected = pt.id === selectedId;
          return (
            <button
              key={pt.id}
              onClick={() => store.setProductType(pt.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'border-[#0D5C63] bg-[#0D5C63]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Check indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {/* Icon */}
              <div className={`p-3 rounded-lg ${isSelected ? 'bg-[#0D5C63]/10 text-[#0D5C63]' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                {productIcons[pt.code] || <Square className="w-6 h-6" />}
              </div>
              {/* Label */}
              <span className={`text-sm font-medium text-center ${isSelected ? 'text-[#0D5C63]' : 'text-gray-700'}`}>
                {pt.name}
              </span>
              <span className="text-xs text-gray-400 text-center">
                {productDescriptions[pt.code] || pt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
