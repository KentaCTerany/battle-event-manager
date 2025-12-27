import { Battle } from '../types'

const KEY = 'db:battles:v1'

export function loadBattles(): Battle[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as any[]

    // マイグレーション: 以前は単一の `division` を持っていた可能性がある
    const migrated: Battle[] = parsed.map((item) => {
      // 既に新フォーマットの場合
      if (Array.isArray(item.divisions)) return item as Battle

      // 旧フォーマット: division が文字列として保存されている場合
      if (typeof item.division === 'string') {
        return {
          ...item,
          divisions: [item.division],
        } as Battle
      }

      // 何もない場合は空配列にする
      return {
        ...item,
        divisions: Array.isArray(item.divisions) ? item.divisions : [],
      } as Battle
    })

    return migrated
  } catch {
    return []
  }
}

export function saveBattles(battles: Battle[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(battles))
  } catch {
    // ignore
  }
}
