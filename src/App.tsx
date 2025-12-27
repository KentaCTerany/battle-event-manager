import React, { useState } from 'react'
import useEvents from './hooks/useEvents'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import { Event } from './types'

export default function App() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents()
  const [editing, setEditing] = useState<Event | null>(null)

  return (
    <div>
      <header className="app-header">
        <div className="title">Dance Battle Manager</div>
      </header>

      <div className="app-container">
        {events.length === 0 ? (
          <section className="single-column">
            <div className="battle-form">
              <h2>イベントを追加</h2>
              <EventForm
                onAdd={(data) => addEvent(data)}
                editing={editing}
                onUpdate={(ev) => {
                  updateEvent(ev)
                  setEditing(null)
                }}
                onCancelEdit={() => setEditing(null)}
              />
              <div className="empty-state">イベントがまだ登録されていません。まずはイベントを追加してください。</div>
            </div>
          </section>
        ) : (
          <section className="app-grid">
            <div className="battle-list">
              <h2>イベント一覧</h2>
              <EventList events={events} onDelete={removeEvent} onEdit={(ev) => setEditing(ev)} />
            </div>

            <div className="battle-form">
              <h2>イベントを追加</h2>
              <EventForm
                onAdd={(data) => addEvent(data)}
                editing={editing}
                onUpdate={(ev) => {
                  updateEvent(ev)
                  setEditing(null)
                }}
                onCancelEdit={() => setEditing(null)}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
