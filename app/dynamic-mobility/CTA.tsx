/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Image from "next/image";

export default function CTA() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
        <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-48 lg:pt-40 xl:col-span-6">
          <div className="mx-auto max-w-lg lg:mx-0">
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
        <div className="relative h-96 sm:h-[32rem] md:h-[36rem] lg:col-span-5 lg:h-auto lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
          {/* Single image for small screens */}
          <div className="relative w-full h-full md:hidden">
            <Image
              alt="Person demonstrating mobility exercise"
              src="/images/mobility2.JPG"
              fill
              quality={100}
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Two images for medium screens and up */}
          <div className="hidden md:grid md:grid-rows-2 h-full">
            {/* Top Image */}
            <div className="relative w-full h-full">
              <Image
                alt="Person demonstrating mobility exercise - upper body"
                src="/images/mobility3.JPG"
                fill
                quality={100}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Bottom Image */}
            <div className="relative w-full h-full">
              <Image
                alt="Person demonstrating mobility exercise - lower body"
                src="/images/mobility2.JPG"
                fill
                quality={100}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
