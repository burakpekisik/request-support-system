"use client"

import { useEffect, useState } from "react"
import { Bell, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { UserData } from "@/lib/api/types"
import { formatRole, getInitials, getFullStaticUrl } from "@/lib/constants"
import { storage } from "@/lib/storage"

interface HeaderProps {
  profileHref?: string;
}

export function Header({ profileHref = "/profile" }: HeaderProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const data = storage.getUserData()
    if (data) {
      setUserData(data)
    }
  }, [])

  const handleLogout = () => {
    storage.clearAuth()
    router.push('/login')
  }

  const userName = userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."
  const userRole = userData?.role ? formatRole(userData.role) : "User"
  
  const initials = userData 
    ? getInitials(`${userData.firstName} ${userData.lastName}`)
    : "U"

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-card-foreground">Welcome back, {userName.split(" ")[0]}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getFullStaticUrl(userData?.avatarUrl) || undefined} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
                {userData?.unitName && (
                  <span className="text-xs text-muted-foreground">{userData.unitName}</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-muted-foreground">{userRole}</p>
              {userData?.unitName && (
                <p className="text-xs text-muted-foreground">{userData.unitName}</p>
              )}
            </div>
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
