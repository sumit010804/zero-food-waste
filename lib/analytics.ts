import type { Listing } from "./data"

export function computeAnalytics(items: Listing[], avgServingKg: number, kgCO2PerKg: number, litersWaterPerKg: number) {
  const collected = items.filter((i) => i.status === "collected")
  const totalKg = collected.reduce((sum, i) => sum + toKg(i.quantity, i.unit), 0)
  const totalServings = avgServingKg > 0 ? Math.round(totalKg / avgServingKg) : 0
  const co2 = totalKg * kgCO2PerKg
  const water = totalKg * litersWaterPerKg
  // Timeseries by day
  const byDay = new Map<string, { date: string; kg: number; servings: number }>()
  for (const i of collected) {
    const d = new Date(i.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const kg = toKg(i.quantity, i.unit)
    const rec = byDay.get(key) || { date: key, kg: 0, servings: 0 }
    rec.kg += kg
    rec.servings = Math.round(rec.kg / Math.max(0.0001, avgServingKg))
    byDay.set(key, rec)
  }
  const series = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date))
  return { totalKg, totalServings, co2, water, series }
}

function toKg(qty: number, unit: Listing["unit"]) {
  switch (unit) {
    case "kg":
      return qty
    case "plates":
      return qty * 0.35
    case "pieces":
      return qty * 0.2
    case "liters":
      return qty * 1.0
    default:
      return qty
  }
}
