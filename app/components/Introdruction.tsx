import { CheckIcon } from "./CheckIcon";
import { Container } from "./Container";

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32"
    >
      <Container className="text-lg tracking-tight text-slate-800">
        <p className="font-display text-4xl font-bold tracking-tight text-slate-800">
          Myofascial Meridians
        </p>
        <p className="mt-4">
          The &apos;fibrous net&apos; in the human body is one of 3 full body
          systems. Alongside the cardio-vascular, & nervous system, this
          connective layer includes all the tissues investing and attaching the
          collagen in bones, cartilage, tendons, ligaments, & superficial layer
          just below the skin. Conditioning into this system promotes better
          connectivity for improved movement and even immunity to illness.
        </p>
        <p className="mt-4">
          Mobility Blueprint is a Yoga inspired practice that takes you through
          8 sections for a full body workout within one hour.
        </p>
        <ul role="list" className="mt-8 space-y-3">
          {[
            "Fascial Conditioning",
            "Joint Mobility",
            "Lower Body Strength",
            "Upper Body Strength",
            "Cardio Peak",
            "Fascial Sequencing Through Vinyasa",
            "Core Focus",
            "Fascial Recovery ",
          ].map((feature) => (
            <li key={feature} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-blue-500" />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          This unique workout program is designed to give you the strength and
          flexibility to be free from joint and fascial pain allowing you to be
          more dynamic in any activity you choose to take part in. By sequencing
          our Myofascial Meridians we can define geography and geometry within
          the body&apos;s mobile tensegrity. These patterns of movement can be
          broken down into five directions.
        </p>
        {/* OPTIONAL LINK */}
        {/* <p className="mt-10">
          <Link
            href="#free-chapters"
            className="text-base font-medium text-blue-900 hover:text-blue-800"
          >
            Get two free chapters straight to your inbox{' '}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p> */}
      </Container>
    </section>
  );
}
