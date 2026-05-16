import * as React from "react"
import { useNavigate } from "react-router-dom"
import { TaskEdit01Icon } from "hugeicons-react"
import { Button } from "../ui/button"

export const NoTasks: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <TaskEdit01Icon className="h-24 w-24 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold mb-2">No Tasks Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Browse the marketplace to find tasks that match your skills and interests.
      </p>
      <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
    </div>
  )
}

// Made with Bob
