import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { FileText, File, Download, Image } from "lucide-react"
import { 
  getFullStaticUrl, 
  getInitials, 
  formatTimestamp, 
  formatFileSizeMb,
  isStudentRole 
} from "@/lib/constants"
import type { TimelineEntry } from "@/lib/api/types"

interface ConversationTimelineProps {
  entries?: TimelineEntry[]
}

// Get file icon based on file type (returns JSX, must stay in component)
function getFileIcon(fileType: string | undefined, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  if (fileType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
    return <Image className="w-4 h-4 text-blue-500" />
  }
  if (ext === 'pdf' || fileType === 'application/pdf') {
    return <FileText className="w-4 h-4 text-red-500" />
  }
  if (ext === 'docx' || fileType?.includes('word')) {
    return <FileText className="w-4 h-4 text-blue-600" />
  }
  return <File className="w-4 h-4 text-muted-foreground" />
}

export function ConversationTimeline({ entries = [] }: ConversationTimelineProps) {
  // If no entries, show empty state
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No conversation history yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => {
        const isStudent = isStudentRole(entry.actorRole)
        
        return (
          <div key={entry.id} className={cn("flex gap-4", isStudent ? "flex-row-reverse" : "")}>
            <Avatar className="h-10 w-10 shrink-0">
              {entry.actorAvatarUrl && (
                <AvatarImage src={getFullStaticUrl(entry.actorAvatarUrl) || undefined} />
              )}
              <AvatarFallback
                className={cn(
                  !isStudent
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {getInitials(entry.actorName)}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 max-w-[80%]", isStudent ? "text-right" : "")}>
              <div
                className={cn(
                  "rounded-xl p-4",
                  !isStudent ? "bg-muted text-foreground" : "bg-primary/10 text-foreground",
                )}
              >
                <div className={cn("flex items-center gap-2 mb-2", isStudent ? "justify-end" : "")}>
                  <span className="font-medium text-sm">{entry.actorName}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(entry.createdAt)}</span>
                </div>
                
                {/* Status change indicator */}
                {entry.previousStatus && entry.previousStatus !== entry.newStatus && (
                  <div className={cn(
                    "text-xs text-muted-foreground mb-2 italic",
                    isStudent ? "text-right" : "text-left"
                  )}>
                    Status changed: {entry.previousStatus} → {entry.newStatus}
                  </div>
                )}
                
                {/* Comment/message */}
                {entry.comment && (
                  <p className={cn("text-sm", isStudent ? "text-right" : "text-left")}>
                    {entry.comment}
                  </p>
                )}
                
                {/* Attachments */}
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className={cn("mt-3 space-y-2", isStudent ? "text-right" : "text-left")}>
                    <p className="text-xs text-muted-foreground font-medium">Attachments:</p>
                    <div className={cn("flex flex-wrap gap-2", isStudent ? "justify-end" : "justify-start")}>
                      {entry.attachments.map((attachment) => {
                        const fileUrl = getFullStaticUrl(attachment.filePath)
                        const isImage = attachment.fileType?.startsWith('image/') || 
                          ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
                            attachment.fileName.split('.').pop()?.toLowerCase() || ''
                          )
                        
                        return (
                          <a
                            key={attachment.id}
                            href={fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                              "bg-background border hover:bg-accent transition-colors",
                              "max-w-[200px]"
                            )}
                          >
                            {getFileIcon(attachment.fileType, attachment.fileName)}
                            <span className="truncate flex-1">{attachment.fileName}</span>
                            <span className="text-muted-foreground shrink-0">
                              ({formatFileSizeMb(attachment.fileSizeMb)})
                            </span>
                            <Download className="w-3 h-3 text-muted-foreground shrink-0" />
                          </a>
                        )
                      })}
                    </div>
                    
                    {/* Image previews */}
                    {entry.attachments.filter(a => 
                      a.fileType?.startsWith('image/') || 
                      ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
                        a.fileName.split('.').pop()?.toLowerCase() || ''
                      )
                    ).length > 0 && (
                      <div className={cn("flex flex-wrap gap-2 mt-2", isStudent ? "justify-end" : "justify-start")}>
                        {entry.attachments
                          .filter(a => 
                            a.fileType?.startsWith('image/') || 
                            ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
                              a.fileName.split('.').pop()?.toLowerCase() || ''
                            )
                          )
                          .map((attachment) => (
                            <a
                              key={`preview-${attachment.id}`}
                              href={getFullStaticUrl(attachment.filePath) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={getFullStaticUrl(attachment.filePath) || ''}
                                alt={attachment.fileName}
                                className="max-w-[150px] max-h-[100px] rounded-md border object-cover hover:opacity-90 transition-opacity"
                              />
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* If no comment but status changed, show status change message */}
                {!entry.comment && entry.previousStatus !== entry.newStatus && (
                  <p className={cn("text-sm text-muted-foreground", isStudent ? "text-right" : "text-left")}>
                    Changed status to "{entry.newStatus}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
