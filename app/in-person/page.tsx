import Link from 'next/link'
import { CheckCircleIcon } from "@heroicons/react/20/solid"

const benefits = [
  "Enhance Flexibility: Improve your range of motion and reduce stiffness.",
  "Boost Performance: Elevate your athletic abilities and feel more free in your daily movement.",
  "Injury Prevention: Strengthen your connective tissue to avoid common injuries like ankle sprains & plantar fasciitis",
  "Feel Energized: Experience increased vitality and overall well-being.",
];

export default function InPersonPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </nav>

        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900">
            LIVE CLASSES
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-slate-600">
            A simple way to think about the week: <strong className="font-semibold text-slate-800">Monday, Wednesday, and Friday</strong> are how
            we tune the instrument, and <strong className="font-semibold text-slate-800">Saturday</strong> is the symphony.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-relaxed text-slate-600">
            The classes below are all levels, and all of them are available in person, or live online.
          </p>

          <div className="mt-16 border-t border-slate-200 pt-16">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              MOBILITY BLUEPRINT LIVE
            </h2>

            <p className="mt-6 text-center text-lg leading-relaxed text-slate-600">
              These weekday sessions are where we do the deep, quiet work in the connective tissue. We
              use the &ldquo;Science of Yoga&rdquo; to unlock the fascia, hydrate the joints, and build the
              specific stability that Saturday demands.
            </p>

            <div className="mt-8 text-center">
              <p className="text-xl text-slate-600">
                In person at{' '}
                <a
                  href="https://maps.app.goo.gl/Pcc69EiJfLoDzMMh9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Sixth House Wellness Studio
                </a>
                , Little Rock
              </p>

              <p className="mt-6 text-xl text-slate-600">
                Monday, Wednesday, & Friday
              </p>

              <p className="mt-2 text-xl text-slate-600">
                8:00am - 8:45am
              </p>

              <Link
                href="https://www.sixthhousestudio.com/pages/yoga"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block text-lg font-semibold text-blue-600 hover:text-blue-500"
              >
                FIND OUT MORE ON THE SIXTH HOUSE YOGA PAGE →
              </Link>
            </div>
          </div>

          <div className="mt-16 border-t border-slate-200 pt-16">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              SATURDAY VINYASA
            </h2>

            <p className="mt-6 text-center text-lg leading-relaxed text-slate-600">
              Saturday is the pinnacle: a vinyasa practice that weaves in myofascial work so the whole body
              moves as one. Lively, full, and the kind of class that leaves you clear-headed and
              energized—an ideal bookend to the week. Join live in person or live online, follow the link
              below for schedule and details.
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-x-3 text-slate-600">
                  <CheckCircleIcon className="h-6 w-6 flex-none text-blue-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center">
              <Link
                href="/saturday-vinyasa"
                className="inline-block text-lg font-semibold text-blue-600 hover:text-blue-500"
              >
                LEARN MORE ABOUT SATURDAY VINYASA →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 