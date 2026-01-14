export interface Sticker {
  id: number
  icon: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface Work {
  id: number
  frames: string[]
  stickers: Sticker[]
  borderColor: string
  borderWidth: string
  createdAt: string
  status: 'draft' | 'completed'
}

export interface Step {
  label: string
  icon?: string
}

export type BorderWidth = 'narrow' | 'medium' | 'wide'
