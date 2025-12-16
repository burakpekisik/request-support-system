"use client"

import { useState, useEffect } from "react"
import { UsersTable } from "@/components/users-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Users, GraduationCap, Building2, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { AssignUnitDialog } from "@/components/assign-unit-dialog"
import { ChangeRoleDialog } from "@/components/change-role-dialog"
import { adminService } from "@/lib/api/admin"

export type User = {
  id: string
  tc_number: string
  first_name?: string
  last_name?: string
  name?: string
  surname?: string
  role_name?: string
  role?: "student" | "officer" | "admin"
  email: string
  unit_ids?: string
  unit_names?: string
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
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignUnitOpen, setAssignUnitOpen] = useState(false)
  const [changeRoleOpen, setChangeRoleOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const pageSize = 10

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      console.log(`[Frontend] Fetching users - Search: ${searchQuery}, Role: ${roleFilter}, Page: ${currentPage}`)
      const result = await adminService.getAdminUsers(searchQuery, roleFilter, currentPage, pageSize)
      console.log(`[Frontend] Users result received:`, result)
      
      if (result && result.data) {
        const mappedUsers = result.data.map((user: any) => ({
          id: user.id.toString(),
          tc_number: user.tc_number,
          first_name: user.first_name,
          last_name: user.last_name,
          name: user.first_name,
          surname: user.last_name,
          email: user.email,
          role_name: user.role_name,
          role: user.role_name?.toLowerCase(),
          unit_ids: user.unit_ids,
          unit_names: user.unit_names,
        }))
        
        setUsers(mappedUsers)
        setTotalPages(result.totalPages || 1)
        setTotalUsers(result.total || 0)
        console.log(`[Frontend] Loaded ${mappedUsers.length} users, total: ${result.total}, totalPages: ${result.totalPages}`)
      }
    } catch (error) {
      console.error("[Frontend] Error fetching users:", error)
    }
  }

  useEffect(() => {
    console.log("[Frontend] Dependencies changed - searchQuery, roleFilter, or currentPage updated")
    setCurrentPage(1)
  }, [searchQuery, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, roleFilter, currentPage, pageSize])

  const studentCount = users.filter((u) => u.role_name === "Student" || u.role === "student").length
  const officerCount = users.filter((u) => u.role_name === "Officer" || u.role === "officer").length
  const adminCount = users.filter((u) => u.role_name === "Admin" || u.role === "admin").length

  const handleAssignUnit = (user: User) => {
    setSelectedUser(user)
    setAssignUnitOpen(true)
  }

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setChangeRoleOpen(true)
  }

  const handleUpdateUnits = (userId: string, units: string[]) => {
    // Refresh the user list to get updated unit assignments
    fetchUsers()
    setAssignUnitOpen(false)
  }

  const handleUpdateRole = (userId: string, newRole: "student" | "officer" | "admin") => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role_name: newRole.charAt(0).toUpperCase() + newRole.slice(1), role: newRole, assignedUnits: newRole === "officer" ? u.assignedUnits : undefined }
          : u,
      ),
    )
    setChangeRoleOpen(false)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageClick = (pageNum: number) => {
    setCurrentPage(pageNum)
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalUsers)
  
  const pageNumbers = []
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i)
  }

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
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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

      <UsersTable users={users} onAssignUnit={handleAssignUnit} onChangeRole={handleChangeRole} />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalUsers} users
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {currentPage > 3 && (
              <>
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(1)}
                  className="w-9"
                >
                  1
                </Button>
                {currentPage > 4 && <span className="text-muted-foreground">...</span>}
              </>
            )}
            
            {pageNumbers.map((num) => (
              <Button
                key={num}
                variant={currentPage === num ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(num)}
                className="w-9"
              >
                {num}
              </Button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-muted-foreground">...</span>}
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(totalPages)}
                  className="w-9"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
