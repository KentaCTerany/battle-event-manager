// 部門は将来的に「ハウス」「ヒップホップ」等の任意の名称を複数持てるようにします
export type Division = string

export interface Battle {
  id: string
  title: string
  datetime?: string
  location?: string
  details?: string
  // 1大会につき複数の部門を持てるように配列にする
  divisions: Division[]
  createdAt: string
}
