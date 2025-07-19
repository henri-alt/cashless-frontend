import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type CardItemProps,
  EventInfoCardItem,
} from "@/components/cards/info-card-item";
import { DialogTitle } from "@radix-ui/react-dialog";

export interface ListModalProps {
  title: string;
  footer?: React.ReactNode;
  list: CardItemProps[];
  open: boolean;
  onCancel: () => void;
}

export function ListModal(props: ListModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>

        <section className="h-full max-h-[60dvh] overflow-y-auto">
          <ul
            role="list"
            className="divide-y divide-gray-200 dark:divide-gray-700 h-fit"
          >
            {props.list.map(({ title, value, icon }, i) => (
              <EventInfoCardItem
                key={`${title}-${i}`}
                title={title}
                value={value}
                icon={icon}
              />
            ))}
          </ul>
        </section>

        {props.footer ? <DialogFooter>{props.footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
