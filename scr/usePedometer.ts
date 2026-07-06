import { useEffect, useRef, useState } from "react"
import { Platform } from "react-native"
import { Pedometer } from "expo-sensors"

/**
 * Battery-efficient pedometer:
 * - Uses the OS hardware step counter (sensor batching, no wake locks).
 * - Subscribes only while the app is foregrounded (Expo handles lifecycle).
 * - Reports session steps; caller converts deltas to XP.
 */
export function usePedometer(): { steps: number; available: boolean } {
  const [steps, setSteps] = useState(0)
  const [available, setAvailable] = useState(false)
  const sub = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    if (Platform.OS === "web") return
    let mounted = true
    Pedometer.isAvailableAsync().then((ok) => {
      if (!mounted || !ok) return
      setAvailable(true)
      sub.current = Pedometer.watchStepCount((r) => setSteps(r.steps))
    })
    return () => {
      mounted = false
      sub.current?.remove()
    }
  }, [])

  return { steps, available }
}
