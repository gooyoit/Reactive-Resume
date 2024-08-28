import { Medal } from "@phosphor-icons/react";
import { VipCategoryDto } from "@reactive-resume/dto";
import { ContextMenu, ContextMenuTrigger } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";

import { BaseCard } from "./base-card";

type Props = {
  vipCategory: VipCategoryDto;
  isSelected: boolean;
  onChoose: () => void;
};

export const CategoryCard = ({ vipCategory, isSelected, onChoose }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseCard
          className={`space-y-1 ${isSelected ? "border-2 border-gray-400" : "border border-gray-300"}`}
          onClick={onChoose}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm"
            >
              <Medal
                size={42}
                className="absolute"
                style={{ width: 24, height: 24, top: 0, left: 0, margin: 8 }}
              />
            </motion.div>
          </AnimatePresence>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
              "bg-gradient-to-t from-background/80 to-transparent",
            )}
          >
            <h4 className="line-clamp-2 font-medium">{vipCategory.name}</h4>
            <p className="line-clamp-1 text-xs opacity-75">{vipCategory.tag}</p>
            <p className="line-clamp-1 text-xs line-through opacity-75">
              原价:¥{vipCategory.price}
            </p>
            <p className="line-clamp-1 text-xs opacity-75">现价:¥{vipCategory.realPrice}</p>
            <p className="truncate text-xs opacity-75 hover:overflow-visible hover:text-clip hover:whitespace-normal">
              {vipCategory.descs}
            </p>
          </div>
        </BaseCard>
      </ContextMenuTrigger>
    </ContextMenu>
  );
};
