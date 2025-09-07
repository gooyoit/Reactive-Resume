import { CircleNotch } from "@phosphor-icons/react";

export const HydrateFallback = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <CircleNotch size={32} className="animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
};
