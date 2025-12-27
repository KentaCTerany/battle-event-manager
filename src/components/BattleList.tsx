import React from 'react'
import { Battle } from '../types'

type Props = {
  battles: Battle[]
  onDelete: (id: string) => void
}

export default function BattleList({ battles, onDelete }: Props) {
  if (!battles.length) return <p>イベントはまだありません。</p>

  return (
    <ul style={{ padding: 0, listStyle: 'none' }}>
      {battles.map((b) => (
        <li key={b.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{b.divisions && b.divisions.length ? b.divisions.join(' / ') : '部門未設定'} {b.datetime ? `・${b.datetime}` : ''}</div>
            </div>
            <div>
              <button className="btn danger small" onClick={() => onDelete(b.id)}>削除</button>
            </div>
          </div>
          {b.location && <div style={{ marginTop: 6 }}>場所: {b.location}</div>}
          {b.details && <div style={{ marginTop: 6 }}>{b.details}</div>}
        </li>
      ))}
    </ul>
  )
}
