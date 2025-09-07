import { t, Trans } from "@lingui/macro";
import { CircleNotch, FilePdf, LockKey } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button } from "@reactive-resume/ui";
import { pageSizeMap } from "@reactive-resume/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import type { LoaderFunction } from "react-router";
import { redirect, useLoaderData } from "react-router";

import { Icon } from "@/client/components/icon";
import { SharePaymentDialog } from "@/client/components/share-payment-dialog";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { queryClient } from "@/client/libs/query-client";
import { usePrintResume } from "@/client/services/resume";
import { checkShareAccess, getSharedResume } from "@/client/services/share";

const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const SharedResumePage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { printResume, loading } = usePrintResume();

  const loaderData = useLoaderData();

  // 先处理正常情况下的数据解构，错误情况下设为默认值
  const isError = "error" in loaderData && loaderData.error;
  const { id, title, data: resume, _shareData: share } = isError ? {} : loaderData;
  const format = resume?.metadata?.page?.format as keyof typeof pageSizeMap;

  // 所有 Hooks 必须无条件调用
  const { data: accessInfo, refetch: refetchAccess } = useQuery({
    queryKey: ["shareAccess", share?.shareToken],
    queryFn: () => checkShareAccess(share.shareToken),
    enabled: !isError && !!share?.shareToken,
    retry: false,
  });

  const updateResumeInFrame = useCallback(() => {
    if (!resume) return;
    const message = { type: "SET_RESUME", payload: resume };

    setImmediate(() => {
      frameRef.current?.contentWindow?.postMessage(message, "*");
    });
  }, [resume]);

  useEffect(() => {
    if (!frameRef.current || !resume) return;
    frameRef.current.addEventListener("load", updateResumeInFrame);
    return () => frameRef.current?.removeEventListener("load", updateResumeInFrame);
  }, [updateResumeInFrame, resume]);

  useEffect(() => {
    if (!frameRef.current?.contentWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (!frameRef.current?.contentWindow) return;
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "PAGE_LOADED") {
        frameRef.current.width = event.data.payload.width;
        frameRef.current.height = event.data.payload.height;
        // 获取页面数量
        setPageCount(event.data.payload.pageCount || 1);
        frameRef.current.contentWindow.removeEventListener("message", handleMessage);
      }
    };

    frameRef.current.contentWindow.addEventListener("message", handleMessage);

    return () => {
      frameRef.current?.contentWindow?.removeEventListener("message", handleMessage);
    };
  }, []);

  const onDownloadPdf = async () => {
    if (!id) return;
    // 检查是否有下载权限
    if (!accessInfo?.hasAccess) {
      // 没有权限，弹出支付弹窗
      setShowPaymentDialog(true);
      return;
    }

    // 有权限，直接下载
    const { url } = await printResume({ id });
    openInNewTab(url);
  };

  const handlePaymentSuccess = () => {
    void refetchAccess();
  };

  const showBlurOverlay = pageCount > 1 && !accessInfo?.hasAccess;

  // 在所有 Hooks 调用之后再做条件渲染
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="size-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            <Trans>分享链接不存在或已过期</Trans>
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            <Trans>
              很抱歉，您访问的分享链接不存在或已过期。请确认链接是否正确，或联系分享者获取新的链接。
            </Trans>
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              <Trans>返回首页</Trans>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.reload();
              }}
            >
              <Trans>重新加载</Trans>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有有效的数据，显示加载状态
  if (!resume || !share) {
    // eslint-disable-next-line lingui/no-unlocalized-strings
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Helmet>
        <title>
          {title} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div
        style={{ width: `${pageSizeMap[format].width}mm` }}
        className="relative z-50 overflow-hidden rounded shadow-xl sm:mx-auto sm:mb-6 sm:mt-16 print:m-0 print:shadow-none"
      >
        <iframe
          ref={frameRef}
          title={title}
          src="/artboard/preview"
          style={{ width: `${pageSizeMap[format].width}mm`, overflow: "hidden" }}
        />

        {/* 多页内容模糊遮罩 */}
        {showBlurOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
              <LockKey size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold">
                <Trans>多页内容需要付费访问</Trans>
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                <Trans>该简历有 {pageCount} 页，需要付费才能查看完整内容</Trans>
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  setShowPaymentDialog(true);
                }}
              >
                <Trans>解锁完整内容</Trans>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden justify-center py-10 opacity-50 sm:flex print:hidden">
        <div className="flex items-center gap-2">
          <Icon size={12} />
          <span className="text-xs">{t`Shared via Reactive Resume`}</span>
          <span className="text-xs">({pageCount} 页)</span>
          {pageCount > 1 && !accessInfo?.hasAccess && (
            <span className="text-xs text-red-500">
              - <Trans>需要付费访问多页内容</Trans>
            </span>
          )}
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-0 hidden sm:block print:hidden">
        <div className="flex flex-col items-center gap-y-2">
          <Button size="icon" variant="ghost" onClick={onDownloadPdf}>
            {loading ? <CircleNotch size={20} className="animate-spin" /> : <FilePdf size={20} />}
          </Button>

          <ThemeSwitch />
        </div>
      </div>

      {/* 支付弹窗 */}
      <SharePaymentDialog
        open={showPaymentDialog}
        shareToken={share.shareToken}
        paymentType="viewer"
        onOpenChange={setShowPaymentDialog}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export const sharedLoader: LoaderFunction<ResumeDto> = async ({ params }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shareToken = params.shareToken!;

    const data = await queryClient.fetchQuery({
      queryKey: ["shared", shareToken],
      queryFn: () => getSharedResume(shareToken),
      staleTime: 0,
      gcTime: 0,
    });

    // 从分享数据中提取简历信息，保持和公开页面一致的数据结构
    return {
      id: data.resume.id,
      title: data.resume.title,
      data: data.resume.data,
      // 将share信息也传递给组件使用
      _shareData: data.share,
    };
  } catch (error) {
    // axios 拦截器会将错误转换为 Error 对象，消息内容包含服务器返回的错误信息
    const errorMessage = (error as Error).message;

    // 检查错误消息中是否包含404相关内容
    if (
      errorMessage.includes("分享链接不存在或已过期") ||
      errorMessage.includes("Not Found") ||
      errorMessage.includes("404")
    ) {
      // 返回错误状态而不是重定向
      return {
        error: true,
        statusCode: 404,
        message: "分享链接不存在或已过期",
      };
    }

    // 其他错误仍然重定向到首页
    return redirect("/");
  }
};
