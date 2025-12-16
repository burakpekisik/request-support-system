"use client"

import { use } from "react"
import { AdminRequestDetail } from "@/components/admin-request-detail"
import { AuthGuard } from "@/components/auth-guard"

interface AdminRequestDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminRequestDetailPage({ params }: AdminRequestDetailPageProps) {
  const { id } = use(params)
  
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminRequestDetail requestId={id} />
    </AuthGuard>
  )
}
