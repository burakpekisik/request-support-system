import { RequestDetailView } from "@/components/request-detail-view"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <RequestDetailView requestId={id} />
        </main>
      </div>
    </div>
  )
}
