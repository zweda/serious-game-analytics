import { ReactNode } from "react";
import { Visualizations } from "../constants/data.tsx";
import { EChartsOption } from "echarts";
import { contentHeight } from "../constants";

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
        `${labels[0]}: ${params.data[0]}<br/>${labels[1]}: ${params.data[1]}`,
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
        name: labels[0],
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          fontWeight: "bold",
        },
      };
      options.yAxis = {
        name: labels[1],
        nameRotate: 90,
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          fontWeight: "bold",
        },
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

export const getColorForText = (text: string) => {
  const colors = [
    "blue",
    "purple",
    "cyan",
    "green",
    "magenta",
    "pink",
    "red",
    "orange",
    "yellow",
    "volcano",
    "geekblue",
    "lime",
    "gold",
  ];

  // Simple hash function to convert text to a numeric value
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 7) - hash);
  }

  // Use the hash value to choose a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getRelativeContentHeight = (subtract: number) => {
  return (
    contentHeight.substring(0, contentHeight.length - 1) +
    " - " +
    subtract +
    "px)"
  );
};
