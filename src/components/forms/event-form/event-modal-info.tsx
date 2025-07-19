import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { EventType } from "@/types";

const formSchema = z.object({
  eventName: z.string().min(1, "This field is required"),
  startDate: z.coerce.date(),
  eventDescription: z.string().optional(),
  activationMinimum: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
  tagPrice: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
  ticketPrice: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
  cardPrice: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
});

interface EventModalGeneralInfoProps {
  event?: Partial<EventType>;
  onSubmit: (partialValues: Partial<EventType>) => void;
}

type InfoRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getEvent: () => Partial<EventType>;
};

export const EventModalGeneralInfo = forwardRef(function EventModalGeneralInfo(
  props: EventModalGeneralInfoProps,
  ref: React.ForwardedRef<InfoRefHandle>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
    },
  });

  useEffect(() => {
    if (!props.event) {
      return;
    }

    const event = props.event;
    if (event.startDate) {
      const date = new Date(event.startDate);
      form.setValue("startDate", date);
    }

    if (event.eventName) {
      form.setValue("eventName", event.eventName);
    }
    if (event.eventDescription) {
      form.setValue("eventDescription", event.eventDescription);
    }

    if (!isNaN(Number(event.tagPrice))) {
      form.setValue("tagPrice", `${event?.tagPrice}` as unknown as number);
    }

    if (!isNaN(Number(event.cardPrice))) {
      form.setValue("cardPrice", `${event?.cardPrice}` as unknown as number);
    }

    if (!isNaN(Number(event.activationMinimum))) {
      form.setValue(
        "activationMinimum",
        `${event?.activationMinimum}` as unknown as number
      );
    }

    if (!isNaN(Number(event.ticketPrice))) {
      form.setValue(
        "ticketPrice",
        `${event?.ticketPrice}` as unknown as number
      );
    }
  }, [props.event, form]);

  const getValues = useCallback((values: z.infer<typeof formSchema>) => {
    const { startDate, ...rest } = values;

    const newEventValues: Partial<EventType> = { ...rest };
    newEventValues["startDate"] = startDate.toISOString();

    return newEventValues;
  }, []);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const newEventValues = getValues(values);
      props.onSubmit(newEventValues);
    },
    [props, getValues]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        isValid() {
          return form.formState.isValid;
        },
        trigger() {
          return form.trigger();
        },
        getEvent() {
          return getValues(form.getValues());
        },
      };
    },
    [form, getValues]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto pt-5 pb-10 px-1 w-full max-h-[500px] overflow-y-auto h-[98vh]"
      >
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Event name..." type="text" {...field} />
              </FormControl>
              <FormDescription>Event name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Event Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Event start date</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activationMinimum"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activation Minimum</FormLabel>
              <FormControl>
                <Input
                  placeholder="Activation minimum..."
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The minimum required amount to create a balance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NFC Card Price</FormLabel>
              <FormControl>
                <Input placeholder="NFC price..." type="number" {...field} />
              </FormControl>
              <FormDescription>The price of an NFC card reader</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ticketPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR Price</FormLabel>
              <FormControl>
                <Input placeholder="QR price..." type="number" {...field} />
              </FormControl>
              <FormDescription>The price of a QR ticket</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Card Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="Client card price..."
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The price of a client't fidelity card
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Event description (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end px-4">
          <Button type="submit">Next Step</Button>
        </div>
      </form>
    </Form>
  );
});
