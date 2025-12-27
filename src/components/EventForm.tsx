import React, { useEffect, useState } from 'react'
import { Division } from '../types'
import { Event } from '../types'

type Props = {
  onAdd: (data: { title: string; datetime?: string; location?: string; details?: string; divisions: Division[] }) => void
  onUpdate?: (ev: Event) => void
  editing?: Event | null
  onCancelEdit?: () => void
}

export default function EventForm({ onAdd, onUpdate, editing, onCancelEdit }: Props) {
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')
  const [divisions, setDivisions] = useState<Division[]>([])
  const [newDivision, setNewDivision] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '')
      setDatetime(editing.datetime || '')
      setLocation(editing.location || '')
      setDetails(editing.details || '')
      setDivisions(editing.divisions || [])
    }
  }, [editing])

  function addDivision() {
    const v = newDivision.trim()
    if (!v) return
    if (divisions.includes(v)) {
      setNewDivision('')
      return
    }
    setDivisions((s) => [...s, v])
    setNewDivision('')
  }

  function removeDivision(d: Division) {
    setDivisions((s) => s.filter((x) => x !== d))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return alert('イベント名は必須です')
    const payload = {
      title: title.trim(),
      datetime: datetime || undefined,
      location: location || undefined,
      details: details || undefined,
      divisions,
    }
    if (editing && onUpdate) {
      onUpdate({ ...editing, ...payload })
    } else {
      onAdd(payload)
    }
    // reset only when not editing
    if (!editing) {
      setTitle('')
      setDatetime('')
      setLocation('')
      setDetails('')
      setDivisions([])
      setNewDivision('')
    }
  }

  return (
    <form onSubmit={submit} className="battle-form">
      <div className="form-row">
        <label>イベント名</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-row">
        <label>日時（任意）</label>
        <input className="input" type="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
      </div>

      <div className="form-row">
        <label>場所（任意）</label>
        <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div className="form-row">
        <label>詳細（任意）</label>
        <textarea className="input" value={details} onChange={(e) => setDetails(e.target.value)} />
      </div>

      <div className="form-row">
        <label>部門（複数可）</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
          <input
            className="input"
            placeholder="例: ハウス"
            value={newDivision}
            onChange={(e) => setNewDivision(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addDivision()
              }
            }}
          />
          <button type="button" className="btn" onClick={addDivision}>
            追加
          </button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {divisions.map((d) => (
            <span key={d} className="tag">
              <span>{d}</span>
              <button type="button" onClick={() => removeDivision(d)} aria-label={`remove ${d}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button type="submit" className="btn primary">{editing ? '更新' : '追加'}</button>
        {editing && (
          <button type="button" className="btn" onClick={onCancelEdit}>キャンセル</button>
        )}
      </div>
    </form>
  )
}
