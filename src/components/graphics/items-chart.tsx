import { useMemo } from "react";
import { Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ItemAnalytic } from "@/types";
import { getRandomHexColor, toTitleCase } from "@/utils";

interface ItemsChartProps {
  data: ItemAnalytic[];
  className?: string;
}

export function ItemsChart(props: ItemsChartProps) {
  const { data } = props;

  const bartenders = useMemo(() => {
    return data.map((e) => e.bartender);
  }, [data]);

  const bartenderColors = useMemo(() => {
    return bartenders.map(() => getRandomHexColor());
  }, [bartenders]);

  const chartData = useMemo(() => {
    const groupedItems: Record<string, Record<string, number>> = {};
    for (const analytic of data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bartender, total, totalSold, ...rest } = analytic;

      for (const itemName in rest) {
        if (!(itemName in groupedItems)) {
          groupedItems[itemName] = {
            [bartender]: 0,
          };
        }

        if (!(bartender in groupedItems[itemName])) {
          groupedItems[itemName][bartender] = 0;
        }

        groupedItems[itemName][bartender] =
          groupedItems[itemName][bartender] + Number(rest[itemName]);
      }
    }

    return Object.keys(groupedItems).map((item) => ({
      item: toTitleCase(item) || "",
      ...groupedItems[item],
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const data of chartData) {
      const { item } = data;
      config[item] = {
        label: toTitleCase(item),
        color: getRandomHexColor(),
      };
    }

    return config;
  }, [chartData]);

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle>Menu Totals</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey={"item"}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const item = payload.at(0)?.payload?.item;
                    return item || "Item";
                  }}
                />
              }
            />
            {Object.keys(chartData.at(0) || {}).flatMap((key, i) => {
              if (key === "item") {
                return [];
              }

              return (
                <Line
                  key={key}
                  dataKey={key}
                  stroke={bartenderColors[i] || getRandomHexColor()}
                  type="monotone"
                  strokeWidth={2}
                  dot
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
