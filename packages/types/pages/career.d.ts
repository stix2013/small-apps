import type { Image } from '../app/image'

export interface CareerPoint {
  title: string
  description: string[]
  image?: Image
  imagePosition: 'left' | 'right'
}

export interface Job {
  id: number
  title: string
  description: string
}

export interface JobPath extends Job {
  path: string
}
