import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="officer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Mehmet Öztürk" userRole="Request Officer" profileHref="/profile" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
