import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RequestSummary } from "@/lib/api/types"
import { statusIdMap, StatusType } from "@/lib/constants"

interface RecentRequestsTableProps {
  requests: RequestSummary[];
  isLoading: boolean;
}

export function RecentRequestsTable({ requests, isLoading }: RecentRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No recent requests found.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="hidden lg:table-cell">Unit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">
              <Link href={`/requests/${request.id}`} className="text-primary hover:underline">
                #{request.id}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/requests/${request.id}`} className="hover:text-primary">
                {request.title}
              </Link>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{request.category}</TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground">{request.unitName}</TableCell>
            <TableCell>
              <StatusBadge status={statusIdMap[request.statusId] as StatusType} />
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {new Date(request.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
