import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../App.tsx";
import { Flex, message, Table, theme } from "antd";
import { getUsers, getUserStatistics } from "../api/get-data.ts";
import { userTableColumns } from "../constants/data.tsx";
import ReactECharts from "echarts-for-react";

export const UserOverview = () => {
  const [users, setUsers] = useState([]);
  const [userStatistics, setUserStatistics] = useState({
    gender: [],
    age: [],
    region: [],
  });

  const { appContext } = useContext(AppContext);

  const {
    token: { colorBgContainer, borderRadiusLG, colorTextDescription },
  } = theme.useToken();

  useEffect(() => {
    getUsers(appContext.games.active.id)
      .then((res: any) => setUsers(res))
      .catch(() => message.error(`Unable to get users`));

    getUserStatistics(appContext.games.active.code)
      .then((res: any) => setUserStatistics(res))
      .catch(() => message.error(`Unable to get user statistics`));
  }, [appContext.games.active.code, appContext.games.active.id]);

  const hasAgeStatistics = useMemo(
    () => userStatistics.age.length > 0,
    [userStatistics.age.length],
  );
  const hasGenderStatistics = useMemo(
    () => userStatistics.gender.length > 0,
    [userStatistics.gender.length],
  );
  const hasRegionStatistics = useMemo(
    () => userStatistics.region.length > 0,
    [userStatistics.region.length],
  );

  return (
    <Flex
      style={{
        height: "calc(100% - 22px - 2*24px)",
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        padding: 24,
        fontSize: 20,
        color: colorTextDescription,
        overflow: "auto",
        position: "relative",
      }}
      align="center"
      vertical
      gap={20}
    >
      <Table
        style={{ height: 350 }}
        dataSource={users}
        columns={userTableColumns}
        scroll={{ y: "calc(350px - 22px - 2*24px)" }}
        sticky={true}
        size="small"
        rowKey="id"
      />

      <Flex justify="space-between" gap={50}>
        {hasGenderStatistics && (
          <ReactECharts
            option={{
              title: {
                text: "Gender Distribution",
              },
              tooltip: {},
              legend: {
                top: "86%",
                left: "center",
              },
              series: [
                {
                  type: "pie",
                  radius: ["40%", "70%"],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                  label: {
                    show: false,
                    position: "center",
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 20,
                      fontWeight: "bold",
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  data: userStatistics.gender.map((gs: any) => ({
                    value: gs.count,
                    name: gs.gender == "f" ? "Female" : "Male",
                  })),
                },
              ],
            }}
            style={{ height: 300, width: 300 }}
          />
        )}
        {hasAgeStatistics && (
          <ReactECharts
            option={{
              title: {
                text: "Age Distribution",
              },
              tooltip: {},
              xAxis: {
                type: "category",
                data: userStatistics.age.map((a: any) => a.ageRange),
              },
              yAxis: {
                type: "value",
              },
              series: [
                {
                  name: "Count",
                  type: "bar",
                  data: userStatistics.age.map((a: any) => a.count),
                },
              ],
            }}
            style={{ height: 300, width: 400 }}
          />
        )}
        {hasRegionStatistics && (
          <ReactECharts
            option={{
              title: {
                text: "Region Distribution",
              },
              tooltip: {},
              angleAxis: {
                type: "category",
                data: userStatistics.region.map((r: any) =>
                  r.region.length === 0 ? "Not Disclosed" : r.region,
                ),
              },
              radiusAxis: {},
              polar: {},
              series: [
                {
                  type: "bar",
                  data: userStatistics.region.map((r: any) => r.count),
                  coordinateSystem: "polar",
                  name: "A",
                  stack: "a",
                  emphasis: {
                    focus: "series",
                  },
                },
              ],
            }}
            style={{ height: 300, width: 400 }}
          />
        )}
      </Flex>
    </Flex>
  );
};
