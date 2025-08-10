"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppData } from "@/components/providers/app-data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/event-form"
import { ListingForm } from "@/components/listing-form"
import { AlarmClock, MapPin } from "lucide-react"

export default function Page() {
  const { events, updateEvent } = useAppData()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  const upcoming = useMemo(() => events.filter((e) => e.endAt > now).sort((a, b) => a.endAt - b.endAt), [events, now])
  const ended = useMemo(() => events.filter((e) => e.endAt <= now).sort((a, b) => b.endAt - a.endAt), [events, now])

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Events</h1>
        <EventForm />
      </div>
      {/* Reminder banner for events that just ended and not logged */}
      <Reminders />
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Upcoming</h2>
          <div className="grid gap-3">
            {upcoming.map((e) => (
              <Card key={e.id}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{e.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {e.location}
                    </span>
                    <span>Ends in {formatDistance(e.endAt - now)}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="px-4 pb-4">
                  <ListingForm
                    triggerLabel="Log surplus"
                    preset={{
                      title: e.name,
                      location: e.location,
                      availableFrom: e.endAt,
                      availableUntil: e.endAt + 2 * 3600_000,
                    }}
                  />
                </CardFooter>
              </Card>
            ))}
            {upcoming.length === 0 && <p className="text-xs text-muted-foreground">No upcoming events.</p>}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Ended</h2>
          <div className="grid gap-3">
            {ended.map((e) => (
              <Card key={e.id}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{e.name}</CardTitle>
                  <CardDescription className="text-xs">Ended {formatAgo(now - e.endAt)}</CardDescription>
                </CardHeader>
                <CardFooter className="px-4 pb-4 flex gap-2">
                  {!e.logged && (
                    <>
                      <ListingForm
                        triggerLabel="Log surplus"
                        preset={{
                          title: e.name,
                          location: e.location,
                          availableFrom: e.endAt,
                          availableUntil: e.endAt + 2 * 3600_000,
                        }}
                      />
                      <Button variant="ghost" onClick={() => updateEvent(e.id, { logged: true })}>
                        Dismiss
                      </Button>
                    </>
                  )}
                  {e.logged && <span className="text-xs text-muted-foreground">Logged</span>}
                </CardFooter>
              </Card>
            ))}
            {ended.length === 0 && <p className="text-xs text-muted-foreground">No ended events.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

function Reminders() {
  const { events, updateEvent } = useAppData()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])
  const pending = events.filter((e) => e.endAt <= now && !e.logged).slice(0, 1)
  if (pending.length === 0) return null
  const e = pending[0]
  return (
    <div
      role="region"
      aria-live="polite"
      className="mt-3 rounded-md border bg-muted/40 p-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <AlarmClock className="w-4 h-4" />
        <span className="text-sm">Event ended: {e.name}. Log any surplus food?</span>
      </div>
      <div className="flex items-center gap-2">
        <ListingForm
          triggerLabel="Log now"
          preset={{
            title: e.name,
            location: e.location,
            availableFrom: e.endAt,
            availableUntil: e.endAt + 2 * 3600_000,
          }}
        />
        <Button variant="ghost" size="sm" onClick={() => updateEvent(e.id, { logged: true })}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}

function formatDistance(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h > 0) return `${h}h ${mm}m`
  return `${mm}m`
}
function formatAgo(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d`
  if (h > 0) return `${h}h`
  return `${m}m`
}
