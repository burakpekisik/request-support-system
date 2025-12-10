import { OfficerRequestDetail } from "@/components/officer-request-detail"

export default async function OfficerRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OfficerRequestDetail requestId={id} />
}
