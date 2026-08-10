import type { Prisma } from '@prisma/client'

export interface Exercise {
  id: string
  name: string
  description: Prisma.JsonValue | null
  imageUrl: string | null
  category: string
  subCategory: string | null
  hasLeftRight: boolean
}