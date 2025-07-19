import { forwardRef, useImperativeHandle, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFieldArray } from "react-hook-form";
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
import { XIcon } from "lucide-react";
import { CurrencyType } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type InfoRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getCurrencies: () => CurrencyType[];
};

const formSchema = z.object({
  currencies: z.array(
    z.object({
      currency: z.string().min(1, "This field is required"),
      isDefault: z.boolean().default(false),
      rate: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
      marketRate: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
      action1: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
      action2: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
      action3: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
      action4: z
        .string()
        .min(1, "This field is required")
        .transform((e) => (!e ? 0 : +e)),
    })
  ),
});

const emptyCurrency = {
  rate: 0,
  eventId: "",
  currency: "",
  marketRate: 0,
  action1: 0,
  action2: 0,
  action3: 0,
  action4: 0,
  isDefault: false,
};

interface EventCurrenciesInfoProps {
  currencies?: CurrencyType[];
  onSubmit: (currencies: CurrencyType[]) => unknown;
}

type ActionNames = `action1` | `action2` | `action3` | `action4`;

export const EventCurrenciesInfo = forwardRef(function EventCurrenciesInfo(
  props: EventCurrenciesInfoProps,
  ref: React.ForwardedRef<InfoRefHandle>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "currencies",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!props.currencies) {
      return;
    }

    const formCurrencies = [];
    for (let index = 0; index < props.currencies.length; index++) {
      const e = props.currencies[index];
      const currencyBody = {
        currency: e.currency,
        rate: String(e.rate) as unknown as number,
        marketRate: String(e.marketRate) as unknown as number,
        action1: 0,
        action2: 0,
        action3: 0,
        action4: 0,
        isDefault: !index,
      };

      for (let j = 0; j < e.quickPrices.length; j++) {
        const price = String(e.quickPrices[j]) as unknown as number;
        currencyBody[`action${j + 1}` as ActionNames] = price;
      }

      formCurrencies.push(currencyBody);
    }

    form.setValue("currencies", formCurrencies);
  }, [props.currencies, form]);

  const getValues = useCallback((values: z.infer<typeof formSchema>) => {
    const submitCurrencies: CurrencyType[] = [];
    const currencies = values.currencies;

    for (let index = 0; index < currencies.length; index++) {
      const currency = currencies[index];

      submitCurrencies.push({
        currency: currency.currency!,
        rate: currency.rate,
        marketRate: currency.marketRate,
        quickPrices: [
          currency.action1,
          currency.action2,
          currency.action3,
          currency.action4,
        ],
        company: "",
        currencyId: "",
        eventId: "",
        isDefault: !index,
      });
    }

    return submitCurrencies;
  }, []);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const submitCurrencies = getValues(values);
      props.onSubmit(submitCurrencies);
    },
    [props, getValues]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        isValid() {
          const selectedCurrencies = form.getValues();
          const namesSet = new Set(
            selectedCurrencies.currencies.map((e) => e.currency)
          );

          if (namesSet.size < selectedCurrencies.currencies.length) {
            toast({
              variant: "destructive",
              title: "Duplicate currency error",
              description:
                "Cannot proceed, there are two currencies with the same name",
            });

            return false;
          }

          return form.formState.isValid;
        },
        trigger() {
          return form.trigger();
        },
        getCurrencies() {
          return getValues(form.getValues());
        },
      };
    },
    [form, getValues, toast]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto pt-5 pb-10 px-1 w-full max-h-[500px] overflow-y-auto h-[98vh]"
      >
        {fields.map((field, index) => {
          return (
            <Card key={field.id} className="relative">
              <CardHeader>
                {!index
                  ? "Default Currency"
                  : field?.currency || `Currency ${index + 1}`}
                {index ? (
                  <XIcon
                    width={15}
                    height={15}
                    className="cursor-pointer absolute top-3 right-3"
                    onClick={() => {
                      remove(index);
                    }}
                  />
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.currency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {!index ? "Default " : ""}Currency
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Currency..."
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This is the currency name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Rate</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Event rate..."
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.marketRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Rate</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Market rate..."
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.action1`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action 1</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Action 1"
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.action2`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action 2</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Action 2..."
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.action3`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action 3</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Action 3"
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.action4`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action 4</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Action 4..."
                              type="number"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <div className="flex flex-col gap-[10px]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              append(emptyCurrency);
            }}
          >
            Add Currency
          </Button>

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
});
