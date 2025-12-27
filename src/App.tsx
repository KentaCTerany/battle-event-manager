import React, { useEffect, useState } from 'react'
import useEvents from './hooks/useEvents'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import { Event } from './types'
import Modal from './components/Modal'

export default function App() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents()
  const [editing, setEditing] = useState<Event | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    // 初回ロード時にイベントが一件もない場合はモーダルを開く
    if (events.length === 0) setModalOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <header className="app-header">
        <div className="title">Dance Battle Manager</div>
      </header>

      <div className="app-container">
        <section className="single-column">
          <div className="toolbar">
            <h2>イベント一覧</h2>
            <button className="btn primary" onClick={() => { setEditing(null); setModalOpen(true) }}>イベントを追加</button>
          </div>

          <EventList events={events} onDelete={removeEvent} onEdit={(ev) => { setEditing(ev); setModalOpen(true) }} />
        </section>

        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'イベントを編集' : 'イベントを追加'}>
          <EventForm
            onAdd={(data) => {
              addEvent(data)
              setModalOpen(false)
            }}
            editing={editing}
            onUpdate={(ev) => {
              updateEvent(ev)
              setEditing(null)
              setModalOpen(false)
            }}
            onCancelEdit={() => {
              setEditing(null)
              setModalOpen(false)
            }}
          />
        </Modal>
      </div>
    </div>
  )
}
