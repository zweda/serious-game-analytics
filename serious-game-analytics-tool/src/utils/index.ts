import { ReactNode } from "react";
import { Visualizations } from "../constants/data.tsx";
import { EChartsOption } from "echarts";

export const mapMenuItem = (
  label: string,
  key: string,
  icon?: ReactNode,
  children?: any[],
  disabled?: boolean,
) => ({
  key,
  icon,
  children,
  label,
  disabled,
});

export const snakeCaseToWords = (snakeCaseStr: string) => {
  const words = snakeCaseStr.split("_");

  const capitalizedWords = words.map((word, idx) => {
    if (idx == 0)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return word;
  });

  return capitalizedWords.join(" ");
};

export const getLocalFormattedDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const formatter = new Intl.DateTimeFormat(navigator.language);
  return formatter.format(date);
};

export const debounce = (func: any, delay: number) => {
  let timeout: any;

  return (...args: any) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, delay);
  };
};

export const getEChartsOptionsFromData = (
  type: keyof typeof Visualizations,
  labels: any[],
  data: any,
) => {
  const options: Omit<EChartsOption, "series"> = {
    xAxis: {},
    yAxis: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) =>
        `${labels[0].name}: ${params.data[0]}<br/>${labels[1].name}: ${params.data[1]}`,
    },
    series: [
      {
        symbolSize: 15,
        data: data,
        type,
      },
    ],
  };

  switch (type) {
    case "scatter":
      options.xAxis = {
        name: labels[0].name + " - " + labels[0].accessor || "",
        nameLocation: "middle",
        nameGap: 30,
      };
      options.yAxis = {
        name: labels[1].name + " - " + labels[1].accessor || "",
      };
      break;
    case "bar":
      break;
    case "line":
      break;
    case "pie":
      break;
    case "scalar":
      return null;
    default:
      return null;
  }

  return options;
};

export const selectSearchHandler = (input: string, option: any) => {
  return ("" + option?.label).toLowerCase().includes(input.toLowerCase());
};
