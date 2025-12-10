// Status Badge Types
export type StatusType = "pending" | "in_progress" | "resolved";

// Status Mappings
export const statusMapping: Record<string, StatusType> = {
  "Beklemede": "pending",
  "Pending": "pending",
  "İşlemde": "in_progress",
  "In Progress": "in_progress",
  "Çözüldü": "resolved",
  "Resolved": "resolved",
};

// Priority Colors
export const priorityColors: Record<string, string> = {
  Yüksek: "bg-destructive/20 text-destructive border-destructive/30",
  High: "bg-destructive/20 text-destructive border-destructive/30",
  Orta: "bg-warning/20 text-warning-foreground border-warning/30",
  Medium: "bg-warning/20 text-warning-foreground border-warning/30",
  Düşük: "bg-muted text-muted-foreground border-muted",
  Low: "bg-muted text-muted-foreground border-muted",
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
