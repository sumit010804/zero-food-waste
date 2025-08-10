import type React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NotificationManager } from "@/components/notification-manager"
import { AppDataProvider } from "@/components/providers/app-data-provider"

export default function Layout({ children }: { children: React.ReactNode }) {
  // SidebarProvider wraps AppSidebar and content as recommended. [^1]
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppDataProvider>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-2 md:px-4">
            <SidebarTrigger className="mr-1" />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
                <Link className="px-2 py-1 rounded hover:bg-muted" href="/listings">
                  Listings
                </Link>
                <Link className="px-2 py-1 rounded hover:bg-muted" href="/events">
                  Events
                </Link>
                <Link className="px-2 py-1 rounded hover:bg-muted" href="/analytics">
                  Analytics
                </Link>
                <Link className="px-2 py-1 rounded hover:bg-muted" href="/settings">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/listings" className="hidden sm:block">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Listing
                </Button>
              </Link>
              <NotificationManager>
                <Button variant="outline" size="icon" aria-label="Notifications">
                  <Bell className="w-4 h-4" />
                </Button>
              </NotificationManager>
            </div>
          </header>
          <main className="p-3 md:p-6">{children}</main>
        </AppDataProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
