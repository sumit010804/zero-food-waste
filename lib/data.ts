export type Role = "Student" | "Staff" | "NGO"

export type ListingStatus = "available" | "claimed" | "collected" | "expired" | "removed"

export type Listing = {
  id: string
  title: string
  category: string
  quantity: number
  unit: "kg" | "plates" | "liters" | "pieces"
  location: string
  freshness: "Hot" | "Warm" | "Chilled" | "Ambient"
  tags: string[]
  notes?: string
  postedBy: string
  createdAt: number
  availableFrom: number
  availableUntil: number
  safeHours: number
  expiresAt: number
  status: ListingStatus
  claimer?: {
    name: string
    role?: Role
    contact?: string
    claimedAt: number
    quantity?: number
  }
}

export type EventItem = {
  id: string
  name: string
  location: string
  organizer: string
  endAt: number
  createdAt: number
  logged?: boolean
}

export type SubscriptionPref = {
  id: string
  name: string
  role: Role
  categories: string[]
  locations: string[]
  enabled: boolean
  viaBrowserNotifications: boolean
}

export type ImpactFactors = {
  kgCO2PerKg: number
  litersWaterPerKg: number
  avgServingKg: number
}

export type Settings = {
  impact: ImpactFactors
  autoNotify: boolean
  remindBeforeMinutes: number
  userProfile: { name: string; role: Role; location?: string }
}

const KEYS = {
  listings: "ssf:listings",
  events: "ssf:events",
  subs: "ssf:subs",
  settings: "ssf:settings",
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
  try {
    const bc = new BroadcastChannel("ssf:channel")
    bc.postMessage({ type: "storage", key, at: Date.now() })
    bc.close()
  } catch {}
}

export const repo = {
  getListings(): Listing[] {
    return read<Listing[]>(KEYS.listings, [])
  },
  saveListings(list: Listing[]) {
    write(KEYS.listings, list)
  },
  getEvents(): EventItem[] {
    return read<EventItem[]>(KEYS.events, [])
  },
  saveEvents(list: EventItem[]) {
    write(KEYS.events, list)
  },
  getSubs(): SubscriptionPref[] {
    return read<SubscriptionPref[]>(KEYS.subs, [])
  },
  saveSubs(list: SubscriptionPref[]) {
    write(KEYS.subs, list)
  },
  getSettings(): Settings {
    return read<Settings>(KEYS.settings, {
      impact: { kgCO2PerKg: 2.5, litersWaterPerKg: 1500, avgServingKg: 0.35 },
      autoNotify: true,
      remindBeforeMinutes: 30,
      userProfile: { name: "You", role: "Student" },
    })
  },
  saveSettings(s: Settings) {
    write(KEYS.settings, s)
  },
  keys: KEYS,
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function now() {
  return Date.now()
}

export function minutes(n: number) {
  return n * 60 * 1000
}

export function hours(n: number) {
  return n * 60 * 60 * 1000
}

export function isExpired(item: Listing) {
  return item.expiresAt <= now() || item.availableUntil <= now()
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
