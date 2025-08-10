"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/listings")
  }, [router])
  return <div className="p-6 text-sm text-muted-foreground">Redirecting to Listings…</div>
}
