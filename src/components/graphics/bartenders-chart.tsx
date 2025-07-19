import { useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BartenderAnalytic } from "@/types";
import { getRandomHexColor } from "@/utils";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface BartendersChartProps {
  className?: string;
  data: BartenderAnalytic[];
}

export function BartendersChart(props: BartendersChartProps) {
  const { data } = props;

  const chartData = useMemo(() => {
    return data.map((e) => ({
      memberName: e.memberName,
      total: e.total,
      fill: getRandomHexColor(),
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    return chartData.reduce(
      (acc, val) => ({
        ...acc,
        [val.memberName]: {
          label: val.memberName,
          color: getRandomHexColor(),
        },
      }),
      {} as ChartConfig
    );
  }, [chartData]);

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle>Bartenders</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="memberName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              allowDataOverflow={false}
            />
            <XAxis dataKey="total" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _, item) => {
                    return `${
                      item.payload.memberName
                    }: ${value.toLocaleString()}`;
                  }}
                />
              }
            />
            <Bar dataKey="total" layout="vertical" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
