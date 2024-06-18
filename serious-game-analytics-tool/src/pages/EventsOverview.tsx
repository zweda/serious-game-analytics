import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App.tsx";
import { Divider, Flex, message, Table, theme } from "antd";
import { getEvents } from "../api/get-data.ts";
import { eventTableColumns } from "../constants/data.tsx";
import { InfoCircleOutlined } from "@ant-design/icons";
import { contentHeight } from "../constants";
import { getRelativeContentHeight } from "../utils";

export const EventsOverview = () => {
  const [events, setEvents] = useState([]);
  const { appContext } = useContext(AppContext);

  const {
    token: { colorBgContainer, borderRadiusLG, colorTextDescription },
  } = theme.useToken();

  useEffect(() => {
    getEvents(appContext.games.active.id)
      .then((res: any) => setEvents(res))
      .catch(() => message.error(`Unable to get game events`));
  }, [appContext.games.active.id]);

  return (
    <Flex
      style={{
        height: contentHeight,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        padding: 24,
        fontSize: 20,
        color: colorTextDescription,
        position: "relative",
        overflow: "auto",
      }}
      align="center"
      vertical
    >
      <Table
        dataSource={events.filter((e: any) => !e.reserved)}
        columns={eventTableColumns}
        scroll={{ y: getRelativeContentHeight(350) }}
        sticky={true}
        size="small"
        rowKey="id"
      />
      <Divider />
      <Flex
        gap={10}
        style={{
          color: colorTextDescription,
          alignSelf: "self-start",
          fontSize: "small",
          marginBottom: 10,
        }}
      >
        <InfoCircleOutlined />
        <span>Reserved events</span>
      </Flex>
      <Table
        dataSource={events.filter((e: any) => e.reserved)}
        columns={eventTableColumns.slice(0, -3)}
        scroll={{ y: "100%" }}
        sticky={true}
        size="small"
        rowKey="id"
        pagination={false}
      />
    </Flex>
  );
};
