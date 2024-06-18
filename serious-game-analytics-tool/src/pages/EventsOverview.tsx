import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App.tsx";
import { Flex, message, Table, theme } from "antd";
import { getEvents } from "../api/get-data.ts";
import { eventTableColumns } from "../constants/data.tsx";

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
        height: "calc(100% - 22px - 2*24px)",
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        padding: 24,
        fontSize: 20,
        color: colorTextDescription,
        position: "relative",
      }}
      align="center"
      vertical
    >
      <Table
        dataSource={events}
        columns={eventTableColumns}
        scroll={{ y: "100%" }}
        sticky={true}
        size="small"
        rowKey="id"
      />
    </Flex>
  );
};
