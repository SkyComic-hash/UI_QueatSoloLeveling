import { memo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { C, RADIUS } from "../theme"
import { xpToNext } from "../game"
import type { PlayerState } from "../types"

export const PlayerHeader = memo(function PlayerHeader({ player }: { player: PlayerState }) {
  const need = xpToNext(player.level)
  const pct = Math.min(100, Math.round((player.xp / need) * 100))
  return (
    <View style={s.box}>
      <View style={s.top}>
        <View>
          <Text style={s.sys}>[ THE SYSTEM ]</Text>
          <Text style={s.rank}>{`HUNTER · ${player.totalQuests} QUESTS CLEARED`}</Text>
        </View>
        <View style={s.lvBox}>
          <Text style={s.lvLabel}>LV</Text>
          <Text style={s.lv}>{player.level}</Text>
        </View>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.xp}>{`${player.xp} / ${need} XP`}</Text>
    </View>
  )
})

const s = StyleSheet.create({
  box: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.neon,
    borderRadius: RADIUS,
    padding: 16,
    gap: 10,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sys: { color: C.neon, fontSize: 15, fontWeight: "800", letterSpacing: 2 },
  rank: { color: C.dim, fontSize: 11, marginTop: 4, letterSpacing: 1 },
  lvBox: { alignItems: "center" },
  lvLabel: { color: C.dim, fontSize: 10, letterSpacing: 1 },
  lv: { color: C.text, fontSize: 30, fontWeight: "800", fontVariant: ["tabular-nums"] },
  track: { height: 6, backgroundColor: C.border, borderRadius: RADIUS, overflow: "hidden" },
  fill: { height: 6, backgroundColor: C.danger, borderRadius: RADIUS },
  xp: { color: C.dim, fontSize: 11, textAlign: "right", fontVariant: ["tabular-nums"] },
})
