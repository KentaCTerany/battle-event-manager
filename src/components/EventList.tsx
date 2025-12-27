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
          <div className="item-top">
            <div className="title-block">
              <div className="item-title">{b.title}</div>
              <div className="meta">
                {b.datetime ? <span className="datetime">{b.datetime}</span> : null}
                {b.location ? <span className="location-inline">{b.location}</span> : null}
              </div>
            </div>

            <div className="actions-vertical">
              <button className="btn" onClick={() => onEdit(b)}>編集</button>
              <button className="btn danger small" onClick={() => onDelete(b.id)}>削除</button>
            </div>
          </div>

          <div className="divisions">
            {b.divisions && b.divisions.length ? (
              b.divisions.map((d) => (
                <div key={d} className="division">{d}</div>
              ))
            ) : (
              <div className="division">部門未設定</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
