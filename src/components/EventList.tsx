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
    <ul className="event-list__list">
      {events.map((b) => (
        <li key={b.id} className="event-list__item">
          <div className="event-item">
            <div className="event-item__content">
              <div className="event-item__title">{b.title}</div>
              {(b.datetime || b.location) && (
                <div className="event-item__meta">
                  {b.datetime ? <span className="event-item__datetime">{b.datetime}</span> : null}
                  {b.location ? <span className="event-item__location">{b.location}</span> : null}
                </div>
              )}

              <div className="event-item__divisions">
                {b.divisions && b.divisions.length ? (
                  b.divisions.map((d) => (
                    <div key={d} className="event-item__division">{d}</div>
                  ))
                ) : (
                  <div className="event-item__division">部門未設定</div>
                )}
              </div>
            </div>

            <div className="event-item__actions">
              <button className="btn event-item__action" onClick={() => onEdit(b)}>編集</button>
              <button className="btn danger event-item__action" onClick={() => onDelete(b.id)}>削除</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
