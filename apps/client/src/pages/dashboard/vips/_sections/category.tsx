import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useVipCategories } from "@/client/services/vip";

import { BaseCard } from "./../_components/base-card";
import { CategoryCard } from "./../_components/category-card";

export const VipCategory = () => {
  const { vipCategories, loading } = useVipCategories();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseCard />
          </div>
        ))}

      {vipCategories && (
        <AnimatePresence>
          {vipCategories.map((vipCategory, index) => (
            <motion.div
              key={vipCategory.id}
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, transition: { delay: (index + 2) * 0.1 } }}
              exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
            >
              <CategoryCard
                vipCategory={vipCategory}
                isSelected={selectedCardId === vipCategory.id}
                onChoose={() => {
                  setSelectedCardId(vipCategory.id);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};
