import Image from "next/image";
import SignupForm from "./SignupForm";

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
              Saturday, March 22nd from 10:00 - 11:00
              AM
            </p>
            <p className="text-pretty text-lg/8 text-gray-500">
              Sixth House Wellness Studio
            </p>
            <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Hi 👋, I'm Shaun and I'm excited to invite students of all levels to experience a fun, fast-paced flow designed to energize your weekend! 
              Whether you're a beginner or an experienced yogi, this session will help you connect with your body and breath in a supportive environment.
            </p>
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Reserve Your Spot
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Join us for an invigorating Saturday morning practice. Limited spots available!
              </p>
              <SignupForm />
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
