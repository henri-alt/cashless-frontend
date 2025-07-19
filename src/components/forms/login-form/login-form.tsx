import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthenticationApi } from "@/services/api";

const formSchema = z.object({
  memberEmail: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, "This field is required"),
  memberPassword: z.string().min(1, "This field is required"),
});

export function LoginForm() {
  const { login } = useAuthenticationApi();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberEmail: "",
      memberPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    login.mutate(values);
  }

  return (
    <Card className="flex flex-col items-center justify-center px-4 h-[381px] w-full md:w-[600px] lg:h-[349px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Login to your account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[300px] max-w-[calc(100%_-_2.5rem)] flex items-center justify-center mx-auto"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="memberEmail"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="memberEmail">Username</FormLabel>
                    <FormControl>
                      <Input
                        id="memberEmail"
                        placeholder="Username..."
                        type="email"
                        autoComplete="memberEmail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <FormLabel htmlFor="memberPassword">Password</FormLabel>
                    </div>
                    <FormControl>
                      <PasswordInput
                        id="memberPassword"
                        placeholder="******"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
