import { t } from "@lingui/macro";
import { useEffect } from "react";

import { toast } from "./use-toast";

export const usePrintBlocker = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 拦截 Ctrl+P (Windows/Linux) 和 Cmd+P (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        event.stopPropagation();

        toast({
          variant: "error",
          title: t`Print function disabled`,
          description: t`Please use the PDF download feature in the application`,
        });
      }
    };

    const handleBeforePrint = (event: Event) => {
      event.preventDefault();

      toast({
        variant: "error",
        title: t`Print function disabled`,
        description: t`Please use the PDF download feature in the application`,
      });
    };

    const handleContextMenu = (event: MouseEvent) => {
      // 检查是否在右键菜单中点击了打印
      const target = event.target as HTMLElement;
      if (target.textContent?.toLowerCase().includes("print")) {
        event.preventDefault();
      }
    };

    // 添加事件监听器
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("contextmenu", handleContextMenu, true);

    // 重写 window.print 方法
    const originalPrint = window.print;
    window.print = () => {
      toast({
        variant: "error",
        title: t`Print function disabled`,
        description: t`Please use the PDF download feature in the application`,
      });
    };

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("contextmenu", handleContextMenu, true);

      // 恢复原始的 print 方法
      window.print = originalPrint;
    };
  }, []);
};
