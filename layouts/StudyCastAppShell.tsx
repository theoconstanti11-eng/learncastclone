import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StudyCastAppShellProps {
  children: ReactNode;
  className?: string;
  withAurora?: boolean;
}

export const StudyCastAppShell = ({
  children,
  className,
  withAurora = true,
}: StudyCastAppShellProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#B8A5E0] via-[#9B8FD0] to-[#7E73C0] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,139,219,0.45),transparent_60%)]" />
      {withAurora && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute bottom-[-5rem] right-6 h-80 w-80 rounded-full bg-indigo-300/40 blur-[140px]" />
          <div className="absolute left-[-4rem] top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-200/30 blur-[130px]" />
        </div>
      )}
      <div className={cn("relative z-10 flex min-h-screen flex-col", className)}>{children}</div>
    </div>
  );
};

export default StudyCastAppShell;
