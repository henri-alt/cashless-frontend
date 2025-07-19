import { cn } from "@/lib/utils";

interface ChartTotalProps {
  title: React.ReactNode;
  total: React.ReactNode;
  className?: string;
  titleClassName?: string;
  totalClassName?: string;
}

export function ChartTotal(props: ChartTotalProps) {
  return (
    <section
      className={cn(
        "flex flex-col justify-center items-start h-full",
        props.className
      )}
    >
      <span
        className={cn(
          "text-base font-normal text-muted-foreground",
          props.titleClassName
        )}
      >
        {props.title}
      </span>
      <span
        className={cn(
          "text-2xl font-semibold leading-none text-gray-900 sm:text-3xl dark:text-white",
          props.totalClassName
        )}
      >
        {props.total}
      </span>
    </section>
  );
}
