'use client';

import { create } from 'zustand';
import {
  fetchCatalog,
  estimatePrice,
  createQuote,
  type CatalogData,
  type ProductType,
  type ProductLine,
  type Color,
  type GlassOption,
  type Accessory,
  type PricingRule,
  type QuoteItemInput,
  type QuoteResponse,
} from '@/lib/api';

// ─── State shape ───

interface SelectedAccessory {
  accessoryId: string;
  quantity: number;
}

interface QuoteConfigState {
  // Catalog
  catalog: CatalogData | null;
  catalogLoading: boolean;
  catalogError: string | null;

  // Current configuration
  productTypeId: string | null;
  productLineId: string | null;
  widthMm: number;
  heightMm: number;
  panelCount: number;
  colorId: string | null;
  glassOptionId: string | null;
  selectedAccessories: SelectedAccessory[];
  quantity: number;
  observations: string;

  // Quote submission
  submitting: boolean;
  submitError: string | null;
  lastQuote: QuoteResponse | null;

  // Computed price (client-side estimate)
  priceEstimate: ReturnType<typeof estimatePrice> | null;
}

interface QuoteConfigActions {
  // Catalog
  loadCatalog: () => Promise<void>;

  // Configuration
  setProductType: (id: string) => void;
  setProductLine: (id: string) => void;
  setWidth: (mm: number) => void;
  setHeight: (mm: number) => void;
  setPanelCount: (count: number) => void;
  setColor: (id: string) => void;
  setGlassOption: (id: string) => void;
  toggleAccessory: (id: string) => void;
  setAccessoryQuantity: (id: string, qty: number) => void;
  setQuantity: (qty: number) => void;
  setObservations: (obs: string) => void;

  // Price calculation
  recalculatePrice: () => void;

  // Quote submission
  submitQuote: () => Promise<QuoteResponse | null>;
  saveDraft: () => void;
  loadDraft: () => void;
  resetConfig: () => void;
}

type QuoteStore = QuoteConfigState & QuoteConfigActions;

// ─── Helpers ───

export function getAvailableLines(state: QuoteConfigState): ProductLine[] {
  if (!state.catalog || !state.productTypeId) return [];
  const lineIds = state.catalog.productTypeLines
    .filter((ptl) => ptl.productTypeId === state.productTypeId)
    .map((ptl) => ptl.productLineId);
  return state.catalog.productLines
    .filter((pl) => lineIds.includes(pl.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAvailableColors(state: QuoteConfigState): Color[] {
  if (!state.catalog || !state.productLineId) return [];
  const colorIds = state.catalog.productLineColors
    .filter((plc) => plc.productLineId === state.productLineId)
    .map((plc) => plc.colorId);
  return state.catalog.colors
    .filter((c) => colorIds.includes(c.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAvailableAccessories(state: QuoteConfigState): Accessory[] {
  if (!state.catalog || !state.productLineId) return [];
  const accIds = state.catalog.productLineAccessories
    .filter((pla) => pla.productLineId === state.productLineId)
    .map((pla) => pla.accessoryId);
  return state.catalog.accessories
    .filter((a) => accIds.includes(a.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPanelSurchargeRule(state: QuoteConfigState): PricingRule | null {
  if (!state.catalog || !state.productLineId) return null;
  return (
    state.catalog.pricingRules.find(
      (r) =>
        r.productLineId === state.productLineId &&
        r.ruleType === 'surcharge_per_panel'
    ) || null
  );
}

export function getCurrentProductType(state: QuoteConfigState): ProductType | null {
  if (!state.catalog || !state.productTypeId) return null;
  return state.catalog.productTypes.find((pt) => pt.id === state.productTypeId) || null;
}

export function getCurrentProductLine(state: QuoteConfigState): ProductLine | null {
  if (!state.catalog || !state.productLineId) return null;
  return state.catalog.productLines.find((pl) => pl.id === state.productLineId) || null;
}

export function getCurrentColor(state: QuoteConfigState): Color | null {
  if (!state.catalog || !state.colorId) return null;
  return state.catalog.colors.find((c) => c.id === state.colorId) || null;
}

export function getCurrentGlassOption(state: QuoteConfigState): GlassOption | null {
  if (!state.catalog || !state.glassOptionId) return null;
  return state.catalog.glassOptions.find((g) => g.id === state.glassOptionId) || null;
}

export function getCompletedSteps(state: QuoteConfigState): number[] {
  const completed: number[] = [];
  if (state.productTypeId) completed.push(1);
  if (state.productLineId) completed.push(2);
  if (state.widthMm > 0 && state.heightMm > 0) completed.push(3);
  if (state.colorId) completed.push(4);
  if (state.glassOptionId) completed.push(5);
  completed.push(6); // accessories optional
  if (state.quantity > 0) completed.push(7);
  if (state.productTypeId && state.productLineId && state.widthMm > 0 && state.heightMm > 0 && state.colorId && state.glassOptionId) {
    completed.push(8);
  }
  return completed;
}

// ─── Store ───

const initialState: QuoteConfigState = {
  catalog: null,
  catalogLoading: false,
  catalogError: null,
  productTypeId: null,
  productLineId: null,
  widthMm: 1200,
  heightMm: 1500,
  panelCount: 2,
  colorId: null,
  glassOptionId: null,
  selectedAccessories: [],
  quantity: 1,
  observations: '',
  submitting: false,
  submitError: null,
  lastQuote: null,
  priceEstimate: null,
};

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  ...initialState,

  loadCatalog: async () => {
    set({ catalogLoading: true, catalogError: null });
    try {
      const catalog = await fetchCatalog();
      set({ catalog, catalogLoading: false });
      if (catalog.productTypes.length > 0 && !get().productTypeId) {
        const firstType = catalog.productTypes.sort((a, b) => a.sortOrder - b.sortOrder)[0];
        get().setProductType(firstType.id);
      }
    } catch (err: unknown) {
      set({ catalogError: (err as Error).message, catalogLoading: false });
    }
  },

  setProductType: (id: string) => {
    set({ productTypeId: id, productLineId: null, colorId: null, glassOptionId: null, selectedAccessories: [] });
    const state = get();
    const lines = getAvailableLines({ ...state, productTypeId: id });
    if (lines.length > 0) {
      get().setProductLine(lines[0].id);
    }
  },

  setProductLine: (id: string) => {
    set({ productLineId: id, colorId: null, glassOptionId: null, selectedAccessories: [] });
    const state = get();
    const colors = getAvailableColors({ ...state, productLineId: id });
    if (colors.length > 0) {
      set({ colorId: colors[0].id });
    }
    if (state.catalog && state.catalog.glassOptions.length > 0) {
      set({ glassOptionId: state.catalog.glassOptions.sort((a, b) => a.sortOrder - b.sortOrder)[0].id });
    }
    setTimeout(() => get().recalculatePrice(), 0);
  },

  setWidth: (mm: number) => {
    set({ widthMm: Math.max(400, Math.min(4000, mm)) });
    get().recalculatePrice();
  },

  setHeight: (mm: number) => {
    set({ heightMm: Math.max(400, Math.min(3000, mm)) });
    get().recalculatePrice();
  },

  setPanelCount: (count: number) => {
    set({ panelCount: Math.max(1, Math.min(6, count)) });
    get().recalculatePrice();
  },

  setColor: (id: string) => {
    set({ colorId: id });
    get().recalculatePrice();
  },

  setGlassOption: (id: string) => {
    set({ glassOptionId: id });
    get().recalculatePrice();
  },

  toggleAccessory: (id: string) => {
    const current = get().selectedAccessories;
    const exists = current.find((a) => a.accessoryId === id);
    if (exists) {
      set({ selectedAccessories: current.filter((a) => a.accessoryId !== id) });
    } else {
      set({ selectedAccessories: [...current, { accessoryId: id, quantity: 1 }] });
    }
    get().recalculatePrice();
  },

  setAccessoryQuantity: (id: string, qty: number) => {
    const current = get().selectedAccessories;
    set({
      selectedAccessories: current.map((a) =>
        a.accessoryId === id ? { ...a, quantity: Math.max(1, qty) } : a
      ),
    });
    get().recalculatePrice();
  },

  setQuantity: (qty: number) => {
    set({ quantity: Math.max(1, Math.min(100, qty)) });
    get().recalculatePrice();
  },

  setObservations: (obs: string) => {
    set({ observations: obs });
  },

  recalculatePrice: () => {
    const state = get();
    const line = getCurrentProductLine(state);
    const color = getCurrentColor(state);
    const glass = getCurrentGlassOption(state);
    const panelRule = getPanelSurchargeRule(state);

    if (!line || !color || !glass) {
      set({ priceEstimate: null });
      return;
    }

    const accessoryPrices = state.selectedAccessories.map((sa) => {
      const acc = state.catalog?.accessories.find((a) => a.id === sa.accessoryId);
      return { price: acc?.price || 0, quantity: sa.quantity };
    });

    const minimumAreaRule = state.catalog?.pricingRules.find(
      (r) => r.productLineId === state.productLineId && r.ruleType === 'minimum_area'
    );

    const estimate = estimatePrice({
      widthMm: state.widthMm,
      heightMm: state.heightMm,
      panelCount: state.panelCount,
      quantity: state.quantity,
      pricePerM2: line.pricePerM2,
      colorSurchargePct: color.surchargePct,
      glassSurchargePct: glass.surchargePct,
      accessoryPrices,
      panelSurchargePct: panelRule?.value,
      minimumArea: minimumAreaRule?.value,
    });

    set({ priceEstimate: estimate });
  },

  submitQuote: async () => {
    const state = get();
    if (!state.productTypeId || !state.productLineId || !state.glassOptionId || !state.colorId) {
      set({ submitError: 'Complete todos los campos requeridos' });
      return null;
    }

    set({ submitting: true, submitError: null });

    const item: QuoteItemInput = {
      productTypeId: state.productTypeId,
      productLineId: state.productLineId,
      glassOptionId: state.glassOptionId,
      colorId: state.colorId,
      widthMm: state.widthMm,
      heightMm: state.heightMm,
      panelCount: state.panelCount,
      quantity: state.quantity,
      observations: state.observations || undefined,
      accessories: state.selectedAccessories,
    };

    try {
      const quote = await createQuote({
        notes: state.observations || undefined,
        items: [item],
      });
      set({ lastQuote: quote, submitting: false });
      return quote;
    } catch (err: unknown) {
      set({ submitError: (err as Error).message, submitting: false });
      return null;
    }
  },

  saveDraft: () => {
    const state = get();
    const draft = {
      productTypeId: state.productTypeId,
      productLineId: state.productLineId,
      widthMm: state.widthMm,
      heightMm: state.heightMm,
      panelCount: state.panelCount,
      colorId: state.colorId,
      glassOptionId: state.glassOptionId,
      selectedAccessories: state.selectedAccessories,
      quantity: state.quantity,
      observations: state.observations,
    };
    localStorage.setItem('crispieri_draft', JSON.stringify(draft));
  },

  loadDraft: () => {
    const raw = localStorage.getItem('crispieri_draft');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      set({
        productTypeId: draft.productTypeId,
        productLineId: draft.productLineId,
        widthMm: draft.widthMm || 1200,
        heightMm: draft.heightMm || 1500,
        panelCount: draft.panelCount || 2,
        colorId: draft.colorId,
        glassOptionId: draft.glassOptionId,
        selectedAccessories: draft.selectedAccessories || [],
        quantity: draft.quantity || 1,
        observations: draft.observations || '',
      });
      setTimeout(() => get().recalculatePrice(), 100);
    } catch {
      // Invalid draft, ignore
    }
  },

  resetConfig: () => {
    set({
      ...initialState,
      catalog: get().catalog,
    });
    localStorage.removeItem('crispieri_draft');
    const catalog = get().catalog;
    if (catalog && catalog.productTypes.length > 0) {
      get().setProductType(catalog.productTypes.sort((a, b) => a.sortOrder - b.sortOrder)[0].id);
    }
  },
}));
