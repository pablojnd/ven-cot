'use client';

import { useQuoteStore, getAvailableAccessories } from '@/stores/quoteStore';
import { getCurrentColor } from '@/stores/quoteStore';

export default function AccessoriesSelector() {
  const store = useQuoteStore();
  const accessories = getAvailableAccessories(store);
  const selectedIds = store.selectedAccessories.map((a) => a.accessoryId);
  const currentColor = getCurrentColor(store);
  const isCafeColor = currentColor?.code === 'cafe' || currentColor?.code === 'titanio' || currentColor?.code === 'blanco' || currentColor?.code === 'madera';

  if (!store.productLineId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          6
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Accesorios</h3>
        <span className="text-xs text-gray-400 font-normal">(opcional)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accessories.map((acc) => {
          const isSelected = selectedIds.includes(acc.id);
          const selectedAcc = store.selectedAccessories.find((a) => a.accessoryId === acc.id);
          const displayPrice = isCafeColor && acc.priceCafe > 0 ? acc.priceCafe : acc.price;

          return (
            <div
              key={acc.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#0D5C63] bg-[#0D5C63]/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <button
                onClick={() => store.toggleAccessory(acc.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{acc.name}</div>
                {acc.description && (
                  <div className="text-xs text-gray-400 truncate">{acc.description}</div>
                )}
              </div>

              <div className="text-sm font-semibold text-gray-700 shrink-0">
                ${Math.round(displayPrice).toLocaleString('es-CL')}
                {acc.unit !== 'unidad' && (
                  <span className="text-xs text-gray-400 font-normal">/{acc.unit}</span>
                )}
              </div>

              {isSelected && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      store.setAccessoryQuantity(acc.id, (selectedAcc?.quantity || 1) - 1);
                    }}
                    disabled={(selectedAcc?.quantity || 1) <= 1}
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:bg-gray-50 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{selectedAcc?.quantity || 1}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      store.setAccessoryQuantity(acc.id, (selectedAcc?.quantity || 1) + 1);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
