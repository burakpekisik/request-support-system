import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
  variant?: "default" | "card" | "inline"
}

export function LoadingState({ 
  message = "Loading...", 
  className,
  variant = "default" 
}: LoadingStateProps) {
  const content = (
    <div className={cn(
      "flex items-center justify-center gap-2",
      variant === "inline" ? "py-2" : "py-8",
      className
    )}>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )

  if (variant === "card") {
    return (
      <Card>
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    )
  }

  return content
}
