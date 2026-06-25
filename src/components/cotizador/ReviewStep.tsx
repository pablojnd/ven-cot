'use client';

import { useQuoteStore, getCurrentProductType, getCurrentProductLine, getCurrentColor, getCurrentGlassOption, getAvailableAccessoriesForState, getCompletedSteps } from '@/stores/quoteStore';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ReviewStep() {
  const store = useQuoteStore();
  const productType = getCurrentProductType(store);
  const productLine = getCurrentProductLine(store);
  const color = getCurrentColor(store);
  const glass = getCurrentGlassOption(store);
  const availableAccessories = getAvailableAccessoriesForState(store);
  const selectedAccessoryNames = availableAccessories.map((a) => a.name);
  const completedSteps = getCompletedSteps(store);
  const allComplete = completedSteps.includes(8);
  const estimate = store.priceEstimate;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;

  const steps = [
    { num: 1, label: 'Tipo de producto', value: productType?.name, required: true },
    { num: 2, label: 'Línea / Serie', value: productLine?.name, required: true },
    { num: 3, label: 'Dimensiones', value: `${Math.round(store.heightMm / 10)} cm × ${Math.round(store.widthMm / 10)} cm`, required: true },
    { num: 4, label: 'Color del perfil', value: color?.name, required: true },
    { num: 5, label: 'Vidrio', value: glass?.name, required: true },
    { num: 6, label: 'Accesorios', value: selectedAccessoryNames.length > 0 ? selectedAccessoryNames.join(', ') : 'Sin accesorios disponibles', required: true },
    { num: 7, label: 'Cantidad', value: `${store.quantity} unidades`, required: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          8
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Revisión final</h3>
      </div>

      <div className={`p-4 rounded-xl border-2 ${allComplete ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
        <div className="flex items-center gap-2 mb-3">
          {allComplete ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">Configuración completa</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">Pendiente</span>
            </>
          )}
        </div>

        <div className="space-y-2">
          {steps.map((step) => {
            const isComplete = step.required ? !!step.value : true;
            return (
              <div key={step.num} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {isComplete ? '✓' : step.num}
                  </span>
                  <span className="text-xs text-gray-500">{step.label}</span>
                </div>
                <span className={`text-xs font-medium ${isComplete ? 'text-gray-700' : 'text-amber-500'}`}>
                  {step.value || 'Sin completar'}
                </span>
              </div>
            );
          })}
        </div>

        {estimate && allComplete && (
          <div className="mt-4 pt-3 border-t border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total neto estimado</span>
              <span className="text-lg font-bold text-emerald-600">{fmt(estimate.total)}</span>
            </div>
            {store.quantity > 1 && (
              <div className="text-xs text-gray-400 text-right">{fmt(estimate.unitTotal)} c/u neto</div>
            )}
            <div className="text-xs text-gray-400 text-right">IVA referencial: {fmt(estimate.tax)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
