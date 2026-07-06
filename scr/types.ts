export type AttributeId = "STR" | "AGI" | "END" | "INT" | "CHA"

export interface Attribute {
  id: AttributeId
  level: number
  /** XP accumulated inside the current level */
  xp: number
}

export interface Quest {
  id: string
  title: string
  attribute: AttributeId
  xp: number
  /** Daily quests reset at midnight */
  daily: boolean
}

export interface PlayerState {
  name: string
  level: number
  xp: number
  attributes: Record<AttributeId, Attribute>
  /** IDs of quests completed today */
  completedToday: string[]
  /** yyyy-mm-dd of last reset */
  lastReset: string
  steps: number
  totalQuests: number
}

export interface LevelUpResult {
  level: number
  xp: number
  xpToNext: number
  leveledUp: boolean
}
