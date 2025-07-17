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
              Each Saturday from 8:30 - 9:30 AM
            </p>
            <p className="text-pretty text-lg/8 text-gray-500">
              <a 
                href="https://www.google.com/maps/place/sixth+house+studio/data=!4m2!3m1!1s0x87d2bbf4c231ffd5:0x50e74da8ea14b16d?sa=X&ved=1t:242&ictx=111"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Sixth House Wellness Studio
              </a>
            </p>
            <p className="mt-6 text-pretty text-lg/8 text-gray-500">
              Hi 👋, I&apos;m Shaun and I&apos;m excited to welcome you to unite your inner landscape with your outer experience, and ignite the transformative power of this practice.
            </p>
            <p className="mt-8 text-pretty text-lg/8 text-gray-500">
              Each week, we delve into a rich tapestry of Vinyasa yoga that weaves precise anatomical understanding with ancient philosophical wisdom. Our classes are designed to awaken your body&apos;s intrinsic intelligence, cultivating both physical mastery (sthira) and graceful ease (sukha). We explore the subtle energetic pathways within, connecting body, breath, and mind to foster deeper self-understanding and authentic expression.
            </p>
            
            <div className="mt-8 space-y-6">
              <div>
                <p className="mt-2 text-pretty text-lg/8 text-gray-500">In the spirit of aparigraha—non-possessiveness and radical accessibility—we offer our classes on a &apos;Pay What You Can&apos; model. Your presence is the most valuable contribution. Choose the contribution that resonates with your heart and circumstances directly when you book your spot.</p>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">SECURE YOUR SPOT</h2>

              <p className="mt-2 text-sm text-gray-500">Space is limited to ensure a quality experience for every practitioner.</p>

              <a href="https://www.sixthhousestudio.com/offerings/saturday-morning-vinyasa-97260f98-6c11-4b70-8dd4-52bac70122f9" target="_blank" rel="noopener noreferrer" className="mt-6 block w-full rounded-md bg-blue-900 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Secure Your Spot</a>
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
