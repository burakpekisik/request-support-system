import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

const messages = [
  {
    id: 1,
    author: "Mehmet Öztürk",
    role: "officer",
    initials: "MÖ",
    content:
      "Hello Ahmet, thank you for reporting this issue. I've checked our system and it appears your card may need to be re-synced with the library terminals. Could you please visit the IT Help Desk at the main library entrance?",
    timestamp: "December 5, 2024 at 2:30 PM",
    attachments: [],
  },
  {
    id: 2,
    author: "Ahmet Yılmaz",
    role: "student",
    initials: "AY",
    content:
      "Thank you for the quick response! I'll visit the IT Help Desk tomorrow morning. What documents should I bring with me?",
    timestamp: "December 5, 2024 at 3:15 PM",
    attachments: [],
  },
  {
    id: 3,
    author: "Mehmet Öztürk",
    role: "officer",
    initials: "MÖ",
    content:
      "Please bring your student ID card and the library access card. Our technician will verify your identity and re-program the card if needed. The process usually takes about 10-15 minutes.",
    timestamp: "December 5, 2024 at 3:45 PM",
    attachments: [{ name: "library-card-reset-instructions.pdf", size: "245 KB" }],
  },
  {
    id: 4,
    author: "Ahmet Yılmaz",
    role: "student",
    initials: "AY",
    content: "Perfect, I have both cards. I'll be there at 9 AM tomorrow. Thank you for your help!",
    timestamp: "December 5, 2024 at 4:00 PM",
    attachments: [],
  },
]

export function ConversationTimeline() {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={cn("flex gap-4", message.role === "student" ? "flex-row-reverse" : "")}>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className={cn(
                message.role === "officer"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {message.initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn("flex-1 max-w-[80%]", message.role === "student" ? "text-right" : "")}>
            <div
              className={cn(
                "rounded-xl p-4",
                message.role === "officer" ? "bg-muted text-foreground" : "bg-primary/10 text-foreground",
              )}
            >
              <div className={cn("flex items-center gap-2 mb-2", message.role === "student" ? "justify-end" : "")}>
                <span className="font-medium text-sm">{message.author}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <p className={cn("text-sm", message.role === "student" ? "text-right" : "text-left")}>
                {message.content}
              </p>
              {message.attachments.length > 0 && (
                <div className={cn("mt-3 space-y-2", message.role === "student" ? "flex flex-col items-end" : "")}>
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">({attachment.size})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
