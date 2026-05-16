import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Award01Icon } from "hugeicons-react"
import { Button } from "../ui/button"

export const NoAchievements: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <Award01Icon className="h-24 w-24 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold mb-2">No Achievements Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Complete tasks and reach milestones to earn badges and achievements.
      </p>
      <Button onClick={() => navigate('/marketplace')}>Start Your Journey</Button>
    </div>
  )
}

// Made with Bob
