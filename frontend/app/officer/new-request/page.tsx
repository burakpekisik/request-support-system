import { NewRequestForm } from "@/components/new-request-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfficerNewRequestPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit New Request</h1>
        <p className="text-muted-foreground">Create a support request for your department or personal needs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Please provide detailed information to help us process your request efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewRequestForm userRole="officer" />
        </CardContent>
      </Card>
    </div>
  )
}
