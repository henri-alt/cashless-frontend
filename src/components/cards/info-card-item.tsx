export interface CardItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
}

export function EventInfoCardItem(props: CardItemProps) {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0 max-w-[60%]">
          <div
            className="ml-3 w-full"
            title={typeof props.title === "string" ? props.title : undefined}
          >
            {props.icon ? props.icon : null}
            <p className="font-medium text-gray-900 truncate dark:text-white w-full text-ellipsis">
              {props.title}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
          {props.value}
        </div>
      </div>
    </li>
  );
}
