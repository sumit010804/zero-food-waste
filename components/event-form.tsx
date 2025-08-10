"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarPlus } from "lucide-react"
import { useAppData } from "@/components/providers/app-data-provider"

export function EventForm({ triggerLabel = "Add Event" }: { triggerLabel?: string }) {
  const { addEvent, settings } = useAppData()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState(settings.userProfile.location || "Auditorium")
  const [endAt, setEndAt] = useState(Date.now() + 2 * 3600_000)
  const [organizer, setOrganizer] = useState(settings.userProfile.name || "Organizer")

  const canSubmit = name.trim().length > 1

  const save = () => {
    if (!canSubmit) return
    addEvent({ name: name.trim(), location, endAt, organizer })
    setOpen(false)
    setName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarPlus className="w-4 h-4 mr-1" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Event name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Alumni Meet Dinner" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Ends at</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(endAt)}
                onChange={(e) => setEndAt(new Date(e.target.value).getTime())}
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Organizer</Label>
            <Input value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function toLocalInput(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
