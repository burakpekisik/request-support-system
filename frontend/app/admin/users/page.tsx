"use client"

import { useState } from "react"
import { UsersTable } from "@/components/users-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, GraduationCap, Building2, Shield } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { AssignUnitDialog } from "@/components/assign-unit-dialog"
import { ChangeRoleDialog } from "@/components/change-role-dialog"

export type User = {
  id: string
  tc_number: string
  name: string
  surname: string
  gender: "Male" | "Female"
  role: "student" | "officer" | "admin"
  email: string
  assignedUnits?: string[]
}

const initialUsers: User[] = [
  {
    id: "1",
    tc_number: "12345678901",
    name: "Ahmet",
    surname: "Yılmaz",
    gender: "Male",
    role: "student",
    email: "ahmet.yilmaz@university.edu",
  },
  {
    id: "2",
    tc_number: "23456789012",
    name: "Zeynep",
    surname: "Kaya",
    gender: "Female",
    role: "student",
    email: "zeynep.kaya@university.edu",
  },
  {
    id: "3",
    tc_number: "34567890123",
    name: "Mehmet",
    surname: "Öztürk",
    gender: "Male",
    role: "officer",
    email: "mehmet.ozturk@university.edu",
    assignedUnits: ["Information Technology"],
  },
  {
    id: "4",
    tc_number: "45678901234",
    name: "Fatma",
    surname: "Şahin",
    gender: "Female",
    role: "officer",
    email: "fatma.sahin@university.edu",
    assignedUnits: ["Housing Services", "Facilities Management"],
  },
  {
    id: "5",
    tc_number: "56789012345",
    name: "Ali",
    surname: "Demir",
    gender: "Male",
    role: "admin",
    email: "ali.demir@university.edu",
  },
  {
    id: "6",
    tc_number: "67890123456",
    name: "Elif",
    surname: "Yıldız",
    gender: "Female",
    role: "student",
    email: "elif.yildiz@university.edu",
  },
  {
    id: "7",
    tc_number: "78901234567",
    name: "Can",
    surname: "Aksoy",
    gender: "Male",
    role: "officer",
    email: "can.aksoy@university.edu",
    assignedUnits: ["Registrar"],
  },
  {
    id: "8",
    tc_number: "89012345678",
    name: "Ayşe",
    surname: "Tekin",
    gender: "Female",
    role: "officer",
    email: "ayse.tekin@university.edu",
    assignedUnits: ["Finance Department"],
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignUnitOpen, setAssignUnitOpen] = useState(false)
  const [changeRoleOpen, setChangeRoleOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const studentCount = users.filter((u) => u.role === "student").length
  const officerCount = users.filter((u) => u.role === "officer").length
  const adminCount = users.filter((u) => u.role === "admin").length

  const handleAssignUnit = (user: User) => {
    setSelectedUser(user)
    setAssignUnitOpen(true)
  }

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setChangeRoleOpen(true)
  }

  const handleUpdateUnits = (userId: string, units: string[]) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, assignedUnits: units } : u)))
    setAssignUnitOpen(false)
  }

  const handleUpdateRole = (userId: string, newRole: "student" | "officer" | "admin") => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: newRole, assignedUnits: newRole === "officer" ? u.assignedUnits : undefined }
          : u,
      ),
    )
    setChangeRoleOpen(false)
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tc_number.includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">View and manage all users in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={users.length.toString()}
          description="All registered users"
          icon={Users}
        />
        <StatsCard
          title="Students"
          value={studentCount.toString()}
          description="Registered students"
          icon={GraduationCap}
        />
        <StatsCard title="Officers" value={officerCount.toString()} description="Active officers" icon={Building2} />
        <StatsCard title="Admins" value={adminCount.toString()} description="System administrators" icon={Shield} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, TC number, or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="officer">Officers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UsersTable users={filteredUsers} onAssignUnit={handleAssignUnit} onChangeRole={handleChangeRole} />

      {selectedUser && (
        <>
          <AssignUnitDialog
            open={assignUnitOpen}
            onOpenChange={setAssignUnitOpen}
            user={selectedUser}
            onSave={handleUpdateUnits}
          />
          <ChangeRoleDialog
            open={changeRoleOpen}
            onOpenChange={setChangeRoleOpen}
            user={selectedUser}
            onSave={handleUpdateRole}
          />
        </>
      )}
    </div>
  )
}
