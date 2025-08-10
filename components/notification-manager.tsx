"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function NotificationManager({ children }: { children?: React.ReactNode }) {
  const [perm, setPerm] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    setPerm(Notification.permission)
    // Register notifier with provider context
    const register = (window as any).__ssf_registerNotifier as
      | undefined
      | ((fn: (t: string, b: string) => void) => void)
    if (register) {
      register((title, body) => {
        if (Notification.permission === "granted") {
          new Notification(title, { body, icon: "/food-icon.png" })
        }
      })
    }
  }, [])

  return (
    <span
      onClick={async () => {
        if (!("Notification" in window)) return
        if (Notification.permission === "default") {
          const res = await Notification.requestPermission()
          setPerm(res)
        }
      }}
      role="button"
      aria-label="Enable notifications"
      title={perm === "granted" ? "Notifications enabled" : "Enable notifications"}
    >
      {children}
    </span>
  )
}
