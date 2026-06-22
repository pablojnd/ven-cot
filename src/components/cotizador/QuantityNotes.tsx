'use client';

import { useQuoteStore } from '@/stores/quoteStore';
import { Minus, Plus } from 'lucide-react';

export default function QuantityNotes() {
  const store = useQuoteStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          7
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Cantidad y observaciones</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</label>
          <div className="flex items-center">
            <button
              onClick={() => store.setQuantity(store.quantity - 1)}
              disabled={store.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 h-10 flex items-center justify-center border-y border-gray-300">
              <input
                type="number"
                value={store.quantity}
                onChange={(e) => store.setQuantity(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full h-full text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => store.setQuantity(store.quantity + 1)}
              disabled={store.quantity >= 100}
              className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400">unidades</span>
        </div>

        {/* Observations */}
        <div className="space-y-1.5 sm:col-span-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Observaciones
            <span className="ml-2 text-gray-300 font-normal">{store.observations.length}/300</span>
          </label>
          <textarea
            value={store.observations}
            onChange={(e) => {
              if (e.target.value.length <= 300) store.setObservations(e.target.value);
            }}
            placeholder="Orientación, ubicación, notas especiales..."
            rows={3}
            className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
