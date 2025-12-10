import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdminRequestsTableProps {
  filter?: string
}

const allRequests = [
  {
    id: "1234",
    title: "Library Access Card Not Working",
    category: "IT Support",
    unit: "Information Technology",
    status: "in_progress" as const,
    date: "2024-12-05",
    submittedBy: "Ahmet Yılmaz",
    assignedTo: "Mehmet Öztürk",
  },
  {
    id: "1233",
    title: "Transcript Request",
    category: "Academic Affairs",
    unit: "Student Affairs",
    status: "pending" as const,
    date: "2024-12-04",
    submittedBy: "Zeynep Kaya",
    assignedTo: null,
  },
  {
    id: "1232",
    title: "Dormitory Maintenance Issue",
    category: "Facilities",
    unit: "Housing Services",
    status: "resolved" as const,
    date: "2024-12-03",
    submittedBy: "Ali Demir",
    assignedTo: "Fatma Şahin",
  },
  {
    id: "1231",
    title: "Course Registration Help",
    category: "Academic Affairs",
    unit: "Registrar",
    status: "resolved" as const,
    date: "2024-12-02",
    submittedBy: "Elif Yıldız",
    assignedTo: "Can Aksoy",
  },
  {
    id: "1230",
    title: "WiFi Connection Problem",
    category: "IT Support",
    unit: "Information Technology",
    status: "cancelled" as const,
    date: "2024-12-01",
    submittedBy: "Burak Çelik",
    assignedTo: "Mehmet Öztürk",
  },
  {
    id: "1229",
    title: "Parking Permit Application",
    category: "Facilities",
    unit: "Facilities Management",
    status: "pending" as const,
    date: "2024-11-30",
    submittedBy: "Selin Arslan",
    assignedTo: null,
  },
  {
    id: "1228",
    title: "Financial Aid Inquiry",
    category: "Finance",
    unit: "Finance Department",
    status: "resolved" as const,
    date: "2024-11-28",
    submittedBy: "Emre Koç",
    assignedTo: "Ayşe Tekin",
  },
  {
    id: "1227",
    title: "Student ID Replacement",
    category: "Student Services",
    unit: "Student Affairs",
    status: "in_progress" as const,
    date: "2024-11-27",
    submittedBy: "Deniz Aydın",
    assignedTo: "Hakan Polat",
  },
  {
    id: "1226",
    title: "Lab Equipment Issue",
    category: "IT Support",
    unit: "Information Technology",
    status: "pending" as const,
    date: "2024-11-26",
    submittedBy: "Merve Özkan",
    assignedTo: null,
  },
]

export function AdminRequestsTable({ filter = "all" }: AdminRequestsTableProps) {
  const filteredRequests = filter === "all" ? allRequests : allRequests.filter((req) => req.unit === filter)

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Submitted By</TableHead>
              <TableHead className="hidden lg:table-cell">Unit</TableHead>
              <TableHead className="hidden xl:table-cell">Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
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
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{request.submittedBy}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{request.unit}</Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-muted-foreground">
                  {request.assignedTo || <span className="text-amber-600">Unassigned</span>}
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{request.date}</TableCell>
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
