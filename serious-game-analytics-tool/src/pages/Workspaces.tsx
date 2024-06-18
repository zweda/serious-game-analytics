import { Button, Card, Flex, Form, Input, message, Modal, theme } from "antd";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../App.tsx";
import {
  DeleteOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import gameIcon from "../assets/game-icon.png";
import { createGame, deleteGame } from "../api/actions.ts";
import { debounce } from "../utils";

export const Workspaces = () => {
  const {
    token: {
      colorBgContainer,
      colorTextDescription,
      colorPrimaryBg,
      colorPrimaryText,
      colorErrorText,
    },
  } = theme.useToken();

  const { appContext, setAppContext } = useContext(AppContext);

  const selectedWorkspace = useMemo(
    () => appContext.games.active,
    [appContext.games.active],
  );

  const [wsFormOpen, setWsFormOpen] = useState(false);
  const [newWsLoading, setNewWsLoading] = useState(false);

  const handleSelectWorkspace = (game: any) => {
    setAppContext("games", { active: game, loading: true });
    debounce(() => setAppContext("games", { loading: false }), 300)();
    localStorage.setItem("sga-workspace", JSON.stringify(game));
  };

  const handleDeleteWorkSpace = (game: any) => {
    deleteGame(game.id).then((res: any) => {
      if (res.deleted)
        setAppContext("games", {
          data: appContext.games.data.filter((g: any) => g.id !== game.id),
          active: null,
        });
      else message.error(res.message);
    });
  };

  const handleAddWorkSpace = (data: any) => {
    setNewWsLoading(true);
    createGame(data)
      .then((res: any) => {
        if (res.created) {
          setAppContext("games", {
            data: [...appContext.games.data, res.data],
          });

          setWsFormOpen(false);
        } else message.error(res.message);

        setNewWsLoading(false);
      })
      .catch(() => {
        setNewWsLoading(false);
      });
  };

  return (
    <Flex
      style={{
        minHeight: 360,
        position: "relative",
      }}
      gap={20}
      wrap="wrap"
      align="flex-start"
    >
      {appContext.games.data.map((game: any) => (
        <Card
          className="workspace-card"
          title={
            <Flex justify="space-between">
              <Flex gap={5} align="center">
                <img
                  className="game-logo small"
                  src={gameIcon}
                  alt="game logo"
                />
                <span>{game.name}</span>
              </Flex>
              <DeleteOutlined
                style={{ color: colorErrorText }}
                onClick={() => handleDeleteWorkSpace(game)}
              />
            </Flex>
          }
          key={game.id}
          bordered={false}
          style={{
            width: 250,
            cursor: "pointer",
            background:
              selectedWorkspace && selectedWorkspace.code === game.code
                ? colorPrimaryBg
                : colorBgContainer,
          }}
          onClick={() => handleSelectWorkspace(game)}
        >
          <p style={{ color: colorTextDescription }}>{game.description}</p>
        </Card>
      ))}
      <Card
        className="workspace-card"
        title={
          <Flex align="center">
            <span>Create New Workspace</span>
          </Flex>
        }
        bordered={false}
        style={{
          cursor: "pointer",
        }}
        onClick={() => setWsFormOpen(true)}
      >
        <Flex justify="center" align="center">
          <PlusCircleOutlined
            style={{ fontSize: 24, color: colorPrimaryText }}
          />
        </Flex>
      </Card>

      <Modal
        title="Create New Workspace"
        open={wsFormOpen}
        footer={null}
        onCancel={() => setWsFormOpen(false)}
      >
        <Form
          variant="filled"
          style={{ maxWidth: 600, marginTop: 20 }}
          onFinish={handleAddWorkSpace}
        >
          <Form.Item
            label="Game Name"
            name="name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Game Code"
            name="code"
            rules={[
              {
                required: true,
                message: "Code is required and must be unique!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Game Desctiption"
            name="description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="flex-end">
              <Button
                type="primary"
                htmlType="submit"
                disabled={newWsLoading}
                style={{ width: 75 }}
              >
                {newWsLoading ? <LoadingOutlined /> : "Create"}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};
