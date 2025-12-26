import React from 'react'
import { Battle } from '../types'

type Props = {
  battles: Battle[]
  onDelete: (id: string) => void
  onUpdate: (b: Battle) => void
}

export default function BattleList({ battles, onDelete, onUpdate }: Props) {
  if (!battles.length) return <p>No battles yet. Add one above.</p>

  return (
    <ul className="battle-list">
      {battles.map((b) => (
        <li key={b.id} className="battle-item">
          <div className="battle-main">
            <div className="battle-title">{b.title}</div>
            {b.date && <div className="battle-date">{b.date}</div>}
          </div>
          {b.description && <div className="battle-desc">{b.description}</div>}
          <div className="battle-actions">
            <button onClick={() => onDelete(b.id)} className="btn btn-danger">Delete</button>
            <button
              onClick={() => onUpdate({ ...b, title: b.title + ' (edited)' })}
              className="btn"
            >
              Quick Edit
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
