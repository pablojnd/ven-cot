'use client';

import { useQuoteStore } from '@/stores/quoteStore';
import { Minus, Plus } from 'lucide-react';

export default function DimensionInputs() {
  const store = useQuoteStore();
  const productType = store.catalog?.productTypes.find((pt) => pt.id === store.productTypeId);

  if (!store.productLineId) return null;

  const panelLabel = productType?.code === 'corredera' ? 'Correderas' : productType?.code === 'abatible' ? 'Hojas' : 'Hojas';
  const showPanelCount = productType?.code !== 'fijo';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          3
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Dimensiones</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Height */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alto</label>
          <div className="flex items-center">
            <button
              onClick={() => store.setHeight(store.heightMm - 50)}
              className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                value={store.heightMm}
                onChange={(e) => store.setHeight(Number(e.target.value))}
                min={400}
                max={3000}
                step={50}
                className="w-full h-10 text-center text-sm font-semibold border-y border-gray-300 focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => store.setHeight(store.heightMm + 50)}
              className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400">400 – 3.000 mm</span>
        </div>

        {/* Width */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ancho</label>
          <div className="flex items-center">
            <button
              onClick={() => store.setWidth(store.widthMm - 50)}
              className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                value={store.widthMm}
                onChange={(e) => store.setWidth(Number(e.target.value))}
                min={400}
                max={4000}
                step={50}
                className="w-full h-10 text-center text-sm font-semibold border-y border-gray-300 focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => store.setWidth(store.widthMm + 50)}
              className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400">400 – 4.000 mm</span>
        </div>

        {/* Panel count */}
        {showPanelCount && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad de hojas
            </label>
            <div className="flex items-center">
              <button
                onClick={() => store.setPanelCount(store.panelCount - 1)}
                disabled={store.panelCount <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 h-10 flex items-center justify-center border-y border-gray-300">
                <span className="text-sm font-semibold text-gray-800">
                  {store.panelCount} {panelLabel.toLowerCase()}
                </span>
              </div>
              <button
                onClick={() => store.setPanelCount(store.panelCount + 1)}
                disabled={store.panelCount >= 6}
                className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-400">1 – 6 hojas</span>
          </div>
        )}
      </div>
    </div>
  );
}
