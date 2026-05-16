import * as React from "react"
import { Comment01Icon } from "hugeicons-react"

export const NoMessages: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <Comment01Icon className="h-24 w-24 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold mb-2">No Messages</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start a conversation with team members or NGO coordinators.
      </p>
    </div>
  )
}

// Made with Bob
