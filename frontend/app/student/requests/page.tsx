"use client"

import { useState, useEffect } from "react"
import { RequestsTable } from "@/components/requests-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import type { RequestFilters, Category } from "@/lib/api/types"
import { commonService } from "@/lib/api/common"

export default function StudentRequestsPage() {
  const [filters, setFilters] = useState<RequestFilters>({
    status: "all",
    category: "all",
    search: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const data = await commonService.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
          <p className="text-muted-foreground">View and manage all your submitted requests</p>
        </div>
        <Button asChild>
          <Link href="/student/new-request">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search requests..." 
            className="pl-9" 
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="waiting_response">Waiting Response</SelectItem>
            <SelectItem value="resolved_successfully">Resolved Successfully</SelectItem>
            <SelectItem value="resolved_negatively">Resolved Negatively</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {isLoadingCategories ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <RequestsTable filters={filters} basePath="/requests" />
    </div>
  )
}
