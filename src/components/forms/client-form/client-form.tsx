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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientType } from "@/types";
import { useEffect } from "react";
import { useClientsApi } from "@/services/api";

const formSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().min(1),
});

interface ClientFormProps {
  open: boolean;
  onCancel: () => void;
  client: ClientType;
}

export function ClientForm(props: ClientFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { edit } = useClientsApi();

  useEffect(() => {
    if (!props.client) return;

    form.setValue("clientName", props.client.clientName);
    form.setValue("clientEmail", props.client.clientEmail);
  }, [props.client, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    form.trigger();
    if (!form.formState.isValid) {
      return;
    }

    edit
      .mutateAsync({ ...values, clientId: props.client.clientId })
      .finally(() => {
        props.onCancel();
      });
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto py-10"
          >
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Client Name..."
                      type="text"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email..." type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
