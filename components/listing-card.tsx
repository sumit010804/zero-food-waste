"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, PackageCheck, Users } from "lucide-react"
import type { Listing } from "@/lib/data"
import { useEffect, useState } from "react"
import { useAppData } from "@/components/providers/app-data-provider"

export function ListingCard({ item }: { item: Listing }) {
  const { updateListing, removeListing, settings } = useAppData()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const remaining = Math.max(0, Math.min(item.availableUntil, item.expiresAt) - now)
  const remainingStr = formatDuration(remaining)

  const canClaim = item.status === "available"
  const canCollect = item.status === "claimed"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{item.category}</Badge>
            <Badge>{item.freshness}</Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {item.location}
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span>
            {item.quantity} {item.unit}
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {remainingStr} left
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-2 text-sm">
        {item.notes ? (
          <p className="text-muted-foreground">{item.notes}</p>
        ) : (
          <p className="text-muted-foreground">Safe for ~ {item.safeHours}h</p>
        )}
        {item.claimer && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>
              Claimed by {item.claimer.name}
              {item.claimer.role ? ` (${item.claimer.role})` : ""}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 flex justify-between gap-2">
        <div className="text-xs text-muted-foreground">Posted by {item.postedBy}</div>
        <div className="flex items-center gap-2">
          {canClaim && (
            <Button
              size="sm"
              onClick={() => {
                updateListing(item.id, {
                  status: "claimed",
                  claimer: { name: settings.userProfile.name, role: settings.userProfile.role, claimedAt: Date.now() },
                })
              }}
            >
              Claim
            </Button>
          )}
          {canCollect && (
            <Button size="sm" onClick={() => updateListing(item.id, { status: "collected" })}>
              <PackageCheck className="w-4 h-4 mr-1" />
              Collected
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => removeListing(item.id)}>
            Remove
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${ss}s`
  return `${ss}s`
}
