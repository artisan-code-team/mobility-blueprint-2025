import clsx from "clsx";

import { Button } from "./Button";
import { CheckIcon } from "./CheckIcon";
import { Container } from "./Container";
import { GridPattern } from "./GridPattern";
import { SectionHeading } from "./SectionHeading";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Plan({
  name,
  description,
  price,
  features,
  href,
  featured = false,
}: {
  name: string;
  description: string;
  price: string;
  features: Array<string>;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative px-4 py-16 sm:rounded-5xl sm:px-10 md:py-12 lg:px-12",
        featured && "bg-blue-900 sm:shadow-lg"
      )}
    >
      {featured && (
        <div className="absolute inset-0 text-white/10 [mask-image:linear-gradient(white,transparent)]">
          <GridPattern x="50%" y="50%" />
        </div>
      )}
      <div className="relative flex flex-col">
        <h3
          className={clsx(
            "mt-7 text-lg font-semibold tracking-tight",
            featured ? "text-white" : "text-slate-800"
          )}
        >
          {name}
        </h3>
        <p
          className={clsx(
            "mt-2 text-lg tracking-tight",
            featured ? "text-white" : "text-slate-800"
          )}
        >
          {description}
        </p>
        <p className="order-first flex font-display font-bold">
          <span
            className={clsx(
              "text-[1.75rem] leading-tight",
              featured ? "text-blue-200" : "text-slate-500"
            )}
          >
            $
          </span>
          <span
            className={clsx(
              "ml-1 mt-1 text-7xl tracking-tight",
              featured ? "text-white" : "text-slate-800"
            )}
          >
            {price}
          </span>
        </p>
        <div className="order-last mt-8">
          <ul
            role="list"
            className={clsx(
              "-my-2 divide-y text-base tracking-tight",
              featured
                ? "divide-white/10 text-white"
                : "divide-slate-200 text-slate-800"
            )}
          >
            {features.map((feature) => (
              <li key={feature} className="flex py-2">
                <CheckIcon
                  className={clsx(
                    "h-8 w-8 flex-none",
                    featured ? "fill-white" : "fill-slate-800"
                  )}
                />
                <span className="ml-4">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button
          href={href}
          color={featured ? "white" : "slate"}
          className="mt-8"
          aria-label={`Get started with the ${name} plan for $${price}`}
        >
          Get started
        </Button>
      </div>
    </div>
  );
}

export function SpiralLine() {
  const router = useRouter();

  const handlePracticeClick = () => {
    router.push("/coming-soon");
  };

  return (
    <section
      id="spiral-line"
      aria-labelledby="spiral-line-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-32"
    >
      <Container>
        <SectionHeading number="4" id="spiral-line-title">
          Spiral Line
        </SectionHeading>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          The Spiral Line (SL) is a complex myofascial meridian that winds its
          way around the body in a helical pattern. This line connects various
          muscles and fascia across the body, contributing to rotational
          movements and stability.{" "}
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          The Spiral Line functions in coordinating complex movements and
          maintaining balance. It plays a crucial role in distributing
          mechanical stress throughout the body during movement, especially in
          actions that involve twisting or rotational forces. The SL highlights
          how fascial and muscular structures are not just linear or segmented
          but are instead intricately interconnected, contributing to the
          body&apos;s dynamic stability and movement efficiency.
        </p>
        <Button
          color="blue"
          className="mt-8"
          onClick={handlePracticeClick}
        >
          Practice
        </Button>
      </Container>
    </section>
  );
}
