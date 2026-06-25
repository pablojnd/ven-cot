'use client';

import { useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import AppHeader from './AppHeader';
import ProductTypeSelector from './ProductTypeSelector';
import LineSelector from './LineSelector';
import DimensionInputs from './DimensionInputs';
import ColorSelector from './ColorSelector';
import GlassSelector from './GlassSelector';
import QuantityNotes from './QuantityNotes';
import QuoteSummary from './QuoteSummary';
import { Loader2, AlertCircle } from 'lucide-react';

export default function QuoteConfigurator() {
  const store = useQuoteStore();

  useEffect(() => {
    store.loadCatalog();
    // Try loading draft
    const draft = localStorage.getItem('crispieri_draft');
    if (draft) {
      store.loadDraft();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      {/* Main content */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6">
        {store.catalogLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0D5C63] animate-spin mb-3" />
            <p className="text-sm text-gray-500">Cargando catálogo...</p>
          </div>
        ) : store.catalogError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-sm text-red-500">Error al cargar: {store.catalogError}</p>
            <button
              onClick={() => store.loadCatalog()}
              className="mt-3 px-4 py-2 text-sm bg-[#0D5C63] text-white rounded-lg hover:bg-[#0A4A50] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column: Configuration steps (2/3) */}
            <div className="flex-1 lg:w-2/3 space-y-6">
              <ProductTypeSelector />
              <LineSelector />
              <DimensionInputs />
              <ColorSelector />
              <GlassSelector />
              <QuantityNotes />
            </div>

            {/* Right column: Preview & Summary (1/3) - sticky */}
            <div className="lg:w-1/3">
              <div className="lg:sticky lg:top-[140px]">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <QuoteSummary />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Crispieri Cotizador — Sistema de cotización online
          </p>
        </div>
      </footer>
    </div>
  );
}
