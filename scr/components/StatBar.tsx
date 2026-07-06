import { memo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { C, RADIUS } from "../theme"
import { xpToNext } from "../game"
import type { Attribute } from "../types"
import { ATTR_META } from "../game"

/** Flat progress bar — no gradients/shadows, single View width change. */
export const StatBar = memo(function StatBar({ attr }: { attr: Attribute }) {
  const need = xpToNext(attr.level)
  const pct = Math.min(100, Math.round((attr.xp / need) * 100))
  const meta = ATTR_META[attr.id]
  return (
    <View style={s.row}>
      <Text style={s.code}>{meta.label}</Text>
      <View style={s.mid}>
        <View style={s.head}>
          <Text style={s.name}>{meta.ru}</Text>
          <Text style={s.lv}>{`LV ${attr.level}`}</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  )
})

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  code: {
    color: C.neon,
    fontSize: 13,
    fontWeight: "700",
    width: 36,
    fontVariant: ["tabular-nums"],
  },
  mid: { flex: 1, gap: 5 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  name: { color: C.text, fontSize: 13 },
  lv: { color: C.dim, fontSize: 12, fontVariant: ["tabular-nums"] },
  track: {
    height: 5,
    backgroundColor: C.border,
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  fill: { height: 5, backgroundColor: C.neon, borderRadius: RADIUS },
})
