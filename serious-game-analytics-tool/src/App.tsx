import { Breadcrumb, Flex, Layout, Menu, Modal, theme, Tooltip } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { mapMenuItem } from "./utils";
import gameIcon from "./assets/game-icon.png";
import { defaultModule, modules, modulesHierarchy } from "./constants";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "./hooks";
import { LoadingOutlined, ProjectOutlined } from "@ant-design/icons";

export const AppContext = createContext<any>({
  appContext: null,
  setAppContext: null,
});

const App = () => {
  const [appContext, setAppContext] = useAppContext();

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const {
    token: { colorBgContainer, colorPrimaryText },
  } = theme.useToken();

  const workspaceSelected = useMemo<boolean>(() => {
    return appContext.games.active !== null;
  }, [appContext]);

  const sideMenuItems = useMemo(
    () =>
      modulesHierarchy.map((m) =>
        mapMenuItem(
          m.name,
          m.key,
          <m.Icon />,
          m.modules
            ? m.modules.map((sm) => mapMenuItem(sm.name, sm.key, <sm.Icon />))
            : undefined,
          !workspaceSelected,
        ),
      ),
    [workspaceSelected],
  );

  /* BREADCRUMBS */
  const handleMenuItemSelect = useCallback(
    ({ key }: { key: string; keyPath: string[] }) => {
      navigate("/" + key);
    },
    [navigate],
  );

  const appLoading = useMemo(() => {
    return appContext.games.loading;
  }, [appContext.games.loading]);

  const handleOpenWorkspaces = () => {
    navigate("/" + defaultModule.key);
  };

  useEffect(() => {
    if (
      (location.pathname !== "/" + defaultModule.key && !workspaceSelected) ||
      location.pathname === "/"
    )
      navigate("/" + defaultModule.key);
  }, [navigate, workspaceSelected]);

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Modal
        width="fit-content"
        open={appLoading}
        footer={null}
        closeIcon={null}
        centered={true}
      >
        <LoadingOutlined style={{ fontSize: 40, color: colorPrimaryText }} />
      </Modal>
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <Menu
          theme="dark"
          mode="inline"
          items={sideMenuItems}
          selectedKeys={[appContext.selectedSidebarKey]}
          onSelect={(e: any) => handleMenuItemSelect(e)}
          defaultOpenKeys={workspaceSelected ? Object.keys(modules) : []}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Flex align="center" gap={10} style={{ paddingLeft: 15 }}>
            {workspaceSelected && (
              <img className="game-logo" src={gameIcon} alt="game logo" />
            )}
            <h2 className="game-name">
              {workspaceSelected
                ? appContext.games.active.name
                : "Select Workspace"}
            </h2>
            {workspaceSelected && (
              <Tooltip placement="bottom" title="Change workspace">
                <ProjectOutlined
                  style={{
                    fontSize: 24,
                    color: colorPrimaryText,
                    cursor: "pointer",
                  }}
                  onClick={handleOpenWorkspaces}
                />
              </Tooltip>
            )}
          </Flex>
        </Header>
        <Content
          style={{
            margin: "0 16px",
            position: "relative",
          }}
        >
          <Breadcrumb
            items={appContext.breadcrumbs}
            style={{
              margin: "16px 0",
              fontWeight: "bold",
            }}
          />
          <AppContext.Provider
            value={{
              appContext,
              setAppContext,
            }}
          >
            <Outlet />
          </AppContext.Provider>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            opacity: 0.75,
            background: colorBgContainer,
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          Iva Ištuk @ FER ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
