"use client"

import { useMemo } from "react"
import { useAppData } from "@/components/providers/app-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { computeAnalytics } from "@/lib/analytics"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

export default function Page() {
  const { listings, settings } = useAppData()
  const data = useMemo(() => {
    return computeAnalytics(
      listings,
      settings.impact.avgServingKg,
      settings.impact.kgCO2PerKg,
      settings.impact.litersWaterPerKg,
    )
  }, [listings, settings])

  const statCls = "text-2xl font-semibold"
  const subCls = "text-xs text-muted-foreground"

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-xl font-semibold">Impact Dashboard</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Food saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={statCls}>{data.totalKg.toFixed(1)} kg</div>
            <div className={subCls}>{data.totalServings} servings</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CO2e avoided</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={statCls}>{data.co2.toFixed(1)} kg</div>
            <div className={subCls}>{settings.impact.kgCO2PerKg} kg CO2e/kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Water saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={statCls}>{formatWater(data.water)}</div>
            <div className={subCls}>{settings.impact.litersWaterPerKg} L/kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={statCls}>{listings.filter((l) => l.status === "collected").length}</div>
            <div className={subCls}>All-time</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved kg by day</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              kg: { label: "kg", color: "hsl(var(--primary))" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer>
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="kg" stroke="hsl(var(--primary))" fill="url(#kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function formatWater(liters: number) {
  if (liters < 1000) return `${Math.round(liters)} L`
  const m3 = liters / 1000
  return `${m3.toFixed(1)} m³`
}
