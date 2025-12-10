import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"

const requests = [
  {
    id: "1234",
    title: "Library Access Card Not Working",
    category: "IT Support",
    unit: "Information Technology",
    status: "in_progress" as const,
    date: "2024-12-05",
    lastUpdate: "2024-12-06",
  },
  {
    id: "1233",
    title: "Transcript Request",
    category: "Academic Affairs",
    unit: "Student Affairs",
    status: "pending" as const,
    date: "2024-12-04",
    lastUpdate: "2024-12-04",
  },
  {
    id: "1232",
    title: "Dormitory Maintenance Issue",
    category: "Facilities",
    unit: "Housing Services",
    status: "resolved" as const,
    date: "2024-12-03",
    lastUpdate: "2024-12-05",
  },
  {
    id: "1231",
    title: "Course Registration Help",
    category: "Academic Affairs",
    unit: "Registrar",
    status: "resolved" as const,
    date: "2024-12-02",
    lastUpdate: "2024-12-03",
  },
  {
    id: "1230",
    title: "WiFi Connection Problem",
    category: "IT Support",
    unit: "Information Technology",
    status: "cancelled" as const,
    date: "2024-12-01",
    lastUpdate: "2024-12-02",
  },
  {
    id: "1229",
    title: "Parking Permit Application",
    category: "Facilities",
    unit: "Facilities Management",
    status: "pending" as const,
    date: "2024-11-30",
    lastUpdate: "2024-11-30",
  },
  {
    id: "1228",
    title: "Financial Aid Inquiry",
    category: "Finance",
    unit: "Finance Department",
    status: "resolved" as const,
    date: "2024-11-28",
    lastUpdate: "2024-12-01",
  },
]

export function RequestsTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden xl:table-cell">Last Update</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                <TableCell className="max-w-xs truncate">
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
                <TableCell className="hidden xl:table-cell text-muted-foreground">{request.lastUpdate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/requests/${request.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
