import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectComponent } from "@/components/ui/select-component";
import useStore from "@/store";

const inputFields = {
  input: Input,
  select: SelectComponent,
  datePicker: DatePicker,
};

interface InputProps {
  defaultValue?:
    | (((string | number | readonly string[]) & Date) & string & string[])
    | undefined;
  options?: Option[];
  onChange?: (value: string | unknown) => void;
  className?: string;
  type?: string;
}

type Option = { label: string; value: string; key?: string | number };

type FieldTypes = keyof typeof inputFields;

type BaseFieldOptions = {
  label: string;
  name: string;
  fieldType: FieldTypes;
  placeholder?: string;
};

export interface FieldOptions extends BaseFieldOptions, InputProps {}

export interface ViewFilterProps {
  onFilter?: (filters: unknown) => void;
  onClearFilter?: () => void;
  fields: FieldOptions[];
  filterId: string;
}

export function ViewFilter(props: ViewFilterProps) {
  const { filters, setFilter, removeFilter } = useStore();

  const [open, setOpen] = useState(false);

  const form = useForm();

  useEffect(() => {
    if (!open) return;

    if (!filters?.[props.filterId]) {
      for (const field of props.fields) {
        form.setValue(field.name, undefined);
      }
    } else {
      for (const field of props.fields) {
        form.setValue(field.name, filters[props.filterId][field.name]);
      }
    }
  }, [open, form, props.fields, filters, props.filterId]);

  function onSubmit(values: Record<string, unknown>) {
    setOpen(false);
    setFilter(props.filterId, values);
    setTimeout(() => {
      if (props.onFilter) {
        props.onFilter(values);
      }
    }, 50);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(op) => {
        if (!op) {
          setOpen(op);
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setOpen(true);
        }}
      >
        <Button>Filter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-8 max-w-3xl mx-auto pt-10 w-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {props.fields.map((fld) => {
              return (
                <FormField
                  key={fld.name}
                  control={form.control}
                  name={fld.name}
                  render={({ field }) => {
                    const Comp = inputFields[fld.fieldType];

                    return (
                      <FormItem>
                        <FormLabel>{fld.label}</FormLabel>
                        <FormControl>
                          <Comp {...{ ...field, ...fld }} />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              );
            })}
            <DialogFooter>
              <Button
                type="button"
                variant={"destructive"}
                onClick={() => {
                  removeFilter(props.filterId);
                  setOpen(false);
                  setTimeout(() => {
                    if (props.onClearFilter) {
                      props.onClearFilter();
                    }
                  }, 50);
                }}
              >
                Clear Filters
              </Button>
              <Button type="submit">Apply Filter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
