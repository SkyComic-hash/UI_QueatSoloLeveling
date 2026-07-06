import type { AttributeId, LevelUpResult, PlayerState } from "./types"

/**
 * XP required to advance FROM a given level.
 * Exponential curve: base 100, growth factor 1.35.
 * Pure integer math — no floats stored, cheap on mobile CPUs.
 */
export function xpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1))
}

/**
 * Applies gained XP, cascading through multiple level-ups if needed.
 * O(levels gained) — effectively O(1) in practice.
 */
export function calculateLevelUp(level: number, xp: number, gained: number): LevelUpResult {
  let lv = level
  let total = xp + gained
  let need = xpToNext(lv)
  let leveledUp = false

  while (total >= need) {
    total -= need
    lv += 1
    leveledUp = true
    need = xpToNext(lv)
  }

  return { level: lv, xp: total, xpToNext: need, leveledUp }
}

export const ATTR_META: Record<AttributeId, { label: string; ru: string }> = {
  STR: { label: "STR", ru: "Сила" },
  AGI: { label: "AGI", ru: "Ловкость" },
  END: { label: "END", ru: "Выносливость" },
  INT: { label: "INT", ru: "Интеллект" },
  CHA: { label: "CHA", ru: "Харизма" },
}

const ATTR_IDS: AttributeId[] = ["STR", "AGI", "END", "INT", "CHA"]

export function initialState(): PlayerState {
  const attributes = {} as PlayerState["attributes"]
  for (const id of ATTR_IDS) attributes[id] = { id, level: 1, xp: 0 }
  return {
    name: "Player",
    level: 1,
    xp: 0,
    attributes,
    completedToday: [],
    lastReset: todayKey(),
    steps: 0,
    totalQuests: 0,
  }
}

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Award quest XP: updates attribute + player level in one pass. */
export function applyQuestXp(state: PlayerState, attr: AttributeId, xp: number): PlayerState {
  const a = state.attributes[attr]
  const attrRes = calculateLevelUp(a.level, a.xp, xp)
  const playerRes = calculateLevelUp(state.level, state.xp, xp)
  return {
    ...state,
    level: playerRes.level,
    xp: playerRes.xp,
    totalQuests: state.totalQuests + 1,
    attributes: {
      ...state.attributes,
      [attr]: { ...a, level: attrRes.level, xp: attrRes.xp },
    },
  }
}

/** 1 END XP per 100 steps — computed on delta, not per-step. */
export function stepsToXp(deltaSteps: number): number {
  return Math.floor(deltaSteps / 100)
}
