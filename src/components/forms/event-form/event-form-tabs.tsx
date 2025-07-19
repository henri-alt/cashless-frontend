import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsTriggerProps, TabsProps } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export type TabNavigationProps = TabsProps & {
  tabList: TabsTriggerProps[];
  tabListClass?: string;
};

export function TabNavigationComponent(props: TabNavigationProps) {
  const { tabList, tabListClass, ...rest } = props;

  return (
    <Tabs {...rest}>
      <TabsList
        className={cn(
          "grid w-full max-w-[100vw] overflow-x-auto",
          tabListClass
        )}
        style={
          tabListClass
            ? undefined
            : {
                gridTemplateColumns: `repeat(${
                  tabList?.length || 1
                }, minmax(0, 1fr))`,
              }
        }
      >
        {tabList?.length
          ? tabList.map((tab, i) => {
              return (
                <TabsTrigger key={i} {...tab}>
                  {tab.children}
                </TabsTrigger>
              );
            })
          : null}
      </TabsList>
    </Tabs>
  );
}
