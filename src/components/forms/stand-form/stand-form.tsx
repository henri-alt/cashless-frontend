import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TabNavigationComponent,
  TabNavigationProps,
} from "@/components/forms/event-form/event-form-tabs";
import { StandFormInfo } from "@/components/forms/stand-form/stand-form-info";
import { StandMembers } from "@/components/forms/stand-form/stand-members";
import { StandItems } from "@/components/forms/stand-form/stand-items";
import { StaffMember, StandConfigType } from "@/types";
import { useStandsApi } from "@/services/api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type StandFormProps = {
  open: boolean;
  onCancel: () => void;
  stand?: StandConfigType;
};

export type BaseStandInfo = Omit<StandConfigType, "menuItems" | "staffMembers">;

type ViewRef = {
  trigger: () => void;
  isValid: () => boolean;
  getStandInfo: () => BaseStandInfo;
  getMembers: () => string[];
  getItems: () => string[];
};

const emptyInformation: BaseStandInfo = {
  company: "",
  eventId: "",
  standName: "",
};

const standFormSteps = {
  info: StandFormInfo,
  staff: StandMembers,
  items: StandItems,
};

export function StandForm(props: StandFormProps) {
  const { eventId } = useParams();

  const { data: staff } = useQuery<StaffMember[]>({
    queryKey: ["staff", eventId],
  });
  const { create, edit } = useStandsApi({
    eventId: eventId!,
    standName: props.stand?.standName,
  });

  const [standInformation, setStandInformation] = useState<BaseStandInfo>(
    props.stand || emptyInformation
  );

  const [standType, setStandType] = useState<"Cashier" | "Bartender" | "Door">(
    !props.stand
      ? "Bartender"
      : props.stand?.menuItems?.length
      ? "Bartender"
      : staff?.length
      ? staff?.find((e) => e.memberId === props?.stand?.staffMembers.at(0))
          ?.userClass === 3
        ? "Door"
        : "Cashier"
      : "Cashier"
  );

  const [staffMembers, setStaffMembers] = useState<string[]>(
    props.stand?.staffMembers || []
  );
  const [menuItems, setMenuItems] = useState<string[]>(
    props.stand?.menuItems || []
  );

  const [step, setStep] = useState<keyof typeof standFormSteps>("info");
  const viewRef = useRef<ViewRef>(null);

  useEffect(() => {
    if (!props.stand) {
      return;
    }

    setStandInformation(props.stand);
    setStaffMembers(props.stand.staffMembers);
    setMenuItems(props.stand.menuItems);
  }, [props.stand]);

  const validateStep = useCallback(() => {
    if (!viewRef.current) {
      return false;
    }

    const stepValid = viewRef.current.isValid();
    viewRef.current.trigger();

    return stepValid;
  }, []);

  const changeStandInformation = useCallback(() => {
    if (viewRef.current && typeof viewRef.current.getStandInfo === "function") {
      const info = viewRef.current.getStandInfo();
      setStandInformation(info);
    }
  }, []);

  const changeStaff = useCallback(() => {
    if (viewRef.current && typeof viewRef.current.getMembers === "function") {
      const info = viewRef.current.getMembers();
      setStaffMembers(info);
    }
  }, []);

  const changeMenu = useCallback(() => {
    if (viewRef.current && typeof viewRef.current.getItems === "function") {
      const info = viewRef.current.getItems();
      setMenuItems(info);
    }
  }, []);

  const tabList = useMemo<TabNavigationProps["tabList"]>(() => {
    return [
      {
        value: "info",
        children: "Stand Information",
        onClick() {
          if (step === "info" || !validateStep()) return;

          if (step === "items") changeMenu();
          if (step === "staff") changeStaff();

          setStep("info");
        },
      },
      {
        value: "staff",
        children: "Stand Staff",
        onClick() {
          if (step === "staff" || !validateStep()) return;

          if (step === "info") changeStandInformation();
          if (step === "items") changeMenu();

          setStep("staff");
        },
      },
      {
        value: "items",
        children: "Stand Menu",
        onClick() {
          if (step === "items" || !validateStep()) return;

          if (step === "info") changeStandInformation();
          if (step === "staff") changeStaff();

          setStep("items");
        },
      },
    ].filter((e) => {
      if (standType !== "Bartender") {
        return e.value !== "items";
      }
      return true;
    });
  }, [
    standType,
    validateStep,
    step,
    changeStandInformation,
    changeStaff,
    changeMenu,
  ]);

  async function onSubmit(values: BaseStandInfo | string[]) {
    if (!validateStep()) {
      return;
    }

    let save = false;

    if (step === "info") {
      changeStandInformation();
      setStep("staff");
    } else if (step === "staff") {
      changeStaff();

      if (standType === "Bartender") {
        setStep("items");
      } else {
        save = true;
      }
    } else {
      save = true;
    }

    if (!save) return;

    const standInfo: StandConfigType = {
      ...standInformation,
      menuItems: [],
      staffMembers: [],
    };
    standInfo.menuItems =
      standType === "Cashier" || standType === "Door"
        ? []
        : (values as string[]);
    standInfo.staffMembers =
      standType === "Cashier" || standType === "Door"
        ? (values as string[])
        : staffMembers;

    if (props.stand) {
      await edit.mutateAsync(standInfo);
    } else {
      await create.mutateAsync(standInfo);
    }

    props.onCancel();
  }

  const Step = standFormSteps[step];

  return (
    <Dialog open={props.open} onOpenChange={props.onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stand Form</DialogTitle>
        </DialogHeader>
        <TabNavigationComponent tabList={tabList} value={step} />
        <Step
          ref={viewRef}
          onSubmit={onSubmit}
          standType={standType}
          menuItems={menuItems}
          staffMembers={staffMembers}
          standInformation={standInformation}
          proppedStandName={props.stand?.standName}
          onChangeStandType={(type) => {
            setStaffMembers([]);
            setMenuItems([]);
            setStandType(type);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
