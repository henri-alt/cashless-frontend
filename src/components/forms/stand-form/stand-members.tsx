import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { StaffMember, StandConfigType } from "@/types";

type StandMembersProps = {
  standType: "Cashier" | "Bartender" | "Door";
  staffMembers: string[];
  onSubmit: (values: string[]) => void;
  proppedStandName: string | undefined;
};

type MembersRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getMembers: () => string[];
};

const formSchema = z.object({
  search: z.string(),
});

export const StandMembers = forwardRef(function StandMembers(
  props: StandMembersProps,
  ref: React.ForwardedRef<MembersRefHandle>
) {
  const { eventId } = useParams();

  const [selectedStaff, setSelectedStaff] = useState<string[]>(
    props.staffMembers
  );
  const [search, setSearch] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { toast } = useToast();

  const { data } = useQuery<StaffMember[]>({
    queryKey: ["staff", eventId],
  });
  const { data: stands } = useQuery<StandConfigType[]>({
    queryKey: ["stands", eventId],
  });

  const eligibleStaff = useMemo(() => {
    if (!data || !stands) return [];

    const standMap = new Set(
      stands.flatMap((e) => {
        if (e.standName === props.proppedStandName) {
          return [];
        }

        return e.staffMembers;
      })
    );

    return data.filter((e) => {
      switch (props.standType) {
        case "Cashier":
          if (e.userClass !== 2) return false;
          break;
        case "Bartender":
          if (e.userClass !== 1) return false;
          break;
        case "Door":
          if (e.userClass !== 3) return false;
          break;
      }

      if (standMap.has(e.memberId)) {
        return false;
      }

      return true;
    });
  }, [props.standType, data, stands, props.proppedStandName]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getMembers() {
          return selectedStaff;
        },
        isValid() {
          return selectedStaff.length > 0;
        },
        trigger() {
          if (!selectedStaff.length) {
            toast({
              variant: "destructive",
              description: "Please select at least one staff member",
              title: "Staff selection error",
            });
          }
        },
      };
    },
    [selectedStaff, toast]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSubmit(selectedStaff);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-8 max-w-3xl mx-auto pt-5 pb-10 px-1 w-full max-h-[500px] overflow-y-auto h-[98vh]"
      >
        <FormField
          control={form.control}
          name="search"
          rules={{
            onChange(event) {
              setSearch(event?.target?.value || "");
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search</FormLabel>
              <FormControl>
                <Input placeholder="Search staff..." type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {eligibleStaff?.length ? (
          <Button
            type="button"
            onClick={() => {
              setSelectedStaff(eligibleStaff.map((e) => e.memberId));
            }}
          >
            Select All
          </Button>
        ) : null}
        {eligibleStaff.flatMap((e) => {
          if (search && !e.memberName.toLocaleLowerCase().includes(search)) {
            return [];
          }

          return (
            <FormField
              name=""
              key={e.memberId}
              render={() => {
                const checked = selectedStaff.includes(e.memberId);

                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          if (checked) {
                            setSelectedStaff((prev) =>
                              prev.filter((item) => item !== e.memberId)
                            );
                          } else {
                            setSelectedStaff((prev) => [...prev, e.memberId]);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{e.memberName}</FormLabel>
                    </div>
                  </FormItem>
                );
              }}
            />
          );
        })}
        {!eligibleStaff.length ? (
          <span className="text-base font-semibold w-full block text-center !mb-10">
            No staff available to add to this stand
          </span>
        ) : null}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
});
