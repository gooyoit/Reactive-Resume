import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { loginSchema } from "@reactive-resume/dto";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useLogin } from "@/client/services/auth";
import { useAuthProviders } from "@/client/services/auth/providers";
type FormValues = z.infer<typeof loginSchema>;

export const LocalAuth = () => {
  const { login, loading } = useLogin();

  const formRef = useRef<HTMLFormElement>(null);
  const { providers } = useAuthProviders();
  const emailAuthDisabled = !providers?.includes("email");
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data);
    } catch (error) {
      form.reset();
    }
  };
  return (
    <div className={cn(emailAuthDisabled && "hidden")}>
      <Form {...form}>
        <form
          ref={formRef}
          className="flex flex-col gap-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name="identifier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Email`}</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormDescription>{t`You can also enter your username.`}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Password`}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  <Trans>
                    Hold <code className="text-xs font-bold">Ctrl</code> to display your password
                    temporarily.
                  </Trans>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 flex items-center gap-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {t`Sign in`}
            </Button>
            <Button asChild variant="link" className="px-4">
              <Link to="/auth/forgot-password">{t`Forgot Password?`}</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
