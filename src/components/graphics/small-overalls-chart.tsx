import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartTotal } from "@/components/graphics/chart-total";

interface SmallOverallsProps {
  title: React.ReactNode;
  total: number | string;
  chartData: unknown[];
  xAxis: string;
  yAxis: string;
  yLabel?: string;
  className?: string;
}

export function SmallOverallsChart(props: SmallOverallsProps) {
  const config: ChartConfig = useMemo(() => {
    return {
      [props.yAxis]: {
        color: "hsl(var(--chart-1))",
      },
    };
  }, [props.yAxis]);

  const formattedY = useMemo(() => {
    return (
      props?.yLabel ||
      props.yAxis.charAt(0).toLocaleUpperCase() + props.yAxis.slice(1)
    );
  }, [props.yAxis, props?.yLabel]);

  return (
    <Card className={props?.className}>
      <CardContent className="grid grid-cols-2 items-start px-6 py-2 h-full">
        <ChartTotal title={props.title} total={props.total} />
        <section className="flex justify-center items-center h-full w-full">
          <ChartContainer config={config} className="h-[80%]">
            <BarChart accessibilityLayer data={props.chartData}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelClassName="font-semibold"
                    labelFormatter={(_, payload) => {
                      const t = payload.at(0);
                      const item = t?.payload;

                      return item?.[props.xAxis] || "";
                    }}
                    formatter={(value) => {
                      return (
                        <div className="flex flex-row justify-start items-center flex-nowrap">
                          <div className={`bg-chart-1 h-3 w-3 mr-1`} />
                          <span>{`${formattedY}: ${value}`}</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey={props.yAxis}
                fill="hsl(var(--chart-1))"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </section>
      </CardContent>
    </Card>
  );
}
