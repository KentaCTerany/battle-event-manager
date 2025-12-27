import React from 'react'
import useBattles from './hooks/useBattles'
import BattleForm from './components/BattleForm'
import BattleList from './components/BattleList'

export default function App() {
  const { battles, addBattle, removeBattle } = useBattles()

  return (
    <div>
      <header className="app-header">
        <div className="title">Dance Battle Manager</div>
      </header>

      <div className="app-container">
        {battles.length === 0 ? (
          <section className="single-column">
            <div className="battle-form">
              <h2>イベントを追加</h2>
              <BattleForm
                onAdd={(data) => {
                  addBattle(data)
                }}
              />
              <div className="empty-state">イベントがまだ登録されていません。まずはイベントを追加してください。</div>
            </div>
          </section>
        ) : (
          <section className="app-grid">
            <div className="battle-form">
              <h2>イベントを追加</h2>
              <BattleForm
                onAdd={(data) => {
                  addBattle(data)
                }}
              />
            </div>

            <div className="battle-list">
              <h2>イベント一覧</h2>
              <BattleList battles={battles} onDelete={removeBattle} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
