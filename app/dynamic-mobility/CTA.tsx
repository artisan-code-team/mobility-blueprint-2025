/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

export default function CTA() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
        <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-48 lg:pt-40 xl:col-span-6">
          <div className="mx-auto max-w-lg lg:mx-0">
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-11"
            />
            <div className="hidden sm:mt-32 sm:flex lg:mt-16">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Anim aute id magna aliqua ad ad non deserunt sunt.{" "}
                <Link
                  href="/"
                  className="whitespace-nowrap font-semibold text-indigo-600"
                >
                  <span aria-hidden="true" className="absolute inset-0" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="mt-24 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:mt-10 sm:text-7xl">
              Unlock Your Body&apos;s Potential
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              This is your blueprint for better movement, the focus is on
              conditioning and restoring your body&apos;s connective tissue.
              This unique approach goes beyond traditional workouts, helping you
              enhance your mobility, prevent injuries, look, and feel your best
              at any age.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link href="/" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2102&q=80"
            className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
          />
        </div>
      </div>
    </div>
  );
}
