import { SelectProps as BaseProps } from "@radix-ui/react-select";
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string; key?: string | number };

interface SelectProps extends BaseProps {
  options?: Option[];
  className?: string;
  placeholder?: string;
  onChange?(value: string): void;
}

export function SelectComponent(props: SelectProps) {
  return (
    <Select
      onValueChange={(value) => {
        if (props?.onChange) {
          props?.onChange(value);
        }
        if (props?.onValueChange) {
          props?.onValueChange(value);
        }
      }}
      {...props}
    >
      <FormControl>
        <SelectTrigger className={cn("w-full", props?.className)}>
          <SelectValue placeholder={props.placeholder || ""} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectGroup>
          {props?.options?.length
            ? props.options.map((opt, key) => {
                return (
                  <SelectItem
                    value={`${opt.value}`}
                    key={`${opt?.value}` + key}
                  >
                    {opt?.label}
                  </SelectItem>
                );
              })
            : null}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
