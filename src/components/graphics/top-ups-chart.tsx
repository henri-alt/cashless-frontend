import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TopUpAnalytic } from "@/types";
import { getRandomHexColor } from "@/utils";
import { ChartTotal } from "@/components/graphics/chart-total";

interface TopUpChartProps {
  className?: string;
  data: TopUpAnalytic[];
}

export function TopUpsChart(props: TopUpChartProps) {
  const { data } = props;

  const chartData = useMemo(() => {
    return data.map((e) => ({
      member: e.topUp,
      total: e.totalCash,
      fill: getRandomHexColor(),
    }));
  }, [data]);

  const totalTopUps = useMemo(() => {
    return chartData.reduce((acc, val) => acc + val.total, 0);
  }, [chartData]);

  const chartConfig = useMemo(() => {
    return {
      total: {
        label: "Total Top Ups",
        color: getRandomHexColor(),
      },
      ...chartData.reduce(
        (acc, val) => ({
          ...acc,
          [val.member]: {
            label: val.member,
            color: getRandomHexColor(),
          },
        }),
        {} as ChartConfig
      ),
    };
  }, [chartData]);

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle>Cashiers</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelClassName="font-semibold"
                  labelFormatter={(_, payload) => {
                    return payload.at(0)?.name || "Cashier";
                  }}
                  formatter={(val, _, payload) => {
                    return (
                      <div className="flex flex-row justify-start items-center flex-nowrap">
                        <div
                          className={`h-3 w-3 mr-1`}
                          style={{
                            backgroundColor: payload?.payload?.fill,
                          }}
                        />
                        <span>{`Total: ${val.toLocaleString()}`}</span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="member"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px]">
        <ChartTotal
          title="Total"
          total={totalTopUps.toLocaleString()}
          totalClassName="sm:text-lg"
        />
        {chartData.map((e) => (
          <ChartTotal
            title={e.member}
            total={e.total.toLocaleString()}
            totalClassName="sm:text-lg"
            key={e.member}
          />
        ))}
      </CardFooter>
    </Card>
  );
}
