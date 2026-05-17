"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";

interface MonthYearPickerProps {
  month?: number;
  year?: number;
  onChange: (month?: number, year?: number) => void;
  className?: string;
}

export function MonthYearPicker({
  month,
  year,
  onChange,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(year || new Date().getFullYear());

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = setMonth(new Date(), i);
    return {
      value: i + 1,
      label: format(date, "MMMM", { locale: ptBR }),
    };
  });

  const handleYearChange = (offset: number) => {
    setCurrentYear((prev) => prev + offset);
  };

  const handleMonthSelect = (m: number) => {
    onChange(m, currentYear);
    setOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (!month || !year) return "Selecionar";
    const date = setYear(setMonth(new Date(), month - 1), year);
    return format(date, "MMM/yyyy", { locale: ptBR });
  }, [month, year]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal capitalize",
              !month && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleYearChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{currentYear}</div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentYear >= thisYear}
              onClick={() => handleYearChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => {
              const isFuture = currentYear > thisYear || (currentYear === thisYear && m.value > thisMonth);
              return (
                <Button
                  key={m.value}
                  variant={month === m.value && year === currentYear ? "default" : "ghost"}
                  className="h-9 px-2 text-xs capitalize"
                  disabled={isFuture}
                  onClick={() => handleMonthSelect(m.value)}
                >
                  {m.label.substring(0, 3)}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
