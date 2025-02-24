"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { GridPattern } from "./GridPattern";
import clsx from "clsx";
import { CheckIcon } from "./CheckIcon";

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

export function BackLine() {
  const router = useRouter();

  const handlePracticeClick = () => {
    router.push("/sign-in");
  };

  return (
    <section
      id="back-line"
      aria-labelledby="back-line-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-32"
    >
      <Container>
        <SectionHeading number="4" id="back-line-title">
          Back Line
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-800">
          Back line
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          The Superficial Back Line (SBL) is a continuous line of connective
          tissue that runs from the bottom of the foot up through the body to
          the top of the head. This line includes several interconnected fascial
          structures and muscles, spanning across various parts of the body.
          They are essential for maintaining an upright posture and moving the
          spine.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          The Back Line is significant for its role in posture and movement. It
          demonstrates how seemingly separate parts of the body are
          interconnected through fascia and muscles, contributing to our overall
          structural integrity and function.
        </p>
        <Button className="mt-8" color="blue" onClick={handlePracticeClick}>
          Practice
        </Button>
      </Container>
    </section>
  );
}

export default function Page() {
  return (
    <div>
      <BackLine />
    </div>
  );
}
