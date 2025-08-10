"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarClock, Plus } from "lucide-react"
import { useAppData } from "@/components/providers/app-data-provider"
import type { Listing } from "@/lib/data"

type Props = {
  triggerLabel?: string
  preset?: Partial<Listing>
}
export function ListingForm({ triggerLabel = "New Listing", preset = {} }: Props) {
  const { addListing, settings } = useAppData()
  const [open, setOpen] = useState(false)
  const now = Date.now()
  const [title, setTitle] = useState(preset.title || "")
  const [category, setCategory] = useState(preset.category || "Meals")
  const [quantity, setQuantity] = useState<number>(preset.quantity || 10)
  const [unit, setUnit] = useState<"kg" | "plates" | "liters" | "pieces">((preset.unit as any) || "plates")
  const [location, setLocation] = useState(preset.location || settings.userProfile.location || "Main Canteen")
  const [freshness, setFreshness] = useState<"Hot" | "Warm" | "Chilled" | "Ambient">(
    (preset.freshness as any) || "Warm",
  )
  const [safeHours, setSafeHours] = useState<number>(preset.safeHours || 3)
  const [availableFrom, setAvailableFrom] = useState<number>(preset.availableFrom || now)
  const [availableUntil, setAvailableUntil] = useState<number>(preset.availableUntil || now + 2 * 3600_000)
  const [tags, setTags] = useState<string[]>(Array.isArray(preset.tags) ? preset.tags : [])
  const [notes, setNotes] = useState<string>(preset.notes || "")
  const [loading, setLoading] = useState(false)

  const canSubmit = title.trim().length > 1 && quantity > 0 && availableUntil > availableFrom

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      addListing({
        title: title.trim(),
        category,
        quantity,
        unit,
        location,
        freshness,
        tags,
        notes,
        postedBy: settings.userProfile.name || "Anonymous",
        availableFrom,
        availableUntil,
        safeHours,
      } as any)
      setOpen(false)
      // reset lightweight
      setTitle("")
      setNotes("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>List surplus food</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Item</Label>
            <Input
              id="title"
              placeholder="e.g., Veg Biryani"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Meals", "Bakery", "Fruits", "Beverages", "Other"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v: any) => setUnit(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {["plates", "kg", "liters", "pieces"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Freshness</Label>
              <Select value={freshness} onValueChange={(v: any) => setFreshness(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Freshness" />
                </SelectTrigger>
                <SelectContent>
                  {["Hot", "Warm", "Chilled", "Ambient"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-1">
              <Label className="flex items-center gap-1">
                <CalendarClock className="w-4 h-4" /> Start
              </Label>
              <Input
                type="datetime-local"
                value={toLocalInput(availableFrom)}
                onChange={(e) => setAvailableFrom(new Date(e.target.value).getTime())}
              />
            </div>
            <div className="grid gap-1">
              <Label className="flex items-center gap-1">
                <CalendarClock className="w-4 h-4" /> End
              </Label>
              <Input
                type="datetime-local"
                value={toLocalInput(availableUntil)}
                onChange={(e) => setAvailableUntil(new Date(e.target.value).getTime())}
              />
            </div>
            <div className="grid gap-1">
              <Label>Safe for (hrs)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={safeHours}
                onChange={(e) => setSafeHours(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Packaging, storage guidelines, allergens, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-removal happens when safety or availability window ends. Please ensure proper packaging and storage.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? "Saving..." : "Publish"}
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
