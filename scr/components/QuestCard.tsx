import { memo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { C, RADIUS } from "../theme"
import type { Quest } from "../types"

interface Props {
  quest: Quest
  done: boolean
  onComplete: (q: Quest) => void
}

export const QuestCard = memo(function QuestCard({ quest, done, onComplete }: Props) {
  return (
    <Pressable
      onPress={() => !done && onComplete(quest)}
      style={({ pressed }) => [s.card, done && s.done, pressed && !done && s.pressed]}
      accessibilityRole="button"
      accessibilityState={{ disabled: done }}
    >
      <View style={s.left}>
        <Text style={[s.title, done && s.titleDone]}>{quest.title}</Text>
        <Text style={s.meta}>{`${quest.attribute} +${quest.xp} XP`}</Text>
      </View>
      <Text style={[s.mark, done && s.markDone]}>{done ? "✓" : "+"}</Text>
    </Pressable>
  )
})

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
  },
  pressed: { borderColor: C.neon },
  done: { opacity: 0.45 },
  left: { flex: 1, gap: 3 },
  title: { color: C.text, fontSize: 14, fontWeight: "600" },
  titleDone: { textDecorationLine: "line-through", color: C.dim },
  meta: { color: C.dim, fontSize: 12, fontVariant: ["tabular-nums"] },
  mark: { color: C.danger, fontSize: 16, fontWeight: "700", paddingLeft: 12 },
  markDone: { color: C.neon },
})
