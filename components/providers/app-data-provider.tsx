"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  type Listing,
  type EventItem,
  type SubscriptionPref,
  type Settings,
  repo,
  uid,
  now,
  isExpired,
} from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

type Ctx = {
  listings: Listing[]
  events: EventItem[]
  subs: SubscriptionPref[]
  settings: Settings
  addListing: (data: Omit<Listing, "id" | "createdAt" | "status" | "expiresAt">) => Listing
  updateListing: (id: string, patch: Partial<Listing>) => void
  removeListing: (id: string) => void
  addEvent: (e: Omit<EventItem, "id" | "createdAt" | "logged">) => EventItem
  updateEvent: (id: string, patch: Partial<EventItem>) => void
  addSub: (s: Omit<SubscriptionPref, "id">) => SubscriptionPref
  updateSub: (id: string, patch: Partial<SubscriptionPref>) => void
  setSettings: (s: Settings) => void
}
const AppDataContext = createContext<Ctx | null>(null)

export function AppDataProvider({ children }: { children?: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(repo.getListings())
  const [events, setEvents] = useState<EventItem[]>(repo.getEvents())
  const [subs, setSubs] = useState<SubscriptionPref[]>(repo.getSubs())
  const [settings, setSettingsState] = useState<Settings>(repo.getSettings())
  const { toast } = useToast()
  const notifRef = useRef<null | ((title: string, body: string) => void)>(null)

  // Listen to BroadcastChannel and storage
  useEffect(() => {
    const bc = new BroadcastChannel("ssf:channel")
    const onMsg = (ev: MessageEvent) => {
      if (ev.data?.type === "storage") {
        setListings(repo.getListings())
        setEvents(repo.getEvents())
        setSubs(repo.getSubs())
        setSettingsState(repo.getSettings())
      }
    }
    bc.addEventListener("message", onMsg)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return
      if (e.key === repo.keys.listings) setListings(repo.getListings())
      if (e.key === repo.keys.events) setEvents(repo.getEvents())
      if (e.key === repo.keys.subs) setSubs(repo.getSubs())
      if (e.key === repo.keys.settings) setSettingsState(repo.getSettings())
    }
    window.addEventListener("storage", onStorage)
    return () => {
      bc.removeEventListener("message", onMsg)
      bc.close()
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  // Periodically purge expired listings and update status
  useEffect(() => {
    const tick = () => {
      let changed = false
      const upd = repo.getListings().map((l) => {
        if ((l.status === "available" || l.status === "claimed") && isExpired(l)) {
          changed = true
          return { ...l, status: "expired" }
        }
        return l
      })
      const filtered = upd.filter((l) => l.status !== "expired")
      if (changed || filtered.length !== upd.length) {
        repo.saveListings(filtered)
        setListings(filtered)
      }
    }
    const id = setInterval(tick, 30_000)
    tick()
    return () => clearInterval(id)
  }, [])

  // Notification hook from NotificationManager
  const registerNotifier = useCallback((fn: (title: string, body: string) => void) => {
    notifRef.current = fn
  }, [])

  // Save registration fn in a ref on window so NotificationManager can register
  useEffect(() => {
    ;(window as any).__ssf_registerNotifier = registerNotifier
  }, [registerNotifier])

  const notify = useCallback(
    (title: string, body: string) => {
      toast({ title, description: body })
      notifRef.current?.(title, body)
    },
    [toast],
  )

  const addListing = useCallback(
    (data) => {
      const item: Listing = {
        ...data,
        id: uid("lst"),
        createdAt: now(),
        status: "available",
        expiresAt: Math.min(data.availableUntil, data.availableFrom + data.safeHours * 3600_000),
      }
      const next = [item, ...repo.getListings()]
      repo.saveListings(next)
      setListings(next)
      // Notify subscribers whose categories/locations match
      if (settings.autoNotify) {
        const matches = subs.filter(
          (s) =>
            s.enabled &&
            (s.categories.length === 0 || s.categories.includes(item.category)) &&
            (s.locations.length === 0 || s.locations.includes(item.location)),
        )
        if (matches.length) {
          notify(
            "Surplus food available",
            `${item.title} • ${item.quantity} ${item.unit} at ${item.location} (${item.category})`,
          )
        }
      }
      return item
    },
    [listings, events, subs, settings],
  )

  const updateListing = useCallback(
    (id, patch) => {
      const next = repo.getListings().map((l) => (l.id === id ? { ...l, ...patch } : l))
      repo.saveListings(next)
      setListings(next)
    },
    [listings],
  )

  const removeListing = useCallback(
    (id) => {
      const next = repo.getListings().filter((l) => l.id !== id)
      repo.saveListings(next)
      setListings(next)
    },
    [listings],
  )

  const addEvent = useCallback(
    (e) => {
      const ev: EventItem = { ...e, id: uid("evt"), createdAt: now(), logged: false }
      const next = [ev, ...repo.getEvents()]
      repo.saveEvents(next)
      setEvents(next)
      return ev
    },
    [events],
  )

  const updateEvent = useCallback(
    (id, patch) => {
      const next = repo.getEvents().map((e) => (e.id === id ? { ...e, ...patch } : e))
      repo.saveEvents(next)
      setEvents(next)
    },
    [events],
  )

  const addSub = useCallback(
    (s) => {
      const sub: SubscriptionPref = { id: uid("sub"), ...s }
      const next = [sub, ...repo.getSubs()]
      repo.saveSubs(next)
      setSubs(next)
      return sub
    },
    [subs],
  )

  const updateSub = useCallback(
    (id, patch) => {
      const next = repo.getSubs().map((x) => (x.id === id ? { ...x, ...patch } : x))
      repo.saveSubs(next)
      setSubs(next)
    },
    [subs],
  )

  const setSettings = useCallback((s) => {
    repo.saveSettings(s)
    setSettingsState(s)
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      listings,
      events,
      subs,
      settings,
      addListing,
      updateListing,
      removeListing,
      addEvent,
      updateEvent,
      addSub,
      updateSub,
      setSettings,
    }),
    [listings, events, subs, settings],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider")
  return ctx
}
