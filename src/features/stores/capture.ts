import { create } from 'zustand'

export interface Capture {
  id: string
  data: string
  timestamp: number
}

interface CaptureStore {
  captures: Capture[]
  maxCaptures: number
  addCapture: (data: string) => void
  removeOldestCapture: () => void
  clearCaptures: () => void
  setMaxCaptures: (max: number) => void
}

export const useCaptureStore = create<CaptureStore>((set) => ({
  captures: [],
  maxCaptures: 10,

  addCapture: (data: string) =>
    set((state) => {
      const newCapture: Capture = {
        id: Date.now().toString(),
        data,
        timestamp: Date.now(),
      }

      let updatedCaptures = [newCapture, ...state.captures]

      if (updatedCaptures.length > state.maxCaptures) {
        updatedCaptures = updatedCaptures.slice(0, state.maxCaptures)
      }

      return { captures: updatedCaptures }
    }),

  removeOldestCapture: () =>
    set((state) => ({
      captures: state.captures.slice(0, -1),
    })),

  clearCaptures: () => set({ captures: [] }),

  setMaxCaptures: (max: number) => set({ maxCaptures: max }),
}))

// Selector functions
export const selectCaptures = (state: CaptureStore) => state.captures
export const selectMaxCaptures = (state: CaptureStore) => state.maxCaptures

// Utility function to get the capture store state without subscribing to changes
export const getCaptureStoreState = () => useCaptureStore.getState()
