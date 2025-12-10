// Status Badge Types
export type StatusType = "pending" | "in_progress" | "answered" | "waiting_response" | "resolved_successfully" | "resolved_negatively" | "cancelled";

// Status Mappings
export const statusMapping: Record<string, StatusType> = {
  "Pending": "pending",
  "In Progress": "in_progress",
  "Answered": "answered",
  "Waiting Response": "waiting_response",
  "Resolved Successfully": "resolved_successfully",
  "Resolved Negatively": "resolved_negatively",
  "Cancelled": "cancelled",
};

// Priority Colors - Database: Low(#28a745), Normal(#17a2b8), High(#ffc107), Critical(#dc3545)
export const priorityColors: Record<string, string> = {
  Low: "bg-green-600/20 text-green-700 border-green-600/30",
  Normal: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  High: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Critical: "bg-red-600/20 text-red-700 border-red-600/30",
};

// Helper Functions
export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
