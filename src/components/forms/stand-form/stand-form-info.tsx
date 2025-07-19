import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseStandInfo } from "@/components/forms/stand-form/stand-form";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandConfigType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  standName: z.string().min(1, "This field is required"),
  standType: z.string().min(1, "This field is required").default("Bartender"),
});

type StandFormInfoProps = {
  standInformation: BaseStandInfo;
  standType: "Cashier" | "Bartender" | "Door";
  onChangeStandType: (type: "Cashier" | "Bartender" | "Door") => void;
  onSubmit: (values: BaseStandInfo) => void;
  proppedStandName?: string;
};

type InfoRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getStandInfo: () => BaseStandInfo;
};

export const StandFormInfo = forwardRef(function StandFormInfo(
  props: StandFormInfoProps,
  ref: React.ForwardedRef<InfoRefHandle>
) {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const eventStands = queryClient.getQueryData<StandConfigType[]>([
    "stands",
    eventId,
  ]);

  useEffect(() => {
    if (!props.standInformation) {
      return;
    }

    form.setValue("standName", props.standInformation.standName);
  }, [props.standInformation, form]);

  useEffect(() => {
    form.setValue("standType", props.standType);
  }, [props.standType, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.onSubmit({
      ...props.standInformation,
      ...values,
    });
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        getStandInfo() {
          const newStandName = form.getValues("standName");

          return {
            ...props.standInformation,
            standName: newStandName,
          };
        },
        isValid() {
          let lowerStandName: string = "";

          if (props.proppedStandName) {
            lowerStandName = props.proppedStandName.toLocaleLowerCase();
          }

          const standNames = new Set(
            (eventStands || []).flatMap((e) =>
              e.standName.toLocaleLowerCase() === lowerStandName
                ? []
                : e.standName.toLocaleLowerCase()
            )
          );

          const newStandName = form.getValues("standName")?.toLocaleLowerCase();

          if (standNames.has(newStandName)) {
            toast({
              variant: "destructive",
              title: "Stand name error",
              description:
                "A stand with this name already exists, please choose another name before continuing",
            });

            return false;
          }

          return form.formState.isValid;
        },
        trigger() {
          form.trigger();
        },
      };
    },
    [props.standInformation, form, eventStands, props.proppedStandName, toast]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto pt-5 pb-10 px-1 w-full max-h-[500px] overflow-y-auto h-[98vh]"
      >
        <FormField
          control={form.control}
          name="standName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stand name</FormLabel>
              <FormControl>
                <Input placeholder="Stand name..." type="" {...field} />
              </FormControl>
              <FormDescription>
                The name of the stand (needs to be unique)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff</FormLabel>
              <Select
                onValueChange={(e: "Cashier" | "Bartender" | "Door") => {
                  props.onChangeStandType(e);
                  return field.onChange(e);
                }}
                defaultValue={props.standType}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Staff..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cashier">Cashier</SelectItem>
                  <SelectItem value="Bartender">Bartender</SelectItem>
                  <SelectItem value="Door">Door</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of staff the stand contains
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
});
