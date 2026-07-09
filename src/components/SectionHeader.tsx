import React from "react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
  themeColor?: "blue" | "rose" | "amber" | "emerald" | "violet" | "slate";
  isDarkBg?: boolean;
}

export default function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
  right,
  themeColor = "blue",
  isDarkBg = false,
}: SectionHeaderProps) {
  const bgClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/30",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/30",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100/30 dark:border-violet-900/30",
    slate: "bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-150/30 dark:border-slate-800/30",
  }[themeColor];

  const textClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    slate: "text-slate-600 dark:text-slate-450",
  }[themeColor];

  return (
    <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isDarkBg ? "bg-white/10 text-white border border-white/10" : bgClasses} shadow-sm`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className={`text-[13px] font-semibold leading-snug mt-0.5 ${isDarkBg ? "text-white" : "text-slate-900 dark:text-white"}`}>
            {title}
          </h3>
          {description && (
            <p className={`mt-1 max-w-2xl text-[11px] font-light leading-relaxed ${isDarkBg ? "text-slate-300/90" : "text-slate-500 dark:text-slate-400"}`}>
              {description}
            </p>
          )}
        </div>
      </div>
      {right && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {right}
        </div>
      )}
    </div>
  );
}
