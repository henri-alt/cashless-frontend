import { useState, forwardRef, useImperativeHandle } from "react";
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
import { ItemConfig } from "@/types";

type StandItemsProps = {
  menuItems: string[];
  onSubmit: (values: string[]) => void;
};

type ItemsRefHandle = {
  trigger: () => void;
  isValid: () => boolean;
  getItems: () => string[];
};

const formSchema = z.object({
  search: z.string(),
});

export const StandItems = forwardRef(function StandItems(
  props: StandItemsProps,
  ref: React.ForwardedRef<ItemsRefHandle>
) {
  const { eventId } = useParams();

  const [selectedItems, setSelectedItems] = useState<string[]>(props.menuItems);
  const [search, setSearch] = useState<string>("");

  const { data } = useQuery<ItemConfig[]>({
    queryKey: ["menu", eventId],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { toast } = useToast();

  useImperativeHandle(
    ref,
    () => {
      return {
        getItems() {
          return selectedItems;
        },
        isValid() {
          return selectedItems.length > 0;
        },
        trigger() {
          if (!selectedItems.length) {
            toast({
              variant: "destructive",
              description: "Please select at least one menu item",
              title: "Menu selection error",
            });
          }
        },
      };
    },
    [selectedItems, toast]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSubmit(selectedItems);
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
                <Input placeholder="Search items..." type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {data?.length ? (
          <Button
            type="button"
            onClick={() => {
              setSelectedItems(data.map((e) => e.itemName));
            }}
          >
            Select All
          </Button>
        ) : null}
        {(data || []).flatMap((e) => {
          if (search && !e.itemName.toLocaleLowerCase().includes(search)) {
            return [];
          }

          return (
            <FormField
              name=""
              key={e.itemName}
              render={() => {
                const checked = selectedItems.includes(e.itemName);

                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          if (checked) {
                            setSelectedItems((prev) =>
                              prev.filter((item) => item !== e.itemName)
                            );
                          } else {
                            setSelectedItems((prev) => [...prev, e.itemName]);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{e.itemName}</FormLabel>
                    </div>
                  </FormItem>
                );
              }}
            />
          );
        })}
        {!data?.length ? (
          <span className="text-base font-semibold w-full block text-center !mb-10">
            No menu items available to add to this stand
          </span>
        ) : null}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
});
