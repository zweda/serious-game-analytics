import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAnalytics } from "../api/get-data.ts";
import { AppContext } from "../App.tsx";
import { Card, Flex, message, Select, theme } from "antd";
import { ExperimentFilled, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import EChartsReact from "echarts-for-react";
import { getEChartsOptionsFromData } from "../utils";
import { contentHeight } from "../constants";
import { Genders } from "../constants/data.tsx";

export const Analytics: FC<{ analytics: string }> = ({ analytics }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hypothesis, setHypothesis] = useState<any[]>([]);
  const [dataFilters, setDataFilters] = useState<
    { context: string; group: string }[]
  >([]);
  const { appContext } = useContext(AppContext);
  const eChartRefs = useRef<EChartsReact[]>([]);

  const {
    token: {
      colorBgContainer,
      borderRadiusLG,
      colorTextDescription,
      colorTextDisabled,
      colorText,
      colorTextHeading,
    },
  } = theme.useToken();

  const changeDataFilter = (
    dataIndex: number,
    filter: "context" | "group",
    value: string,
  ) => {
    setDataFilters((prev) => {
      const newFilters = structuredClone(prev);
      if (!newFilters[dataIndex])
        newFilters[dataIndex] = {
          context: "",
          group: "",
          [filter]: value,
        };
      else newFilters[dataIndex][filter] = value;
      return newFilters;
    });
  };

  const filteredData = (data: any[], dataIndex: number, groupName?: string) => {
    const filter = dataFilters[dataIndex];
    if (!filter) return data;

    if (eChartRefs.current[dataIndex])
      eChartRefs.current[dataIndex].getEchartsInstance().dispose();

    return data.filter((d: any) => {
      let leave = true;
      if (filter.context && d.context.value !== filter.context) leave = false;
      if (filter.group && groupName && d.user[groupName] !== filter.group)
        leave = false;
      return leave;
    });
  };

  useEffect(() => {
    setLoading(true);
    getAnalytics(appContext.games.active.code, analytics)
      .then((res: any[]) => {
        res.forEach((d: any, idx) => {
          if (d.contexts)
            changeDataFilter(idx, "context", d.contexts.values[0]);
          if (d.groups) changeDataFilter(idx, "group", d.groups.values[0]);
        });
        setHypothesis(res);
        setLoading(false);
      })
      .catch(() => {
        message.error(`Unable to get ${analytics} analytics`);
        setLoading(false);
      });
  }, [analytics, appContext.games.active.code]);

  const noData = useMemo(() => hypothesis.length === 0, [hypothesis]);
  const containerStyle = useMemo(
    () => ({
      height: contentHeight,
      background: colorBgContainer,
      borderRadius: borderRadiusLG,
      padding: 24,
      fontSize: noData ? 20 : 14,
      color: noData ? colorTextDescription : colorText,
      overflow: "auto",
    }),
    [borderRadiusLG, colorBgContainer, colorText, colorTextDescription, noData],
  );

  return (
    <Flex
      style={containerStyle}
      align={noData ? "center" : "flex-start"}
      justify={noData ? "center" : "flex-start"}
      vertical
      gap={noData ? 10 : 50}
    >
      {noData && !loading && (
        <>
          <Flex gap={10}>
            <ExperimentFilled />
            <b> No analytics to show here </b>
          </Flex>
          <p
            style={{
              fontSize: 16,
              color: colorTextDisabled,
              maxWidth: 500,
              textAlign: "center",
            }}
          >
            Make sure to check if you have any recorded events in{" "}
            <Link to={"/events-overview"}>
              <b>Events Overview</b>
            </Link>
            . If yes make sure to create{" "}
            <Link to={"/research-questions"}>
              <b>Research Questions</b>
            </Link>{" "}
            and map adequate events to support <b>{analytics}</b> analytics.
          </p>
        </>
      )}
      {loading && <LoadingOutlined style={{ fontSize: 50 }} />}
      {!noData &&
        !loading &&
        hypothesis.map((d: any, idx) => (
          <Flex vertical gap={10} key={idx}>
            <h2 style={{ color: colorTextHeading }}>{d.question}</h2>
            <p style={{ color: colorTextDescription, maxWidth: 500 }}>
              {d.description}
            </p>
            {(d.contexts || d.groups) && (
              <Flex gap={20}>
                {d.contexts && (
                  <Flex gap={10} align="center">
                    <b>{d.contexts.name}:</b>
                    <Select
                      value={dataFilters[idx]?.context}
                      onChange={(value) =>
                        changeDataFilter(idx, "context", value)
                      }
                      options={d.contexts.values.map((op: string) => ({
                        label: op,
                        value: op,
                      }))}
                    />
                  </Flex>
                )}
                {d.groups && (
                  <Flex gap={10} align="center">
                    <b>{d.groups.name}:</b>
                    <Select
                      style={{ width: "max-content" }}
                      value={dataFilters[idx]?.group}
                      onChange={(value) =>
                        changeDataFilter(idx, "group", value)
                      }
                      options={d.groups.values.map((op: string) => ({
                        label:
                          d.groups.name === "gender"
                            ? Genders[op as keyof typeof Genders]
                            : op,
                        value: op,
                      }))}
                    />
                  </Flex>
                )}
              </Flex>
            )}
            {d.visualization == "scalar" ? (
              (filteredData(d.data, idx, d.groups?.name) as any[]).map(
                (record: any, innerIdx) => (
                  <Card
                    key={innerIdx}
                    title={d.labels[0] || null}
                    style={{
                      marginTop: 20,
                      width: "fit-content",
                      fontSize: 35,
                      alignSelf: "center",
                      textAlign: "center",
                    }}
                  >
                    {record.data[0]}
                  </Card>
                ),
              )
            ) : (
              <EChartsReact
                ref={(el) => (eChartRefs.current[idx] = el as EChartsReact)}
                style={{ width: 700, height: 450 }}
                option={getEChartsOptionsFromData(
                  d.visualization,
                  d.labels,
                  filteredData(d.data, idx, d.groups?.name),
                )}
              />
            )}
          </Flex>
        ))}
    </Flex>
  );
};
