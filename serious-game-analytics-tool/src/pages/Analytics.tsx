import { FC, useContext, useEffect, useMemo, useState } from "react";
import { getAnalytics } from "../api/get-data.ts";
import { AppContext } from "../App.tsx";
import { Card, Flex, message, theme } from "antd";
import { ExperimentFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import EChartsReact from "echarts-for-react";
import { getEChartsOptionsFromData } from "../utils";
import { contentHeight } from "../constants";

export const Analytics: FC<{ analytics: string }> = ({ analytics }) => {
  const [data, setData] = useState([]);
  const { appContext } = useContext(AppContext);

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

  useEffect(() => {
    getAnalytics(appContext.games.active.code, analytics)
      .then((res: any) => setData(res))
      .catch(() => message.error(`Unable to get ${analytics} analytics`));
  }, [analytics, appContext.games.active.code]);

  const noData = useMemo(() => data.length === 0, [data]);
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
      {noData ? (
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
      ) : (
        data.map((d: any, idx) => (
          <Flex vertical gap={10} key={idx}>
            <h2 style={{ color: colorTextHeading }}>{d.question}</h2>
            <p style={{ color: colorTextDescription, maxWidth: 500 }}>
              {d.description}
            </p>
            {d.visualization == "scalar" ? (
              <Card
                title={d.labels[0] || null}
                style={{
                  marginTop: 20,
                  width: "fit-content",
                  fontSize: 35,
                  alignSelf: "center",
                }}
              >
                {d.data}
              </Card>
            ) : (
              <EChartsReact
                style={{ width: 600, height: 400 }}
                option={getEChartsOptionsFromData(
                  d.visualization,
                  d.labels,
                  d.data,
                )}
              />
            )}
          </Flex>
        ))
      )}
    </Flex>
  );
};
