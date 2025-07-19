import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import { ItemConfig } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMenuItemsApi } from "@/services/api";

const formSchema = z.object({
  itemName: z.string().min(1, "This field is required"),
  itemCategory: z.string().min(1, "This field is required"),
  bonusAvailable: z.boolean().default(true),
  itemPrice: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
  staffPrice: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
  itemTax: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
});

type MenuItemFormProps = {
  open: boolean;
  onCancel: () => void;
  item?: ItemConfig;
};

export function MenuItemForm(props: MenuItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { eventId } = useParams();

  const { create, edit } = useMenuItemsApi({
    eventId: eventId!,
  });

  useEffect(() => {
    if (!props.item) {
      return;
    }

    form.setValue("bonusAvailable", props.item.bonusAvailable || false);
    form.setValue("itemName", props.item.itemName);
    form.setValue("itemCategory", props.item.itemCategory);
    form.setValue("itemPrice", `${props.item.itemPrice}` as unknown as number);
    form.setValue("itemTax", `${props.item.itemTax}` as unknown as number);
    form.setValue(
      "staffPrice",
      `${props.item.staffPrice}` as unknown as number
    );
  }, [form, props.item]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    form.trigger();
    if (!form.formState.isValid) {
      return;
    }

    if (props.item) {
      await edit.mutateAsync({
        itemName: props.item.itemName,
        updateBody: values,
      });
    } else {
      await create.mutateAsync([{ ...values, clientsSold: 0 }]);
    }

    props.onCancel();
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.item ? "Edit" : "Create"} Menu Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto py-10"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-9">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Item name..."
                          type="text"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-3 content-end">
                <FormField
                  control={form.control}
                  name="bonusAvailable"
                  defaultValue={true}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bonus</FormLabel>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="itemCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Item category..."
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Items of the same category will be grouped in the
                    bartender's view
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="itemPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price..."
                          type="number"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="staffPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Staff price..."
                          type="number"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="itemTax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax</FormLabel>
                      <FormControl>
                        <Input placeholder="Tax..." type="number" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
