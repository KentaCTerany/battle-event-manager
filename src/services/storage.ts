import { Event } from '../types'

const KEY = 'db:events:v1'

export function loadEvents(): Event[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as any[]

    // マイグレーション: 以前は単一の `division` を持っていた可能性がある
    const migrated: Event[] = parsed.map((item) => {
      if (Array.isArray(item.divisions)) return item as Event
      if (typeof item.division === 'string') {
        return {
          ...item,
          divisions: [item.division],
        } as Event
      }
      return {
        ...item,
        divisions: Array.isArray(item.divisions) ? item.divisions : [],
      } as Event
    })

    return migrated
  } catch {
    return []
  }
}

export function saveEvents(events: Event[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {
    // ignore
  }
}
