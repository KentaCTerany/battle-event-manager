import React, { useEffect, useState } from 'react'
import { Battle } from './types'
import BattleEditor from './components/BattleEditor'
import BattleList from './components/BattleList'
import './index.css'

const STORAGE_KEY = 'battle-event-manager:v1'

export default function App() {
  const [battles, setBattles] = useState<Battle[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Battle[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(battles))
    } catch {}
  }, [battles])

  const addBattle = (b: Battle) => setBattles((s) => [...s, b])
  const updateBattle = (updated: Battle) =>
    setBattles((s) => s.map((b) => (b.id === updated.id ? updated : b)))
  const removeBattle = (id: string) => setBattles((s) => s.filter((b) => b.id !== id))

  return (
    <div className="app-root">
      <header>
        <h1>Dance Battle Manager</h1>
        <p className="subtitle">Create and manage dance battles (saved locally)</p>
      </header>

      <main>
        <section className="editor">
          <BattleEditor onAdd={addBattle} />
        </section>
        <section className="list">
          <BattleList battles={battles} onDelete={removeBattle} onUpdate={updateBattle} />
        </section>
      </main>

      <footer>
        <small>Build target: docs/ (run <code>pnpm build</code>)</small>
      </footer>
    </div>
  )
}

