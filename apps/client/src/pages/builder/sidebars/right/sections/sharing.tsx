import { t } from "@lingui/macro";
import { CopySimple, Plus, Trash } from "@phosphor-icons/react";
import { Button, Input, Label, Switch, Tooltip } from "@reactive-resume/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import { useToast } from "@/client/hooks/use-toast";
import { createShare, deactivateShare, getResumeShares } from "@/client/services/share";
import { useResumeStore } from "@/client/stores/resume";

import { SectionIcon } from "../shared/section-icon";

export const SharingSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setValue = useResumeStore((state) => state.setValue);
  const resumeId = useResumeStore((state) => state.resume.id);
  const isPublic = useResumeStore((state) => state.resume.visibility === "public");

  // 获取当前简历的分享链接列表
  const { data: shares = [] } = useQuery({
    queryKey: ["shares", resumeId],
    queryFn: () => getResumeShares(resumeId),
    enabled: isPublic && !!resumeId,
  });

  // 创建分享链接的 mutation
  const createShareMutation = useMutation({
    mutationFn: createShare,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shares", resumeId] });
      toast({
        variant: "success",
        title: t`Share link created successfully.`,
        description: t`A new share link has been generated for your resume.`,
      });
    },
    onError: () => {
      toast({
        variant: "error",
        title: t`Failed to create share link.`,
        description: t`Please try again later.`,
      });
    },
  });

  // 删除分享链接的 mutation
  const deleteShareMutation = useMutation({
    mutationFn: deactivateShare,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shares", resumeId] });
      toast({
        variant: "success",
        title: t`Share link deactivated.`,
        description: t`The share link has been deactivated.`,
      });
    },
    onError: () => {
      toast({
        variant: "error",
        title: t`Failed to deactivate share link.`,
        description: t`Please try again later.`,
      });
    },
  });

  const onCopyShare = async (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    await navigator.clipboard.writeText(shareUrl);

    toast({
      variant: "success",
      title: t`Share link copied to clipboard.`,
      description: t`This link allows controlled access with payment options.`,
    });
  };

  const onCreateShare = () => {
    createShareMutation.mutate({ resumeId });
  };

  const onDeleteShare = (shareId: string) => {
    deleteShareMutation.mutate(shareId);
  };

  return (
    <section id="sharing" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <SectionIcon id="sharing" size={18} name={t`Sharing`} />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`Sharing`}</h2>
        </div>
      </header>

      <main className="grid gap-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-x-4">
            <Switch
              id="visibility"
              checked={isPublic}
              onCheckedChange={(checked) => {
                setValue("visibility", checked ? "public" : "private");
              }}
            />
            <div>
              <Label htmlFor="visibility" className="space-y-1">
                <p>{t`Public`}</p>
                <p className="text-xs opacity-60">
                  {t`Anyone with the link can view and download the resume.`}
                </p>
              </Label>
            </div>
          </div>
        </div>

        <AnimatePresence presenceAffectsLayout>
          {isPublic && (
            <motion.div
              layout
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 分享链接管理 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t`Share Links (with payment control)`}</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={createShareMutation.isPending}
                    onClick={onCreateShare}
                  >
                    <Plus size={16} className="mr-1" />
                    {t`Generate New Link`}
                  </Button>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {shares.map((share) => (
                    <div key={share.id} className="flex items-center gap-x-1.5 rounded border p-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/shared/${share.shareToken}`}
                        className="flex-1 text-xs"
                      />
                      <Tooltip content={t`Copy Share Link`}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onCopyShare(share.shareToken)}
                        >
                          <CopySimple size={16} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t`Delete Share Link`}>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={deleteShareMutation.isPending}
                          onClick={() => {
                            onDeleteShare(share.id);
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  ))}

                  {shares.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-500">
                      {t`No share links created yet. Generate a new link to get started.`}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </section>
  );
};
