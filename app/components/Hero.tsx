import Image from 'next/image'
import coverImage from '@/public/images/cover.jpg'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { StarRating } from './StarRating'
// import { useSession } from 'next-auth/react'  // Commented out temporarily

function Testimonial() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <div className="flex justify-center text-blue-900 lg:justify-start">
        <StarRating />
      </div>
      <blockquote className="mt-2">
        <p className="font-display text-xl font-medium text-slate-800">
          &ldquo;This class literally changed my life. I used to pay for rehab all
          summer each year until I found this class. This summer I was able to
          use Dynamic Mobility instead.&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-slate-500">
        <strong className="font-semibold text-blue-900 before:content-['—_']">
          Tanya
        </strong>
        , School Teacher
      </figcaption>
    </figure>
  )
}

export function Hero() {
  const router = useRouter()
  // const { status } = useSession()  // Commented out temporarily

  const handlePracticeOnline = () => {
    router.push('/coming-soon')
    // Temporary solution - commenting out original functionality
    // if (status === 'authenticated') {
    //   router.push('/dashboard')
    // } else {
    //   router.push('/sign-in')
    // }
  }

  return (
    <header className="overflow-hidden bg-slate-100 lg:bg-transparent lg:px-5">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pb-36 lg:pt-20 xl:py-32">
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="relative z-10 mx-auto flex w-64 rounded-xl bg-blue-900 shadow-xl md:w-80 lg:w-auto">
            <Image className="w-full rounded-xl" src={coverImage} alt="" priority />
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pb-14 lg:pl-16 lg:pr-0 xl:pl-20">
          <div className="hidden lg:absolute lg:-top-32 lg:bottom-0 lg:left-[-100vw] lg:right-[-100vw] lg:block lg:bg-slate-100" />
          <Testimonial />
        </div>
        <div className="bg-white pt-16 lg:col-span-7 lg:bg-transparent lg:pl-16 lg:pt-0 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-5xl font-extrabold text-slate-800 sm:text-6xl">
              Mobility Blueprint
            </h1>
            <p className="mt-4 text-3xl text-slate-800">
              Your blueprint for better movement
            </p>
            <div className="mt-8 flex gap-4">
              <Button color="blue" onClick={handlePracticeOnline}>
                Practice online
              </Button>
              <Button
                color="blue"
                variant="outline"
                href="/in-person"
              >
                Practice in person
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
