"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, CheckCircle, Clock, TrendingUp, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import { adminService } from "@/lib/api/admin"

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | string>();
  const [totalUserChange, setTotalUserChange] = useState({label: '', percentage: 0, isPositive: true});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRequests, setTotalRequest] = useState<number | string>();
  const [totalRequestChange, setTotalRequestChange] = useState({label: '', percentage: 0, isPositive: true});
  const [totalResolvedRequests, setTotalResolvedRequestChange] = useState<number | string>(); 
  const [totalResolvedRequestsChange, setTotalResolvedRequestChangePercentage] = useState({label: '', percentage: 0, isPositive: true});
  const [totalPendingRequests, setTotalPendingRequest] = useState<number | string>();
  const [requestsByUnit, setRequestsByUnit] = useState<{ unitName: string; requestCount: number }[]>([]); 

  useEffect(() => {
    adminService
      .getAdminStatsTotalUserCount()
      .then((count) => {
        setTotalUsers(count);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
    adminService
      .getAdminStatsTotalUserChangePercentage()
      .then((response) => {
        setTotalUserChange(response);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user percentage change");
        console.error(err);
      })
      .finally(() => setLoading(false));
    adminService
      .getAdminStatsTotalRequest()
      .then((count) => {
        setTotalRequest(count);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
    adminService
      .getAdminStatsTotalRequestChangePercentage()
      .then((response) => {
        setTotalRequestChange(response);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
    adminService
      .getAdminStatsTotalResolvedRequest()
      .then((count) => {
        setTotalResolvedRequestChange(count);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
      adminService
      .getAdminStatsTotalResolvedRequestChangePercentage()
      .then((response) => {
        setTotalResolvedRequestChangePercentage(response);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
      adminService
      .getAdminStatsTotalPendingRequest()
      .then((count) => {
        setTotalPendingRequest(count);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch user count");
        console.error(err);
      })
      .finally(() => setLoading(false));
    
    adminService
      .getRequestsByUnit()
      .then((data) => {
        setRequestsByUnit(data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to fetch requests by unit");
        console.error(err);
      })
      .finally(() => setLoading(false));

  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={totalUsers} icon={Users} trend={{ value: totalUserChange.percentage, isPositive: totalUserChange.isPositive }} />
        <StatsCard title="Total Requests" value={totalRequests} icon={FileText} trend={{ value: totalRequestChange.percentage, isPositive: totalRequestChange.isPositive }} />
        <StatsCard title="Resolved This Month" value={totalResolvedRequests} icon={CheckCircle} trend={{ value: totalResolvedRequestsChange.percentage, isPositive: totalResolvedRequestsChange.isPositive }} />
        <StatsCard title="Pending Requests" value={totalPendingRequests} icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Requests by Unit</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/requests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestsByUnit.length > 0 && (() => {
                const totalRequests = requestsByUnit.reduce((sum, item) => sum + item.requestCount, 0);
                return requestsByUnit.map((item) => {
                  const percentage = totalRequests > 0 ? (item.requestCount / totalRequests) * 100 : 0;
                  return (
                    <div key={item.unitName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.unitName}</span>
                        <span className="text-muted-foreground">{item.requestCount} requests</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New request submitted", user: "Zeynep Kaya", time: "2 min ago", icon: FileText },
                { action: "Request resolved", user: "Mehmet Öztürk", time: "15 min ago", icon: CheckCircle },
                { action: "New user registered", user: "Ali Demir", time: "1 hour ago", icon: Users },
                { action: "Request transferred", user: "Fatma Yıldız", time: "2 hours ago", icon: Building2 },
                { action: "Priority updated", user: "Admin", time: "3 hours ago", icon: TrendingUp },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
