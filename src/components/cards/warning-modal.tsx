import { Fragment, ReactNode } from "react";

import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  warningTitle?: ReactNode;
  warningContent?: ReactNode;
  headerTitle?: string;
  onConfirm: () => void;
  bodyClassName?: string;
};

export function WarningModal(props: Props) {
  const {
    open,
    onClose,
    warningContent,
    warningTitle,
    headerTitle,
    bodyClassName,
    onConfirm,
  } = props;

  function confirmFunction() {
    onConfirm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="font-[600]">
          {headerTitle || "Warning"}
        </DialogHeader>
        <section className={cn("", bodyClassName)}>
          {warningTitle ? (
            <p className="font-semibold">{warningTitle}</p>
          ) : null}
          {warningContent ? (
            <Fragment>
              <p className={warningTitle ? "mt-8" : ""}>{warningContent}</p>
            </Fragment>
          ) : null}
        </section>
        <DialogFooter className="gap-4 md:gap-0">
          <Button variant={"destructive"} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirmFunction}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
