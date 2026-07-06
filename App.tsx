import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { C, SPACE } from "./src/theme"
import { applyQuestXp, initialState, stepsToXp, todayKey } from "./src/game"
import { loadState, saveState } from "./src/storage"
import { usePedometer } from "./src/usePedometer"
import { PlayerHeader } from "./src/components/PlayerHeader"
import { StatBar } from "./src/components/StatBar"
import { QuestCard } from "./src/components/QuestCard"
import type { PlayerState, Quest } from "./src/types"
// Config loaded once at startup via Metro (lazy `import()` on multi-screen apps)
import config from "./src/data/quests.json"

const QUESTS = config.quests as Quest[]
const QUOTES = config.quotes

export default function App() {
  const [player, setPlayer] = useState<PlayerState>(initialState)
  const [ready, setReady] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const { steps, available } = usePedometer()
  const creditedSteps = useRef(0)

  // Load persisted state + daily reset
  useEffect(() => {
    loadState().then((st) => {
      const key = todayKey()
      setPlayer(st.lastReset === key ? st : { ...st, completedToday: [], lastReset: key })
      setReady(true)
    })
  }, [])

  // Persist on change (debounced inside saveState)
  useEffect(() => {
    if (ready) saveState(player)
  }, [player, ready])

  // Convert step deltas into END XP
  useEffect(() => {
    const delta = steps - creditedSteps.current
    const xp = stepsToXp(delta)
    if (xp > 0) {
      creditedSteps.current += xp * 100
      setPlayer((p) => ({ ...applyQuestXp(p, "END", xp), steps: p.steps + xp * 100 }))
    }
  }, [steps])

  const completeQuest = useCallback((q: Quest) => {
    setPlayer((p) => {
      if (p.completedToday.includes(q.id)) return p
      const before = p.level
      const next = applyQuestXp(p, q.attribute, q.xp)
      if (next.level > before) {
        setFlash(`LEVEL UP! → LV ${next.level}`)
        setTimeout(() => setFlash(null), 2500)
      }
      return { ...next, completedToday: [...p.completedToday, q.id] }
    })
  }, [])

  const quote = useMemo(() => {
    const d = new Date()
    return QUOTES[(d.getDate() + d.getMonth()) % QUOTES.length]
  }, [])

  const attrs = useMemo(() => Object.values(player.attributes), [player.attributes])

  if (!ready) {
    return (
      <View style={[s.root, s.center]}>
        <Text style={s.loading}>[ INITIALIZING SYSTEM... ]</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <FlatList
        data={QUESTS}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => (
          <QuestCard quest={item} done={player.completedToday.includes(item.id)} onComplete={completeQuest} />
        )}
        contentContainerStyle={s.list}
        initialNumToRender={8}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={s.gap}>
            <PlayerHeader player={player} />
            {flash ? (
              <View style={s.flash}>
                <Text style={s.flashText}>{flash}</Text>
              </View>
            ) : null}
            <View style={s.panel}>
              <Text style={s.panelTitle}>АТРИБУТЫ</Text>
              {attrs.map((a) => (
                <StatBar key={a.id} attr={a} />
              ))}
            </View>
            <View style={s.panel}>
              <Text style={s.panelTitle}>ШАГОМЕР</Text>
              <Text style={s.steps}>
                {available
                  ? `${player.steps.toLocaleString()} шагов · +1 END XP / 100 шагов`
                  : "Датчик недоступен (web-превью). На устройстве шаги начисляют END XP автоматически."}
              </Text>
            </View>
            <Text style={s.panelTitle}>ЕЖЕДНЕВНЫЕ КВЕСТЫ</Text>
          </View>
        }
        ListFooterComponent={
          <View style={s.quoteBox}>
            <Text style={s.quote}>{`«${quote}»`}</Text>
            <Text style={s.quoteSrc}>— THE SYSTEM</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center" },
  loading: { color: C.neon, letterSpacing: 2, fontSize: 14 },
  list: { padding: SPACE, paddingBottom: 40, maxWidth: 560, width: "100%", alignSelf: "center" },
  gap: { gap: SPACE, marginBottom: 8 },
  panel: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
  },
  panelTitle: { color: C.dim, fontSize: 11, letterSpacing: 2, fontWeight: "700", marginBottom: 4 },
  steps: { color: C.text, fontSize: 13, lineHeight: 19 },
  flash: {
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  flashText: { color: C.danger, fontWeight: "800", letterSpacing: 2, fontSize: 14 },
  quoteBox: { marginTop: SPACE, padding: 14, borderLeftWidth: 2, borderLeftColor: C.neon },
  quote: { color: C.text, fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  quoteSrc: { color: C.dim, fontSize: 11, marginTop: 6, letterSpacing: 1 },
})
