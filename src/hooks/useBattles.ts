import { useEffect, useState } from 'react'
import { Battle } from '../types'
import { loadBattles, saveBattles } from '../services/storage'

export default function useBattles() {
  const [battles, setBattles] = useState<Battle[]>(() => loadBattles())

  useEffect(() => {
    saveBattles(battles)
  }, [battles])

  function addBattle(b: Omit<Battle, 'id' | 'createdAt'>) {
    const newBattle: Battle = {
      ...b,
      // 保険: divisions が無ければ空配列にする
      divisions: Array.isArray((b as any).divisions) ? (b as any).divisions : [],
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    setBattles((s) => [newBattle, ...s])
    return newBattle
  }

  function updateBattle(updated: Battle) {
    setBattles((s) => s.map((b) => (b.id === updated.id ? updated : b)))
  }

  function removeBattle(id: string) {
    setBattles((s) => s.filter((b) => b.id !== id))
  }

  return { battles, addBattle, updateBattle, removeBattle }
}
