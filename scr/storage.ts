import AsyncStorage from "@react-native-async-storage/async-storage"
import type { PlayerState } from "./types"
import { initialState } from "./game"

/**
 * Single-key persistence with debounced writes.
 * On a real device, swap AsyncStorage for react-native-mmkv (synchronous,
 * ~30x faster) — the API surface below stays identical.
 */
const KEY = "system.player.v1"

export async function loadState(): Promise<PlayerState> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as PlayerState
  } catch {}
  return initialState()
}

let pending: ReturnType<typeof setTimeout> | null = null

/** Debounced save — batches rapid quest completions into one disk write. */
export function saveState(state: PlayerState): void {
  if (pending) clearTimeout(pending)
  pending = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {})
    pending = null
  }, 400)
}
