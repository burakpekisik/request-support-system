// Status Badge Types
export type StatusType = "pending" | "in_progress" | "answered" | "waiting_response" | "resolved_successfully" | "resolved_negatively" | "cancelled";

// File Upload Constants
export const AVATAR_VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
export const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const ATTACHMENT_VALID_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ATTACHMENT_VALID_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
export const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Status Mappings (from database name to UI key)
export const statusMapping: Record<string, StatusType> = {
  "Pending": "pending",
  "In Progress": "in_progress",
  "Answered": "answered",
  "Waiting Response": "waiting_response",
  "Resolved Successfully": "resolved_successfully",
  "Resolved Negatively": "resolved_negatively",
  "Cancelled": "cancelled",
};

// Status ID mappings (from database ID to UI key)
export const statusIdMap: Record<number, StatusType> = {
  1: "pending",        // Beklemede
  2: "in_progress",    // İşlemde
  3: "waiting_response", // Cevap Bekliyor
  4: "resolved_successfully", // Olumlu Çözüldü
  5: "resolved_negatively",   // Olumsuz Çözüldü
  6: "cancelled",      // İptal Edildi
};

// Reverse mapping (from UI key to database ID)
export const statusIdReverseMap: Record<StatusType, number> = {
  "pending": 1,
  "in_progress": 2,
  "answered": 3, // alias for waiting_response
  "waiting_response": 3,
  "resolved_successfully": 4,
  "resolved_negatively": 5,
  "cancelled": 6,
};

// Status options with labels and colors (for dropdowns/selects)
export const statusOptions: { value: StatusType; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-yellow-600" },
  { value: "in_progress", label: "In Progress", color: "text-blue-600" },
  { value: "waiting_response", label: "Waiting Response", color: "text-orange-600" },
  { value: "resolved_successfully", label: "Resolved Successfully", color: "text-green-600" },
  { value: "resolved_negatively", label: "Resolved Negatively", color: "text-red-600" },
  { value: "cancelled", label: "Cancelled", color: "text-muted-foreground" },
];

// Priority Colors - Database: Low(#28a745), Normal(#17a2b8), High(#ffc107), Critical(#dc3545)
export const priorityColors: Record<string, string> = {
  Low: "bg-green-600/20 text-green-700 border-green-600/30",
  Normal: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  High: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  Critical: "bg-red-600/20 text-red-700 border-red-600/30",
};

// Backend Base URL (removes /api from API URL)
export const getBackendBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
};

// Get full URL for static files (avatars, attachments)
export const getFullStaticUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  // Ensure URL starts with /
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${getBackendBaseUrl()}${normalizedUrl}`;
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

// Format date to readable string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get priority color class based on priority name
export function getPriorityColorClass(priority: string): string {
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('yüksek') || priorityLower.includes('high') || priorityLower.includes('critical')) {
    return 'bg-destructive/20 text-destructive';
  }
  if (priorityLower.includes('orta') || priorityLower.includes('medium') || priorityLower.includes('normal')) {
    return 'bg-yellow-500/20 text-yellow-600';
  }
  return 'bg-green-500/20 text-green-600';
}

// Format file size from bytes
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Format file size from MB (for attachments stored with size in MB)
export function formatFileSizeMb(sizeMb: number): string {
  if (sizeMb < 0.001) return '< 1 KB';
  if (sizeMb < 1) return (sizeMb * 1024).toFixed(1) + ' KB';
  return sizeMb.toFixed(2) + ' MB';
}

// Format timestamp to readable string with time
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Check if role is student type
export function isStudentRole(role: string): boolean {
  return role.toLowerCase() === 'student' || role.toLowerCase() === 'öğrenci';
}
