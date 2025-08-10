"use client"

import { useMemo, useState } from "react"
import { ListingForm } from "@/components/listing-form"
import { useAppData } from "@/components/providers/app-data-provider"
import { ListingCard } from "@/components/listing-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

export default function Page() {
  const { listings } = useAppData()
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("All")
  const [status, setStatus] = useState("Active")

  const filtered = useMemo(() => {
    return listings
      .filter((l) => (status === "All" ? true : l.status === "available" || l.status === "claimed"))
      .filter((l) => (cat === "All" ? true : l.category === cat))
      .filter((l) => {
        const s = q.trim().toLowerCase()
        if (!s) return true
        return [l.title, l.category, l.location, l.notes]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(s))
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [listings, q, cat, status])

  const categories = ["All", ...Array.from(new Set(listings.map((l) => l.category)))]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid w-full max-w-xl gap-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by item, location, tag..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="grid gap-1">
            <Label className="text-xs">Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {["Active", "All"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ListingForm triggerLabel="New Listing" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="w-3.5 h-3.5" />
        <span>
          Showing {filtered.length} of {listings.length} listings
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          No listings match your filters. Create one to get started.
          <div className="mt-3">
            <ListingForm triggerLabel="Create your first listing" />
          </div>
        </div>
      )}
    </div>
  )
}
