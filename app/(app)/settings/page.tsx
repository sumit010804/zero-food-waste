"use client"

import { useAppData } from "@/components/providers/app-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function Page() {
  const { settings, setSettings, subs, addSub, updateSub } = useAppData()
  const [local, setLocal] = useState(settings)

  const save = () => setSettings(local)

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Impact factors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1">
            <Label>Avg serving (kg)</Label>
            <Input
              type="number"
              step="0.05"
              value={local.impact.avgServingKg}
              onChange={(e) =>
                setLocal({
                  ...local,
                  impact: { ...local.impact, avgServingKg: Number.parseFloat(e.target.value) || 0 },
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <Label>kg CO2e per kg</Label>
            <Input
              type="number"
              step="0.1"
              value={local.impact.kgCO2PerKg}
              onChange={(e) =>
                setLocal({ ...local, impact: { ...local.impact, kgCO2PerKg: Number.parseFloat(e.target.value) || 0 } })
              }
            />
          </div>
          <div className="grid gap-1">
            <Label>Liters water per kg</Label>
            <Input
              type="number"
              step="10"
              value={local.impact.litersWaterPerKg}
              onChange={(e) =>
                setLocal({
                  ...local,
                  impact: { ...local.impact, litersWaterPerKg: Number.parseFloat(e.target.value) || 0 },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Auto-notify on new listing</div>
              <div className="text-xs text-muted-foreground">Notify matching subscribers</div>
            </div>
            <Switch
              checked={local.autoNotify}
              onCheckedChange={(v) => setLocal({ ...local, autoNotify: Boolean(v) })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Remind before expiry (min)</Label>
            <Input
              type="number"
              value={local.remindBeforeMinutes}
              onChange={(e) => setLocal({ ...local, remindBeforeMinutes: Number.parseInt(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input
              value={local.userProfile.name}
              onChange={(e) => setLocal({ ...local, userProfile: { ...local.userProfile, name: e.target.value } })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Role</Label>
            <Select
              value={local.userProfile.role}
              onValueChange={(v: any) => setLocal({ ...local, userProfile: { ...local.userProfile, role: v } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {["Student", "Staff", "NGO"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Default location</Label>
            <Input
              value={local.userProfile.location || ""}
              onChange={(e) => setLocal({ ...local, userProfile: { ...local.userProfile, location: e.target.value } })}
              placeholder="e.g., Hostel A"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubEditor />
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button onClick={save}>Save changes</Button>
      </div>
    </div>
  )
}

function SubEditor() {
  const { subs, addSub, updateSub } = useAppData()
  const [draft, setDraft] = useState({
    name: "",
    role: "Student",
    enabled: true,
    viaBrowserNotifications: true,
    categories: [] as string[],
    locations: [] as string[],
  })
  const categories = ["Meals", "Bakery", "Fruits", "Beverages", "Other"]
  const add = () => {
    if (draft.name.trim().length < 1) return
    addSub({ ...draft, name: draft.name.trim() } as any)
    setDraft({ name: "", role: "Student", enabled: true, viaBrowserNotifications: true, categories: [], locations: [] })
  }
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Name</Label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Role</Label>
          <Select value={draft.role} onValueChange={(v: any) => setDraft({ ...draft, role: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {["Student", "Staff", "NGO"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Categories</Label>
          <Input
            placeholder="Comma separated"
            value={draft.categories.join(", ")}
            onChange={(e) => setDraft({ ...draft, categories: splitCsv(e.target.value) })}
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Locations</Label>
          <Input
            placeholder="Comma separated"
            value={draft.locations.join(", ")}
            onChange={(e) => setDraft({ ...draft, locations: splitCsv(e.target.value) })}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={add}>Add</Button>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="grid gap-3">
        {subs.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-1 rounded border p-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="text-sm">
              <div className="font-medium">
                {s.name} <span className="text-xs text-muted-foreground">({s.role})</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Cats: {s.categories.join(", ") || "All"} • Locs: {s.locations.join(", ") || "All"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={s.enabled} onCheckedChange={(v) => updateSub(s.id, { enabled: Boolean(v) })} />
              <span className="text-xs">{s.enabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        ))}
        {subs.length === 0 && <p className="text-xs text-muted-foreground">No subscriptions yet.</p>}
      </div>
    </div>
  )
}

function splitCsv(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
}
