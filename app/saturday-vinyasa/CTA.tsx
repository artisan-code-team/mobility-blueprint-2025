import Image from "next/image";
// import SignupForm from "./SignupForm";

export default function CTA() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
        <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-48 lg:pt-40 xl:col-span-6">
          <div className="mx-auto max-w-lg lg:mx-0">
            <h1 className="mt-6 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:mt-10 sm:text-7xl">
              Energize Your Saturday!
            </h1>
            <p className="mt-6 text-pretty text-lg/8 text-gray-500">
              Saturday, May 24th from 8:30 - 9:30
              AM
            </p>
            <p className="text-pretty text-lg/8 text-gray-500">
              Sixth House Wellness Studio
            </p>
            <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Hi 👋, I&apos;m Shaun and I&apos;m excited to invite students of all levels to experience a fun, fast-paced flow designed to energize your weekend! 
              Whether you&apos;re a beginner or an experienced yogi, this session will help you connect with your body and breath in a supportive environment.
            </p>
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Reserve Your Spot
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Join us for an invigorating Saturday morning practice. Limited spots available!
              </p>
              {/* <SignupForm /> */}
              <a
                href="https://sixthhouse.as.me/schedule/4c83c091/appointment/78110175/calendar/12123754/datetime/2025-05-24T08%3A30%3A00-05%3A00?template=class"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full rounded-md bg-blue-900 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
        <div className="relative h-96 sm:h-[32rem] md:h-[36rem] lg:col-span-5 lg:h-auto lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
          <div className="relative w-full h-full">
            <Image
              alt="Person demonstrating mobility exercise"
              src="/images/mobility3.JPG"
              fill
              quality={80}
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
