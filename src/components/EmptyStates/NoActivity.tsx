import * as React from "react"
import { FlashIcon } from "hugeicons-react"

export const NoActivity: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <FlashIcon className="h-24 w-24 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold mb-2">No Activity Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Complete tasks to see your activity history and track your progress.
      </p>
    </div>
  )
}

// Made with Bob
