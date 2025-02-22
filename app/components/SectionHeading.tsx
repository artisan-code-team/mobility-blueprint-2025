import clsx from "clsx";

export function SectionHeading({
  number,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2"> & { number?: string }) {
  return (
    <h2
      className={clsx(
        className,
        "inline-flex items-center rounded-full px-4 py-1 text-blue-900 ring-1 ring-inset ring-blue-900"
      )}
      {...props}
    >
      <span className="font-mono text-sm" aria-hidden="true">
        {number?.padStart(2, "0")}
      </span>
      {number && <span className="ml-3 h-3.5 w-px bg-blue-900/20" />}
      <span
        className={clsx("text-base font-medium tracking-tight", {
          "ml-3": number,
        })}
      >
        {children}
      </span>
    </h2>
  );
}
