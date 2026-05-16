import * as React from "react"

const SOUND_PATH = "/sounds/SND01_sine/"

type SoundEffect = 
  | 'button' 
  | 'select' 
  | 'notification' 
  | 'transition_up' 
  | 'transition_down' 
  | 'tap'
  | 'swipe'

export function useSound() {
  const playSound = React.useCallback((effect: SoundEffect) => {
    let fileName = `${effect}.wav`
    
    // Handle variants if needed
    if (effect === 'tap') fileName = 'tap_01.wav'
    if (effect === 'swipe') fileName = 'swipe.wav'

    const audio = new Audio(`${SOUND_PATH}${fileName}`)
    audio.play().catch(e => console.warn("Audio play blocked:", e))
  }, [])

  return { playSound }
}
