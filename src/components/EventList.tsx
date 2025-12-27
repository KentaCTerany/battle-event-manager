import React from 'react'
import { Event } from '../types'

type Props = {
  events: Event[]
  onDelete: (id: string) => void
  onEdit: (ev: Event) => void
}

export default function EventList({ events, onDelete, onEdit }: Props) {
  if (!events.length) return <p>イベントはまだありません。</p>

  return (
    <ul>
      {events.map((b) => (
        <li key={b.id} className="item">
          <div className="header">
            <div>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div className="meta">{b.divisions && b.divisions.length ? b.divisions.join(' / ') : '部門未設定'}{b.datetime ? `・${b.datetime}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => onEdit(b)}>編集</button>
              <button className="btn danger small" onClick={() => onDelete(b.id)}>削除</button>
            </div>
          </div>
          {b.location && <div className="location">場所: {b.location}</div>}
        </li>
      ))}
    </ul>
  )
}
