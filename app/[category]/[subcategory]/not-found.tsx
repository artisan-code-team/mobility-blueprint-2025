import { Button } from '@/app/components/Button'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h2 className="text-3xl font-bold text-slate-800">Category Not Found</h2>
      <p className="mt-4 text-slate-600">
        Sorry, we couldn&apos;t find the exercise category you&apos;re looking for.
      </p>
      <div className="mt-8">
        <Button href="/" color="blue">
          Return Home
        </Button>
      </div>
    </div>
  )
} 