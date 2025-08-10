"use client"

import { Calendar, BarChartIcon as ChartSpline, Home, Settings, Share2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

// Built using the composable shadcn sidebar pattern with SidebarProvider/Sidebar/SidebarTrigger. [^1]
export function AppSidebar() {
  const items = [
    { title: "Listings", url: "/listings", icon: Home },
    { title: "Events", url: "/events", icon: Calendar },
    { title: "Analytics", url: "/analytics", icon: ChartSpline },
    { title: "Settings", url: "/settings", icon: Settings },
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-semibold">Smart Surplus</div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>About</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Share">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <Share2 />
                    <span>{"Share this initiative"}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">Zero-waste campus</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
