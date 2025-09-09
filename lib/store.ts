import { create } from 'zustand'

export type RoastResult = {
  isRoom: boolean
  roast: string
  caption: string
  fix: string
  beforeAfter: string
  username: string | null
  messScore?: number
  extras?: Record<string, string>
}

export type SavedRoast = {
  id: string
  imageUri: string
  result: RoastResult
  createdAt: number
}

type RoastState = {
  imageUri: string | null
  roast: RoastResult | null
  savedRoasts: SavedRoast[]
  chat: any[]
  setImageUri: (uri: string | null) => void
  setRoast: (r: RoastResult | null) => void
  addSavedRoast: (imageUri: string, result: RoastResult) => void
  setSavedRoasts: (items: SavedRoast[]) => void
  setChat: (msgs: any[]) => void
  resetCurrent: () => void
}

export const useRoastStore = create<RoastState>((set) => ({
  imageUri: null,
  roast: null,
  savedRoasts: [],
  chat: [],
  setImageUri: (uri) => set({ imageUri: uri }),
  setRoast: (r) => set({ roast: r }),
  addSavedRoast: (imageUri, result) => set((s) => ({
    savedRoasts: [
      { id: `r_${Date.now()}`, imageUri, result, createdAt: Date.now() },
      ...s.savedRoasts
    ]
  })),
  setSavedRoasts: (items) => set({ savedRoasts: items }),
  setChat: (msgs) => set({ chat: msgs }),
  resetCurrent: () => set({ imageUri: null, roast: null, chat: [] })
}))

type CreditsState = {
  credits: number
  addDaily: () => void
  spend: (n: number) => boolean
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  credits: 3,
  addDaily: () => set({ credits: get().credits + 1 }),
  spend: (n) => {
    if (get().credits < n) return false
    set({ credits: get().credits - n })
    return true
  }
}))

type DebugState = {
  logs: string[]
  visible: boolean
  addLog: (m: string) => void
  clear: () => void
  setVisible: (v: boolean) => void
}

export const useDebugStore = create<DebugState>((set) => ({
  logs: [],
  visible: false,
  addLog: (m) => set((s) => ({ logs: [...s.logs.slice(-199), `${new Date().toISOString()} ${m}`] })),
  clear: () => set({ logs: [] }),
  setVisible: (v) => set({ visible: v })
}))
