import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Property,
  Filters,
  SortType,
  Note,
  Appointment,
  QuoteItem,
  LightingMode,
  OpenSlot,
} from '@/types';
import { MOCK_PROPERTIES, MOCK_NOTES, MOCK_APPOINTMENTS, MOCK_VISIT_RECORDS, MOCK_OPEN_SLOTS } from '@/data/mock';
import type { VisitRecord } from '@/types';

interface AppState {
  properties: Property[];
  filters: Filters;
  sortBy: SortType;
  favorites: string[];
  compareList: string[];
  notes: Note[];
  appointments: Appointment[];
  visitRecords: VisitRecord[];
  quotes: QuoteItem[];
  openSlots: OpenSlot[];
  currentProperty: Property | null;
  currentRoomId: string;
  showFurniture: boolean;
  lightingMode: LightingMode;
  isMeasuring: boolean;
  measurePoints: { x: number; y: number; z: number }[];

  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setSortBy: (sort: SortType) => void;

  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;

  addToCompare: (propertyId: string) => void;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;

  setCurrentProperty: (property: Property | null) => void;
  setCurrentRoomId: (roomId: string) => void;
  setShowFurniture: (show: boolean) => void;
  setLightingMode: (mode: LightingMode) => void;
  setIsMeasuring: (measuring: boolean) => void;
  addMeasurePoint: (point: { x: number; y: number; z: number }) => void;
  clearMeasurePoints: () => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (noteId: string) => void;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  addQuote: (quote: QuoteItem) => void;
  removeQuote: (quoteId: string) => void;
  updateQuote: (quoteId: string, updates: Partial<QuoteItem>) => void;

  togglePropertySale: (propertyId: string) => void;
  addVisitRecord: (record: Omit<VisitRecord, 'id'>) => void;

  addOpenSlot: (slot: Omit<OpenSlot, 'id'>) => void;
  toggleSlotActive: (slotId: string) => void;
  deleteOpenSlot: (slotId: string) => void;
  getAvailableSlotsForProperty: (propertyId: string) => { date: string; timeSlots: string[] }[];

  getFilteredProperties: () => Property[];
  getPropertyById: (id: string) => Property | undefined;
  getCompareProperties: () => Property[];
}

const initialFilters: Filters = {
  districts: [],
  layouts: [],
  priceRange: [0, 10000],
  decorations: [],
  keyword: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      properties: MOCK_PROPERTIES,
      filters: initialFilters,
      sortBy: 'default',
      favorites: [],
      compareList: [],
      notes: MOCK_NOTES,
      appointments: MOCK_APPOINTMENTS,
      visitRecords: MOCK_VISIT_RECORDS,
      quotes: [],
      openSlots: MOCK_OPEN_SLOTS,
      currentProperty: null,
      currentRoomId: 'r1',
      showFurniture: true,
      lightingMode: 'day',
      isMeasuring: false,
      measurePoints: [],

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      setSortBy: (sort) => set({ sortBy: sort }),

      toggleFavorite: (propertyId) =>
        set((state) => ({
          favorites: state.favorites.includes(propertyId)
            ? state.favorites.filter((id) => id !== propertyId)
            : [...state.favorites, propertyId],
        })),

      isFavorite: (propertyId) => get().favorites.includes(propertyId),

      addToCompare: (propertyId) =>
        set((state) => {
          if (state.compareList.includes(propertyId) || state.compareList.length >= 4) {
            return state;
          }
          return { compareList: [...state.compareList, propertyId] };
        }),

      removeFromCompare: (propertyId) =>
        set((state) => ({
          compareList: state.compareList.filter((id) => id !== propertyId),
        })),

      clearCompare: () => set({ compareList: [] }),

      setCurrentProperty: (property) =>
        set({ currentProperty: property, currentRoomId: property?.rooms[0]?.id || 'r1' }),

      setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

      setShowFurniture: (show) => set({ showFurniture: show }),

      setLightingMode: (mode) => set({ lightingMode: mode }),

      setIsMeasuring: (measuring) =>
        set({ isMeasuring: measuring, measurePoints: measuring ? [] : get().measurePoints }),

      addMeasurePoint: (point) =>
        set((state) => {
          if (state.measurePoints.length >= 2) return state;
          return { measurePoints: [...state.measurePoints, point] };
        }),

      clearMeasurePoints: () => set({ measurePoints: [] }),

      addNote: (note) =>
        set((state) => ({
          notes: [
            {
              ...note,
              id: `n${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.notes,
          ],
        })),

      deleteNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        })),

      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [
            { ...appointment, id: `appt${Date.now()}` },
            ...state.appointments,
          ],
        })),

      updateAppointmentStatus: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      addQuote: (quote) =>
        set((state) => ({
          quotes: [...state.quotes, quote],
        })),

      removeQuote: (quoteId) =>
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== quoteId),
        })),

      updateQuote: (quoteId, updates) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === quoteId ? { ...q, ...updates } : q
          ),
        })),

      togglePropertySale: (propertyId) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId ? { ...p, isOnSale: !p.isOnSale } : p
          ),
        })),

      addVisitRecord: (record) =>
        set((state) => ({
          visitRecords: [
            { ...record, id: `v${Date.now()}` },
            ...state.visitRecords,
          ],
        })),

      addOpenSlot: (slot) =>
        set((state) => ({
          openSlots: [
            { ...slot, id: `os${Date.now()}` },
            ...state.openSlots,
          ],
        })),

      toggleSlotActive: (slotId) =>
        set((state) => ({
          openSlots: state.openSlots.map((s) =>
            s.id === slotId ? { ...s, isActive: !s.isActive } : s
          ),
        })),

      deleteOpenSlot: (slotId) =>
        set((state) => ({
          openSlots: state.openSlots.filter((s) => s.id !== slotId),
        })),

      getAvailableSlotsForProperty: (propertyId) => {
        const state = get();
        const propertySlots = state.openSlots.filter(
          (s) => s.propertyId === propertyId && s.isActive
        );
        const appointmentsForProperty = state.appointments.filter(
          (a) => a.propertyId === propertyId && a.status !== 'cancelled'
        );
        const grouped: Record<string, string[]> = {};
        propertySlots.forEach((slot) => {
          const booked = appointmentsForProperty.filter((a) => {
            const ad = new Date(a.time);
            const slotTime = slot.timeSlot.split('-')[0];
            return (
              ad.toISOString().split('T')[0] === slot.date &&
              `${String(ad.getHours()).padStart(2, '0')}:00` === slotTime
            );
          }).length;
          if (booked < slot.maxCapacity) {
            if (!grouped[slot.date]) grouped[slot.date] = [];
            grouped[slot.date].push(slot.timeSlot);
          }
        });
        return Object.entries(grouped)
          .map(([date, timeSlots]) => ({ date, timeSlots }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getFilteredProperties: () => {
        const state = get();
        let result = [...state.properties];

        if (state.filters.keyword) {
          const kw = state.filters.keyword.toLowerCase();
          result = result.filter(
            (p) =>
              p.title.toLowerCase().includes(kw) ||
              p.address.toLowerCase().includes(kw) ||
              p.community.toLowerCase().includes(kw)
          );
        }

        if (state.filters.districts.length > 0) {
          result = result.filter((p) => state.filters.districts.includes(p.district));
        }

        if (state.filters.layouts.length > 0) {
          result = result.filter((p) => {
            return state.filters.layouts.some((layout) => {
              if (layout === '5室及以上') {
                return p.bedrooms >= 5;
              }
              const match = layout.match(/^(\d+)室(\d+)厅$/);
              if (match) {
                const bedrooms = parseInt(match[1], 10);
                const livingrooms = parseInt(match[2], 10);
                return p.bedrooms === bedrooms && p.livingrooms === livingrooms;
              }
              return false;
            });
          });
        }

        const [minPrice, maxPrice] = state.filters.priceRange;
        result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

        if (state.filters.decorations.length > 0) {
          result = result.filter((p) => state.filters.decorations.includes(p.decoration));
        }

        switch (state.sortBy) {
          case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
          case 'area-desc':
            result.sort((a, b) => b.area - a.area);
            break;
          case 'newest':
            result.sort((a, b) => b.year - a.year);
            break;
        }

        return result;
      },

      getPropertyById: (id) => get().properties.find((p) => p.id === id),

      getCompareProperties: () => {
        const state = get();
        return state.compareList
          .map((id) => state.properties.find((p) => p.id === id))
          .filter(Boolean) as Property[];
      },
    }),
    {
      name: 'metaestate-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        compareList: state.compareList,
        notes: state.notes,
        appointments: state.appointments,
        quotes: state.quotes,
        openSlots: state.openSlots,
      }),
    }
  )
);
