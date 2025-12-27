import React from 'react'
import { Battle } from '../types'

type Props = {
  battles: Battle[]
  onDelete: (id: string) => void
}

export default function BattleList({ battles, onDelete }: Props) {
  if (!battles.length) return <p>イベントはまだありません。</p>

  return (
    <ul>
      {battles.map((b) => (
        <li key={b.id} className="item">
          <div className="header">
            <div>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div className="meta">{b.divisions && b.divisions.length ? b.divisions.join(' / ') : '部門未設定'}{b.datetime ? `・${b.datetime}` : ''}</div>
            </div>
            <div>
              <button className="btn danger small" onClick={() => onDelete(b.id)}>削除</button>
            </div>
          </div>
          {b.location && <div className="location">場所: {b.location}</div>}
        </li>
      ))}
    </ul>
  )
}
