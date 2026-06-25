'use client';

import { useQuoteStore } from '@/stores/quoteStore';
import { User, Phone, Mail } from 'lucide-react';

export default function ClientDataForm() {
  const store = useQuoteStore();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 8) {
      store.setClientPhone(val);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#0D5C63] text-white text-xs font-bold flex items-center justify-center">
          8
        </span>
        <h3 className="text-sm font-semibold text-gray-800">Datos del Cliente</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={store.clientName}
              onChange={(e) => store.setClientName(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63]"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <div className="flex items-center h-10 rounded-lg border border-gray-300 focus-within:border-[#0D5C63] focus-within:ring-1 focus-within:ring-[#0D5C63]">
              <span className="pl-10 pr-1 text-sm text-gray-500 font-medium select-none">+569</span>
              <input
                type="text"
                inputMode="numeric"
                value={store.clientPhone}
                onChange={handlePhoneChange}
                placeholder="12345678"
                maxLength={8}
                className="flex-1 h-full pr-3 text-sm focus:outline-none rounded-r-lg"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={store.clientEmail}
              onChange={(e) => store.setClientEmail(e.target.value)}
              placeholder="cliente@ejemplo.cl"
              className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0D5C63] focus:ring-1 focus:ring-[#0D5C63]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
