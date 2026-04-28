import { prisma } from '@/lib/prisma'

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no 0/O/1/I to avoid confusion
const CODE_LENGTH = 4
const MAX_ATTEMPTS = 10

export async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let code = ''
    for (let j = 0; j < CODE_LENGTH; j++) {
      code += CHARSET[Math.floor(Math.random() * CHARSET.length)]
    }

    const existing = await prisma.groupSession.findUnique({
      where: { code },
      select: { id: true },
    })

    if (!existing) return code
  }

  throw new Error('Failed to generate a unique session code')
}
