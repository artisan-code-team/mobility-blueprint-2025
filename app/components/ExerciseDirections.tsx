'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { PortableText } from '@portabletext/react'
import clsx from 'clsx'
import { createExerciseDescriptionComponents, isPortableTextBlocks } from './exerciseDescription'

interface ExerciseDirectionsProps {
  description: unknown
  paragraphClassName: string
  className?: string
}

/**
 * Rendered inside both client and server-component call sites — kept as its
 * own 'use client' boundary so a Disclosure render-prop function never has
 * to cross the server/client boundary as a prop from a Server Component.
 */
export function ExerciseDirections({ description, paragraphClassName, className }: ExerciseDirectionsProps) {
  if (!isPortableTextBlocks(description)) return null

  const components = createExerciseDescriptionComponents(paragraphClassName)

  return (
    <Disclosure as="div" className={className}>
      {({ open }) => (
        <>
          <DisclosureButton className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ChevronRightIcon className={clsx('h-4 w-4 transition-transform', open && 'rotate-90')} />
            Directions
          </DisclosureButton>
          <DisclosurePanel>
            <PortableText value={description} components={components} />
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
