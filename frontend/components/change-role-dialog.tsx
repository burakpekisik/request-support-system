"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GraduationCap, Building2, Shield, UserCog } from "lucide-react"
import type { User } from "@/app/admin/users/page"
import { cn } from "@/lib/utils"

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSave: (userId: string, role: "student" | "officer" | "admin") => void
}

const roles = [
  {
    value: "student" as const,
    label: "Student",
    icon: GraduationCap,
    description: "Can submit and track requests",
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    value: "officer" as const,
    label: "Officer",
    icon: Building2,
    description: "Can handle and resolve requests",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  {
    value: "admin" as const,
    label: "Admin",
    icon: Shield,
    description: "Full system access and management",
    color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
]

export function ChangeRoleDialog({ open, onOpenChange, user, onSave }: ChangeRoleDialogProps) {
  const handleRoleChange = (role: "student" | "officer" | "admin") => {
    onSave(user.id, role)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Change Role
          </DialogTitle>
          <DialogDescription>
            Select a new role for{" "}
            <span className="font-medium">
              {user.name} {user.surname}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {roles.map((role) => {
            const Icon = role.icon
            const isCurrentRole = user.role === role.value
            return (
              <Button
                key={role.value}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto p-4 border-2 transition-all",
                  role.color,
                  isCurrentRole && "ring-2 ring-primary ring-offset-2",
                )}
                onClick={() => handleRoleChange(role.value)}
                disabled={isCurrentRole}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background/80">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      {role.label}
                      {isCurrentRole && <span className="text-xs bg-background px-2 py-0.5 rounded-full">Current</span>}
                    </div>
                    <div className="text-sm opacity-80 font-normal">{role.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
