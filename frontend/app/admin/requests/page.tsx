"use client"

import { AdminRequestsTable } from "@/components/admin-requests-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, Building2, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { useEffect, useState } from "react"
import { adminService } from "@/lib/api/admin"

const mockUnits = [
  { name: "Information Technology", count: 45, pending: 12 },
  { name: "Student Affairs", count: 38, pending: 8 },
  { name: "Housing Services", count: 25, pending: 5 },
  { name: "Finance Department", count: 32, pending: 10 },
  { name: "Registrar", count: 28, pending: 6 },
  { name: "Facilities Management", count: 22, pending: 4 },
]

export default function AdminRequestsPage() {
  const [totalRequests, setTotalRequests] = useState<number>(0)
  const [totalPending, setTotalPending] = useState<number>(0)
  const [pendingRequestChange, setPendingRequestChange] = useState({label: '', percentage: 0, isPositive: true})
  const [units, setUnits] = useState(mockUnits)
  const [loading, setLoading] = useState(true)
  
  // Filtering & Pagination
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [totalFiltered, setTotalFiltered] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    Promise.all([
      adminService.getAdminStatsTotalRequest(),
      adminService.getAdminStatsTotalPendingRequest(),
      adminService.getRequestsByUnit(),
      adminService.getAdminStatsPendingRequestChangePercentage(),
    ])
      .then(([total, pending, requestsByUnit, pendingChange]) => {
        setTotalRequests(total as number)
        setTotalPending(pending as number)
        setPendingRequestChange(pendingChange)
        
        // Map API data to units format
        const mappedUnits = requestsByUnit.map((item) => ({
          name: item.unitName,
          count: item.requestCount,
          pending: 0,
        }))
        setUnits(mappedUnits.length > 0 ? mappedUnits : mockUnits)
      })
      .catch((err) => {
        console.error("Failed to fetch admin data:", err)
        setUnits(mockUnits)
      })
      .finally(() => setLoading(false))
  }, [])

  // Fetch filtered requests when status, unit or page changes
  const fetchFilteredRequests = async () => {
    try {
      setLoading(true)
      console.log("[Frontend] Fetching with filters - Status:", selectedStatus, "Unit:", selectedUnit, "Page:", currentPage, "PageSize:", pageSize)
      const result = await adminService.getAdminRequests(selectedStatus, selectedUnit, currentPage, pageSize)
      console.log("[Frontend] Result received:", result)
      console.log("[Frontend] Data array length:", result.data?.length || 0)
      setFilteredRequests(result.data || [])
      setTotalFiltered(result.total || 0)
      setTotalPages(result.totalPages || 1)
    } catch (err) {
      console.error("[Frontend] Failed to fetch filtered requests:", err)
      setFilteredRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("[Frontend] Dependencies changed - selectedStatus:", selectedStatus, "selectedUnit:", selectedUnit, "currentPage:", currentPage)
    if (selectedStatus !== undefined && selectedUnit !== undefined && currentPage > 0) {
      console.log("[Frontend] Calling fetchFilteredRequests")
      fetchFilteredRequests()
    }
  }, [selectedStatus, selectedUnit, currentPage, pageSize])

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit)
    setCurrentPage(1)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Requests</h1>
        <p className="text-muted-foreground">View and manage all requests across the system categorized by unit</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Requests"
          value={totalRequests.toString()}
          description="All requests in system"
          icon={FileText}
        />
        <StatsCard
          title="Pending Requests"
          value={totalPending.toString()}
          description="Awaiting resolution"
          icon={FileText}
          trend={{ value: pendingRequestChange.percentage, isPositive: pendingRequestChange.isPositive }}
        />
        <StatsCard
          title="Active Units"
          value={units.length.toString()}
          description="Departments handling requests"
          icon={Building2}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search all requests..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="waiting_response">Waiting Response</SelectItem>
            <SelectItem value="resolved_successfully">Resolved Successfully</SelectItem>
            <SelectItem value="resolved_negatively">Resolved Negatively</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedUnit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.name} value={unit.name.toLowerCase().replace(/\s+/g, "-")}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Unit</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Requester</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm">{request.title}</td>
                      <td className="px-6 py-4 text-sm">{request.unit_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: request.status_color || '#808080' }}
                        >
                          {request.status_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{request.requester_name}</td>
                      <td className="px-6 py-4 text-sm">{new Date(request.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRequests.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalFiltered)} of {totalFiltered}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
