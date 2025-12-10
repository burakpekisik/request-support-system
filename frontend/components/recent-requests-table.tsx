import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentRequests = [
  {
    id: "1234",
    title: "Library Access Card Not Working",
    category: "IT Support",
    unit: "Information Technology",
    status: "in_progress" as const,
    date: "2024-12-05",
  },
  {
    id: "1233",
    title: "Transcript Request",
    category: "Academic Affairs",
    unit: "Student Affairs",
    status: "pending" as const,
    date: "2024-12-04",
  },
  {
    id: "1232",
    title: "Dormitory Maintenance Issue",
    category: "Facilities",
    unit: "Housing Services",
    status: "resolved" as const,
    date: "2024-12-03",
  },
  {
    id: "1231",
    title: "Course Registration Help",
    category: "Academic Affairs",
    unit: "Registrar",
    status: "resolved" as const,
    date: "2024-12-02",
  },
  {
    id: "1230",
    title: "WiFi Connection Problem",
    category: "IT Support",
    unit: "Information Technology",
    status: "cancelled" as const,
    date: "2024-12-01",
  },
]

export function RecentRequestsTable() {
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
        {recentRequests.map((request) => (
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
            <TableCell className="hidden lg:table-cell text-muted-foreground">{request.unit}</TableCell>
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">{request.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
