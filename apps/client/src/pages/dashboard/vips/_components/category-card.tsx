import { t } from "@lingui/macro";
import { Lock } from "@phosphor-icons/react";
import { VipCategoryDto } from "@reactive-resume/dto";
import { ContextMenu, ContextMenuTrigger } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { BaseCard } from "./base-card";

type Props = {
  vipCategory: VipCategoryDto;
};

export const CategoryCard = ({ vipCategory }: Props) => {
  const navigate = useNavigate();

  const onChoose = () => {
    navigate(`/builder/${vipCategory.id}`);
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseCard className="space-y-0" onClick={onChoose}>
          <AnimatePresence>
            {
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm"
              >
                <Lock size={42} />
              </motion.div>
            }
          </AnimatePresence>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
              "bg-gradient-to-t from-background/80 to-transparent",
            )}
          >
            <h4 className="line-clamp-2 font-medium">{vipCategory.text}</h4>
            <p className="line-clamp-1 text-xs opacity-75">{t`Last updated {vipCategory.price}`}</p>
          </div>
        </BaseCard>
      </ContextMenuTrigger>
    </ContextMenu>
  );
};
