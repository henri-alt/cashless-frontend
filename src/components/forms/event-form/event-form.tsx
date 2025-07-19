import { useState, useRef, useEffect } from "react";
import { EventType, CurrencyType } from "@/types";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { EventModalGeneralInfo } from "@/components/forms/event-form/event-modal-info";
import { EventCurrenciesInfo } from "@/components/forms/event-form/event-currencies-info";
import { TabNavigationComponent } from "@/components/forms/event-form/event-form-tabs";
import { useEventsApi, useCurrenciesApi } from "@/services/api";

const emptyEvent: Partial<EventType> = {
  cardPrice: undefined,
  company: undefined,
  eventDescription: undefined,
  eventId: undefined,
  eventName: undefined,
  eventStatus: "inactive",
  startDate: undefined,
  tagPrice: undefined,
  ticketPrice: undefined,
};

const formSteps = {
  info: EventModalGeneralInfo,
  currencies: EventCurrenciesInfo,
};

const emptyCurrency: CurrencyType = {
  rate: 0,
  eventId: "",
  currency: "",
  marketRate: 0,
  company: "",
  currencyId: "",
  quickPrices: [0, 0, 0, 0],
  isDefault: false,
};

interface EventFormProps {
  open: boolean;
  onCancel: () => void;
  event?: EventType;
  currencies?: CurrencyType[];
}

type InfoRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getEvent: () => Partial<EventType>;
  getCurrencies: () => CurrencyType[];
};

export function EventForm(props: EventFormProps) {
  const [step, setStep] = useState<keyof typeof formSteps>("info");
  const [event, setEvent] = useState(props.event || emptyEvent);
  const [currencies, setCurrencies] = useState(
    props.currencies || [emptyCurrency]
  );
  const [eventId, setEventId] = useState(props.event?.eventId || "");

  const { create, edit } = useEventsApi();
  const { update: postCurrencies } = useCurrenciesApi({
    eventId,
  });

  const stepRef = useRef<InfoRefHandle>(null);
  const postCurrenciesRef = useRef<CurrencyType[]>([...currencies]);

  useEffect(() => {
    if (!props.event) {
      setEvent({ ...emptyEvent });
      return;
    }

    setEvent({ ...props.event });
    setEventId(props.event?.eventId || "");
  }, [props.event]);

  useEffect(() => {
    if (!props.currencies) {
      setCurrencies([emptyCurrency]);
      return;
    }

    setCurrencies(props.currencies);
  }, [props.currencies]);

  const FormStep = formSteps[step];

  function changeEventData() {
    if (stepRef.current && typeof stepRef.current.getEvent === "function") {
      const newEventValues = stepRef.current.getEvent();
      setEvent((prev) => ({
        ...prev,
        ...newEventValues,
      }));
    }
  }

  function changeCurrenciesData() {
    if (
      stepRef.current &&
      typeof stepRef.current.getCurrencies === "function"
    ) {
      const newCurrencies = stepRef.current.getCurrencies();
      setCurrencies(newCurrencies);
    }
  }

  function validateStep(): boolean {
    if (!stepRef.current) {
      return false;
    }

    const stepValid = stepRef.current.isValid();
    stepRef.current.trigger();

    return stepValid;
  }

  async function onSubmit() {
    if (!validateStep() || !stepRef.current) {
      return;
    }

    if (step === "info") {
      changeEventData();
      setStep("currencies");
    } else {
      changeCurrenciesData();
      const normalizedEvent = {} as EventType;

      normalizedEvent.eventId = eventId;
      normalizedEvent.eventName = event.eventName || "";
      normalizedEvent.cardPrice = Number(event.cardPrice);
      normalizedEvent.ticketPrice = Number(event.ticketPrice);
      normalizedEvent.tagPrice = Number(event.tagPrice);
      normalizedEvent.activationMinimum = Number(event.activationMinimum);
      normalizedEvent.startDate = event.startDate || new Date().toISOString();
      normalizedEvent.eventDescription = event.eventDescription || "";

      const normalizedCurrencies: CurrencyType[] = [];
      const formCurrencies = stepRef.current.getCurrencies();

      for (let index = 0; index < formCurrencies.length; index++) {
        const currency = formCurrencies[index];
        normalizedCurrencies.push({
          company: event.company || "",
          currency: currency.currency,
          currencyId: !props.event?.eventId
            ? ""
            : props.currencies?.at(index)?.currencyId || "",
          eventId,
          isDefault: !index,
          marketRate: Number(currency.marketRate),
          quickPrices: currency.quickPrices
            .map((e) => Number(e))
            .filter(Boolean),
          rate: Number(currency.rate),
        });
      }

      postCurrenciesRef.current = [...normalizedCurrencies];

      if (props.event?.eventId) {
        await edit.mutateAsync(normalizedEvent).then(async () => {
          return await postCurrencies.mutateAsync({
            currencies: normalizedCurrencies,
          });
        });
      } else {
        await create.mutateAsync(normalizedEvent).then(async (res) => {
          setEventId(res.eventId);

          return await postCurrencies.mutateAsync({
            currencies: normalizedCurrencies,
            eventId: res.eventId,
          });
        });
      }
      props.onCancel();
    }
  }

  function closeDialog() {
    setStep("info");
    props.onCancel();
  }

  return (
    <Dialog open={props.open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.event ? "Edit" : "Crete"} event form</DialogTitle>
        </DialogHeader>
        <TabNavigationComponent
          value={step}
          tabList={[
            {
              value: "info",
              children: "Event Information",
              onClick() {
                if (step === "info") return;

                if (validateStep()) {
                  changeCurrenciesData();
                  setStep("info");
                }
              },
            },
            {
              value: "currencies",
              children: "Event Currencies",
              onClick() {
                if (step === "currencies") return;

                if (validateStep()) {
                  changeEventData();
                  setStep("currencies");
                }
              },
            },
          ]}
        />
        <FormStep
          event={event}
          currencies={currencies}
          onSubmit={onSubmit}
          ref={stepRef}
        />
      </DialogContent>
    </Dialog>
  );
}
