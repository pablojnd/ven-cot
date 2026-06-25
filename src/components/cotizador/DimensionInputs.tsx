'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Minus, Plus } from 'lucide-react';

function DimensionInput({ label, valueMm, minM, maxM, onChange, onStep }: {
  label: string;
  valueMm: number;
  minM: number;
  maxM: number;
  onChange: (mm: number) => void;
  onStep: (delta: number) => void;
}) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText((valueMm / 1000).toFixed(2));
  }, [valueMm]);

  const commit = useCallback((raw: string) => {
    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed) && parsed >= minM && parsed <= maxM) {
      onChange(Math.round(parsed * 1000));
    } else {
      setText((valueMm / 1000).toFixed(2));
    }
  }, [valueMm, minM, maxM, onChange]);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center">
        <button
          onClick={() => onStep(-0.01)}
          className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => commit(text)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(text); }}
            className="w-full h-10 text-center text-sm font-semibold border-y border-gray-300 focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63"
          />
        </div>
        <button
          onClick={() => onStep(0.01)}
          className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs text-gray-400">{minM.toFixed(2)} – {maxM.toFixed(2)} m</span>
    </div>
  );
}

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
        <DimensionInput
          label="Alto"
          valueMm={store.heightMm}
          minM={0.4}
          maxM={3}
          onChange={(mm) => store.setHeight(mm)}
          onStep={(d) => store.setHeight(Math.round((store.heightMm / 1000 + d) * 1000))}
        />
        <DimensionInput
          label="Ancho"
          valueMm={store.widthMm}
          minM={0.4}
          maxM={4}
          onChange={(mm) => store.setWidth(mm)}
          onStep={(d) => store.setWidth(Math.round((store.widthMm / 1000 + d) * 1000))}
        />

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
