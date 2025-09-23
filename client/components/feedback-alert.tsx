import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackAlertProps {
  type: "success" | "error"
  message: string
}

export function FeedbackAlert({ type, message }: FeedbackAlertProps) {
  return (
    <Alert
      className={cn(
        "border",
        type === "success"
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400",
      )}
    >
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
