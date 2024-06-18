import {
  AppstoreAddOutlined,
  DotChartOutlined,
  FileSyncOutlined,
  FireFilled,
  PieChartOutlined,
  QrcodeOutlined,
  ReadOutlined,
  TagsOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Uploader } from "../pages/Uploader.tsx";
import { Workspaces } from "../pages/Workspaces.tsx";
import { HypothesisManager } from "../pages/HypothesisManager.tsx";
import { EventsOverview } from "../pages/EventsOverview.tsx";
import { UserOverview } from "../pages/UserOverview.tsx";
import { Analytics } from "../pages/Analytics.tsx";

export const contentHeight = "calc(100vh - 22px - 2*24px - 64px - 50px)";

export const modules = {
  workspaces: {
    name: "Workspaces",
    Component: Workspaces,
    breadcrumbs: ["Workspaces"],
  },
  events: { name: "Events", Component: null, breadcrumbs: ["Events"] },
  "events-overview": {
    name: "Events Overview",
    Component: EventsOverview,
    breadcrumbs: ["Events", "Events Overview"],
  },
  "research-questions": {
    name: "Research Questions",
    Component: HypothesisManager,
    breadcrumbs: ["Events", "Research Questions"],
  },
  users: { name: "Users", Component: UserOverview, breadcrumbs: ["Users"] },
  analytics: { name: "Analytics", Component: null, breadcrumbs: ["Analytics"] },
  gameplay: {
    name: "Gameplay",
    Component: () => <Analytics analytics="gameplay" />,
    breadcrumbs: ["Analytics", "Gameplay"],
  },
  learning: {
    name: "Learning",
    Component: () => <Analytics analytics="learning" />,
    breadcrumbs: ["Analytics", "Learning"],
  },
  engagement: {
    name: "Engagement",
    Component: () => <Analytics analytics="engagement" />,
    breadcrumbs: ["Analytics", "Engagement"],
  },
  immersion: {
    name: "Immersion",
    Component: () => <Analytics analytics="immersion" />,
    breadcrumbs: ["Analytics", "Immersion"],
  },
  upload: {
    name: "Data Upload",
    Component: Uploader,
    breadcrumbs: ["Data Upload"],
  },
};

export const defaultModule = {
  key: "workspaces",
  name: "Workspaces",
  Component: Workspaces,
  breadcrumbs: ["Workspaces"],
};

export const modulesHierarchy = [
  {
    key: "events",
    name: "Events",
    Icon: FireFilled,
    modules: [
      {
        key: "events-overview",
        name: "Events Overview",
        Icon: AppstoreAddOutlined,
      },
      {
        key: "research-questions",
        name: "Research Questions",
        Icon: TagsOutlined,
      },
    ],
  },
  {
    key: "analytics",
    name: "Analytics",
    Icon: PieChartOutlined,
    modules: [
      {
        key: "gameplay",
        name: "Gameplay",
        Icon: QrcodeOutlined,
      },
      {
        key: "learning",
        name: "Learning",
        Icon: ReadOutlined,
      },
      {
        key: "engagement",
        name: "Engagement",
        Icon: DotChartOutlined,
      },
      {
        key: "immersion",
        name: "Immersion",
        Icon: UsergroupAddOutlined,
      },
    ],
  },
  {
    key: "users",
    name: "Users",
    Icon: TeamOutlined,
  },
  {
    key: "upload",
    name: "Data Upload",
    Icon: FileSyncOutlined,
  },
];

export const aptabaseKeyIgnoreList = [
  "app_build_number",
  "engine_name",
  "engine_version",
];

export const appLocalStorageKey = "sga-workspace";
