import React, { useState } from 'react'
import { Battle } from '../types'

type Props = {
  onAdd: (b: Battle) => void
}

export default function BattleEditor({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const newBattle: Battle = {
      id: String(Date.now()),
      title: title.trim(),
      date: date || undefined,
      description: description || undefined,
    }
    onAdd(newBattle)
    setTitle('')
    setDate('')
    setDescription('')
  }

  return (
    <form onSubmit={submit} className="battle-editor">
      <div className="field">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Battle title" />
      </div>
      <div className="field">
        <label>Date</label>
        <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" />
      </div>
      <div className="field">
        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>
      <div className="actions">
        <button type="submit">Add Battle</button>
      </div>
    </form>
  )
}
