import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaffMember } from "@/types";
import { useStaffApi } from "@/services/api";

const createSchema = z.object({
  memberName: z.string().min(1, "This field is required"),
  memberEmail: z.string().min(1, "This field is required"),
  memberPassword: z.string().min(1, "This field is required"),
  userClass: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
});

const editSchema = z.object({
  memberName: z.string().min(1, "This field is required"),
  memberEmail: z.string().min(1, "This field is required"),
  memberPassword: z.string().optional(),
  userClass: z
    .string()
    .min(1, "This field is required")
    .transform((e) => (!e ? 0 : +e)),
});

type FetchedMember = Omit<StaffMember, "memberPassword">;

type StaffFormProps = {
  open: boolean;
  onCancel: () => void;
  member?: FetchedMember;
};

export function StaffForm(props: StaffFormProps) {
  const { eventId } = useParams();

  const schema = props.member ? editSchema : createSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { create, edit } = useStaffApi({
    eventId: eventId!,
    memberId: props.member?.memberId,
  });

  useEffect(() => {
    if (!props.member) {
      return;
    }

    form.setValue("memberName", props.member.memberName);
    form.setValue("memberEmail", props.member.memberEmail);
    form.setValue(
      "userClass",
      String(props.member.userClass) as unknown as number
    );
  }, [props.member, form]);

  async function onSubmit(values: z.infer<typeof schema>) {
    const { userClass, ...rest } = values;
    const updateBody = { ...rest, userClass: Number(userClass) };

    if (props.member) {
      await edit.mutateAsync({ ...updateBody });
    } else {
      await create.mutateAsync({
        ...updateBody,
        eventId: eventId,
        memberPassword: updateBody.memberPassword!,
        profileStatus: "active",
      });
    }

    props.onCancel();
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staff Form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto pt-5 pb-10 px-1 w-full max-h-[500px] overflow-y-auto h-[98vh]"
          >
            <FormField
              control={form.control}
              name="memberName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name..." type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username..." type="text" {...field} />
                  </FormControl>
                  <FormDescription>The login username</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="*****" {...field} />
                  </FormControl>
                  {props.member ? (
                    <FormDescription>
                      Leave empty to keep the old password
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="User role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Bartender</SelectItem>
                      <SelectItem value="2">Cashier</SelectItem>
                      <SelectItem value="3">Door</SelectItem>
                    </SelectContent>
                  </Select>

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
