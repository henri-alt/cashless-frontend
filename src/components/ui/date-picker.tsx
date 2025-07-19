import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar, CalendarProps } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps extends Omit<CalendarProps, "mode" | "selected"> {
  onChange?: (date: Date | undefined) => void;
  defaultValue?: Date;
}

export function DatePicker(props: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(props?.defaultValue);

  return (
    <div className={cn("w-full", props?.className || "")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(e) => {
              setDate(e);
              if (props?.onChange && typeof props?.onChange === "function") {
                props?.onChange(e);
              }
            }}
            initialFocus
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
