'use client';

import { useQuoteStore, getCurrentProductType, getCurrentProductLine, getCurrentColor, getCurrentGlassOption, getAvailableAccessoriesForState } from '@/stores/quoteStore';
import { Eye, Package, Ruler, Palette, Layers, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import WindowPreview from './WindowPreview';

export default function QuoteSummary() {
  const store = useQuoteStore();
  const productType = getCurrentProductType(store);
  const productLine = getCurrentProductLine(store);
  const color = getCurrentColor(store);
  const glass = getCurrentGlassOption(store);
  const availableAccessories = getAvailableAccessoriesForState(store);
  const selectedAccessoryIds = store.selectedAccessories.map((a) => a.accessoryId);
  const selectedAccessoryNames = availableAccessories
    .filter((a) => selectedAccessoryIds.includes(a.id))
    .map((a) => a.name);

  const isConfigured = productType && productLine && color && glass;

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#0D5C63]" />
          <h4 className="text-sm font-semibold text-gray-700">Vista previa</h4>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <WindowPreview />
        </div>
        <p className="text-xs text-gray-400 text-center">
          {productType?.name || 'Producto'} • {store.panelCount} {productType?.code === 'corredera' ? 'correderas' : 'hojas'}
        </p>
      </div>

      {/* Selected characteristics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Características seleccionadas</h4>
        <div className="space-y-2">
          <CharacteristicRow
            icon={<Package className="w-3.5 h-3.5" />}
            label="Producto"
            value={productType?.name || '—'}
          />
          <CharacteristicRow
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Línea / Serie"
            value={productLine?.name || '—'}
          />
          <CharacteristicRow
            icon={<Ruler className="w-3.5 h-3.5" />}
            label="Dimensiones"
            value={store.widthMm > 0 ? `${(store.heightMm / 1000).toFixed(2)} m × ${(store.widthMm / 1000).toFixed(2)} m` : '—'}
          />
          <CharacteristicRow
            icon={<Ruler className="w-3.5 h-3.5" />}
            label="Hojas"
            value={`${store.panelCount} ${productType?.code === 'corredera' ? 'correderas' : 'hojas'}`}
          />
          <CharacteristicRow
            icon={<Palette className="w-3.5 h-3.5" />}
            label="Color del perfil"
            value={color?.name || '—'}
          />
          <CharacteristicRow
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Vidrio"
            value={glass?.name || '—'}
          />
          {selectedAccessoryNames.length > 0 && (
            <CharacteristicRow
              icon={<Wrench className="w-3.5 h-3.5" />}
              label="Accesorios"
              value={selectedAccessoryNames.join(', ')}
            />
          )}
        </div>
      </div>

      {/* Price breakdown */}
      {store.priceEstimate && isConfigured && (
        <PriceBreakdown />
      )}

      {/* Action buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={async () => {
            const result = await store.submitQuote();
            if (result) {
              toast.success(`Cotización ${result.quoteNumber} generada`, {
                description: `Total: $${Math.round(result.totalAmount + result.totalTax).toLocaleString('es-CL')} CLP (con IVA)`,
              });
            }
          }}
          disabled={store.submitting || !isConfigured}
          className="w-full py-3 px-4 bg-[#0D5C63] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0A4A50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {store.submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              Generar cotización
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <button
          onClick={() => {
            store.saveDraft();
            toast.success('Borrador guardado', {
              description: 'Se guardó la configuración actual como borrador',
            });
          }}
          disabled={!isConfigured}
          className="w-full py-2.5 px-4 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Guardar borrador
        </button>

        {store.submitError && (
          <p className="text-xs text-red-500 text-center">{store.submitError}</p>
        )}

        {store.lastQuote && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-sm font-semibold text-emerald-700">
              Cotización {store.lastQuote.quoteNumber} generada
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {`Total: $${Math.round(store.lastQuote.totalAmount + store.lastQuote.totalTax).toLocaleString('es-CL')} CLP (con IVA)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CharacteristicRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs text-gray-500 shrink-0">{label}:</span>
      <span className="text-xs font-medium text-gray-700 truncate">{value}</span>
    </div>
  );
}

function PriceBreakdown() {
  const store = useQuoteStore();
  const estimate = store.priceEstimate;
  if (!estimate) return null;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;
  const qty = store.quantity;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Resumen de precio</h4>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
        <PriceRow label="Subtotal neto" value={fmt(estimate.total)} />
        <PriceRow label="IVA (19%)" value={fmt(estimate.tax)} muted />
        <div className="border-t border-gray-200 my-1" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Total estimado</span>
          <span className="text-lg font-bold text-emerald-600">{fmt(estimate.total + estimate.tax)}</span>
        </div>
        {qty > 1 && (
          <div className="text-xs text-gray-400 text-right">
            {fmt(estimate.unitTotal + estimate.unitTotal * 0.19)} c/u (con IVA)
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Precio estimado sujeto a confirmación
      </p>
    </div>
  );
}

function PriceRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${muted ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-xs font-medium ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}
