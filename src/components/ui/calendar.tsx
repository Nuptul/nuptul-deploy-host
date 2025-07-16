import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import styles from "@/components/dashboard/dashboard.module.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const calendarStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
    backdropFilter: 'blur(25px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
  };

  return (
    <div style={calendarStyle} className={`${styles.liquidGlassCard}`}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:scale-105",
          "bg-gradient-to-br from-white/30 to-white/20 hover:from-white/40 hover:to-white/30",
          "backdrop-blur-md border border-white/30 hover:border-white/50",
          "text-black/70 hover:text-black/90",
          "shadow-sm hover:shadow-md"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "rounded-md w-10 font-normal text-[0.8rem] text-black/60",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 text-black/80",
          "rounded-lg transition-all duration-200 hover:scale-105",
          "hover:bg-gradient-to-br hover:from-white/40 hover:to-white/30",
          "hover:backdrop-blur-md hover:border hover:border-white/40",
          "hover:shadow-md"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-wedding-gold/30 to-wedding-gold/20 text-wedding-navy hover:from-wedding-gold/40 hover:to-wedding-gold/30 focus:from-wedding-gold/40 focus:to-wedding-gold/30 backdrop-blur-md border border-wedding-gold/40 shadow-md",
        day_today: "bg-gradient-to-br from-blue-100/50 to-blue-50/30 text-blue-800 backdrop-blur-md border border-blue-200/40",
        day_outside:
          "day-outside text-black/30 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-black/30 opacity-50",
        day_range_middle:
          "aria-selected:bg-gradient-to-br aria-selected:from-wedding-gold/20 aria-selected:to-wedding-gold/10 aria-selected:text-wedding-navy",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
