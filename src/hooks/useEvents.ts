import { useEffect, useState } from 'react'
import { Event } from '../types'
import { loadEvents, saveEvents } from '../services/storage'

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>(() => loadEvents())

  useEffect(() => {
    saveEvents(events)
  }, [events])

  function addEvent(b: Omit<Event, 'id' | 'createdAt'>) {
    const newEvent: Event = {
      ...b,
      divisions: Array.isArray((b as any).divisions) ? (b as any).divisions : [],
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    setEvents((s) => [newEvent, ...s])
    return newEvent
  }

  function updateEvent(updated: Event) {
    setEvents((s) => s.map((b) => (b.id === updated.id ? updated : b)))
  }

  function removeEvent(id: string) {
    setEvents((s) => s.filter((b) => b.id !== id))
  }

  return { events, addEvent, updateEvent, removeEvent }
}
