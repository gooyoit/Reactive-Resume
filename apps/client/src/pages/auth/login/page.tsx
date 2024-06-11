import { t } from "@lingui/macro";
import { ArrowRight, User, WechatLogo } from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@reactive-resume/ui";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

// import { useLogin } from "@/client/services/auth";
// import { useAuthProviders } from "@/client/services/auth/providers";
import { LocalAuth } from "../_components/local-auth";
import { WechatQrcodeAuth } from "../_components/wechat-qrcode-auth";

type Layout = "wechat" | "local";
export const LoginPage = () => {
  // const { login, loading } = useLogin();
  const [layout, setLayout] = useState<Layout>("wechat");
  return (
    <div className="space-y-8">
      <Helmet>
        <title>
          {t`Sign in to your account`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">{t`Sign in to your account`}</h2>
        {/* <h6 className={cn(emailAuthDisabled && "hidden")}> */}
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
      <Card className="space-y-1">
        <CardContent className="space-y-4">
          <Tabs
            value={layout}
            className="space-y-4"
            onValueChange={(value) => {
              setLayout(value as Layout);
            }}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="wechat" className="size-32 p-0 sm:h-8 sm:w-auto sm:px-16">
                  <WechatLogo />
                  <span className="ml-2 hidden sm:block">{t`Wechat`}</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="size-32 p-0 sm:h-8 sm:w-auto sm:px-16">
                  <User />
                  <span className="ml-2 hidden sm:block">{t`Email1`}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="wechat">
              <WechatQrcodeAuth />
            </TabsContent>
            <TabsContent value="local">
              <LocalAuth />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
