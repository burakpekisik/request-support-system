"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Inbox,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type UserRole = "student" | "officer" | "admin"

interface SidebarProps {
  role: UserRole
}

const navigationItems = {
  student: [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "New Request", href: "/student/new-request", icon: PlusCircle },
    { name: "My Requests", href: "/student/requests", icon: FileText },
  ],
  officer: [
    { name: "Dashboard", href: "/officer", icon: LayoutDashboard },
    { name: "Inbox", href: "/officer/inbox", icon: Inbox },
    { name: "My Assignments", href: "/officer/assignments", icon: FileText },
    { name: "New Request", href: "/officer/new-request", icon: PlusCircle },
    { name: "My Requests", href: "/officer/requests", icon: FileText },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Requests", href: "/admin/requests", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

const roleIcons = {
  student: GraduationCap,
  officer: Building2,
  admin: Shield,
}

const roleLabels = {
  student: "Student Portal",
  officer: "Officer Portal",
  admin: "Admin Portal",
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const items = navigationItems[role]
  const RoleIcon = roleIcons[role]

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <RoleIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">TalepDestek</span>
            <span className="text-xs text-muted-foreground">{roleLabels[role]}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          // For officer request detail pages (/officer/requests/[id]), don't highlight "My Requests" or "Dashboard"
          const isRequestDetailPage = pathname.match(/^\/officer\/requests\/\d+$/)
          let isActive = false
          
          if (isRequestDetailPage) {
            // On request detail page, only highlight if this is the exact path (none should match)
            isActive = pathname === item.href
          } else {
            // Normal behavior for other pages
            isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-4 border-t border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  )
}
