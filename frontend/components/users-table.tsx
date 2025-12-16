"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, UserCog, GraduationCap, Shield } from "lucide-react"
import type { User } from "@/app/admin/users/page"

interface UsersTableProps {
  users: User[]
  onAssignUnit: (user: User) => void
  onChangeRole: (user: User) => void
}

const roleConfig = {
  student: { label: "Student", variant: "default" as const, icon: GraduationCap },
  officer: { label: "Officer", variant: "secondary" as const, icon: Building2 },
  admin: { label: "Admin", variant: "destructive" as const, icon: Shield },
}

export function UsersTable({ users, onAssignUnit, onChangeRole }: UsersTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TC Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Surname</TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">E-mail</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const userRole = user.role || (user.role_name?.toLowerCase() as any)
              const role = roleConfig[userRole] || { label: "Unknown", variant: "default" as const, icon: UserCog }
              const RoleIcon = role.icon
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.tc_number}</TableCell>
                  <TableCell className="font-medium">{user.name || user.first_name}</TableCell>
                  <TableCell>{user.surname || user.last_name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{user.gender || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={role.variant} className="gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {role.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Assign Unit - Only visible for officers */}
                      {userRole === "officer" && (
                        <Button variant="outline" size="sm" onClick={() => onAssignUnit(user)} className="gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="hidden xl:inline">Assign Unit</span>
                        </Button>
                      )}
                      {/* Change Role - Visible for all users */}
                      <Button variant="outline" size="sm" onClick={() => onChangeRole(user)} className="gap-1">
                        <UserCog className="w-4 h-4" />
                        <span className="hidden xl:inline">Change Role</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
