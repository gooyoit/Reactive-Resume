import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { ArrowRight, WechatLogo } from "@phosphor-icons/react";
import { loginSchema } from "@reactive-resume/dto";
import { usePasswordToggle } from "@reactive-resume/hooks";
import {
  Alert,
  AlertTitle,
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import type { z } from "zod";

import { WechatQR } from "@/client/components/wechat-qr";
import { axios } from "@/client/libs/axios";
import { useLogin } from "@/client/services/auth";
import { useFeatureFlags } from "@/client/services/feature";

type FormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, loading } = useLogin();
  const { flags } = useFeatureFlags();

  const formRef = useRef<HTMLFormElement>(null);
  usePasswordToggle(formRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data);
    } catch {
      form.reset();
    }
  };

  // Fetch WeChat public config from backend
  const { data: wechatConfig } = useQuery({
    queryKey: ["wechat-config"],
    queryFn: async () => {
      const res = await axios.get<{ appId: string; redirectUri: string }>("/auth/wechat/config");
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      <Helmet>
        <title>
          {t`Sign in to your account`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">{t`Sign in to your account`}</h2>
        <h6>
          <span className="opacity-75">{t`Don't have an account?`}</span>
          <Button asChild variant="link" className="px-1.5">
            <Link to="/auth/register">
              {t({ message: "Create one now", context: "This is a link to create a new account" })}{" "}
              <ArrowRight className="ml-1" />
            </Link>
          </Button>
        </h6>
      </div>

      <div className="relative">
        <Separator className="my-2" />
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <WechatLogo className="size-4" />
            {t`QR Code Login`}
          </TabsTrigger>
          <TabsTrigger value="account">{t`Account & Password`}</TabsTrigger>
        </TabsList>

        <TabsContent value="qr">
          <div className="mt-6 flex justify-center">
            {wechatConfig && (
              <WechatQR
                appId={wechatConfig.appId}
                redirectUri={wechatConfig.redirectUri}
                onError={(error) => {
                  // eslint-disable-next-line no-console
                  console.error("WeChat QR error:", error);
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div
            className={cn(
              "mt-6",
              flags.isEmailAuthDisabled && "pointer-events-none select-none blur-sm",
            )}
          >
            {flags.isEmailAuthDisabled && (
              <Alert variant="error">
                <AlertTitle>
                  {t`Signing in via email is currently disabled by the administrator.`}
                </AlertTitle>
              </Alert>
            )}

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
                        <Input
                          autoComplete="email"
                          className="lowercase"
                          placeholder="john.doe@example.com"
                          {...field}
                        />
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
                        <Input type="password" autoComplete="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        <Trans>
                          Hold <code className="text-xs font-bold">Ctrl</code> to display your
                          password temporarily.
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
