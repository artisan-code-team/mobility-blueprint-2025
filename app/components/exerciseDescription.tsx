import type { PortableTextBlock } from '@portabletext/types'
import type { PortableTextComponents } from '@portabletext/react'
import clsx from 'clsx'

/**
 * Exercise `description` comes back from Prisma typed as `Prisma.JsonValue`
 * (the column just holds whatever JSON was last synced from Sanity) — this
 * narrows it to the Portable Text shape we actually expect before handing it
 * to `<PortableText>`, rather than trusting the value at every call site.
 */
export function isPortableTextBlocks(value: unknown): value is PortableTextBlock[] {
  return Array.isArray(value) && value.length > 0
}

export function createExerciseDescriptionComponents(paragraphClassName: string): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className={paragraphClassName}>{children}</p>,
    },
    list: {
      bullet: ({ children }) => (
        <ul className={clsx(paragraphClassName, 'list-disc space-y-1 pl-5')}>{children}</ul>
      ),
      number: ({ children }) => (
        <ol className={clsx(paragraphClassName, 'list-decimal space-y-1 pl-5')}>{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
    },
  }
}
