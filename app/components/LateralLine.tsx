import { Container } from "./Container";
// import { Expandable, ExpandableButton, ExpandableItems } from "./Expandable";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

// Seed data for unused tool below
// const tableOfContents = {
//   'Getting started': {
//     'Getting started': 1,
//     'Intro to Figma': 15,
//     'Setting up your first artboard': 20,
//   },
//   Fundamentals: {
//     'Strokes and fills': 21,
//     'End points': 22,
//     'Bezier curves': 26,
//     'Designing on a grid': 31,
//     'Vector shapes': 45,
//   },
//   'Boolean operations': {
//     'Combining shapes': 50,
//     'Subtracting shapes': 57,
//     'Intersecting shapes': 66,
//     Flattening: 78,
//   },
//   'Optimizing for production': {
//     'Preparing for SVG': 82,
//     'Configuring your export settings': 88,
//     'Minifying and removing metadata': 95,
//   },
// }

export function LateralLines() {
  const router = useRouter();

  const handlePracticeClick = () => {
    router.push("/sign-in");
  };

  return (
    <section
      id="lateral-lines"
      aria-labelledby="lateral-lines-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="1" id="lateral-lines-title">
          Root
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-800">
          Lateral lines
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          In the context of the lateral line myofascial meridian, the term
          &quot;meridian&quot; refers to a continuous pathway of connective
          tissue, or fascia, that links together various muscles, tendons, and
          other structures in the body. The &quot;lateral line&quot;
          specifically refers to a pathway that runs along the side of the body.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          The lateral line myofascial meridian encompasses a series of
          interconnected muscles and fascial connections that contribute to
          various aspects of movement and stability. It extends from the side of
          the head, down the neck and trunk, along the outer hip and thigh, and
          even down to the outer side of the leg and foot. This pathway plays a
          key role in lateral flexion (sideways bending) and stabilization of
          the body.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-800">
          By understanding and working with the lateral line myofascial
          meridian, practitioners can address patterns of tension, restriction,
          and dysfunction that may be affecting movement and posture.
        </p>
        <Button className="mt-8" color="blue" onClick={handlePracticeClick}>
          Practice
        </Button>

        {/* Template: unused tool */}
        {/* <Expandable>
          <ol role="list" className="mt-16 space-y-10 sm:space-y-16">
            <ExpandableItems>
              {Object.entries(tableOfContents).map(([title, pages]) => (
                <li key={title}>
                  <h3 className="font-display text-3xl font-bold tracking-tight text-slate-800">
                    {title}
                  </h3>
                  <ol
                    role="list"
                    className="mt-8 divide-y divide-slate-300/30 rounded-2xl bg-slate-50 px-6 py-3 text-base tracking-tight sm:px-8 sm:py-7"
                  >
                    {Object.entries(pages).map(([title, pageNumber]) => (
                      <li
                        key={title}
                        className="flex justify-between py-3"
                        aria-label={`${title} on page ${pageNumber}`}
                      >
                        <span
                          className="font-medium text-slate-800"
                          aria-hidden="true"
                        >
                          {title}
                        </span>
                        <span
                          className="font-mono text-slate-400"
                          aria-hidden="true"
                        >
                          {pageNumber}
                        </span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ExpandableItems>
          </ol>
          <ExpandableButton>See more</ExpandableButton>
        </Expandable> */}
      </Container>
    </section>
  );
}
