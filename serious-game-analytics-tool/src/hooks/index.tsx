import { useEffect, useState } from "react";
import { getGames } from "../api/get-data.ts";
import { message } from "antd";
import { appLocalStorageKey, defaultModule, modules } from "../constants";
import { useLocation } from "react-router-dom";

export const useAppContext = () => {
  const location = useLocation();
  const [appData, setAppData] = useState<any>(() => {
    const openedWorkspace = localStorage.getItem(appLocalStorageKey);

    return {
      games: {
        data: [],
        loading: false,
        active: openedWorkspace ? JSON.parse(openedWorkspace) : null,
      },
      breadcrumbs: [],
      selectedSidebarKey: "",
    };
  });

  useEffect(() => {
    const module = location.pathname.substring(1);
    setAppData((data: any) => ({
      ...data,
      breadcrumbs: !module
        ? defaultModule.breadcrumbs.map((bc: string) => ({
            title: bc,
          }))
        : (modules as any)[module].breadcrumbs.map((bc: string) => ({
            title: bc,
          })),
      selectedSidebarKey: module === defaultModule.key ? "" : module,
    }));
  }, [location.pathname]);

  const setAppContext = (key: string, value: any) => {
    setAppData((data: any) => ({
      ...data,
      [key]: {
        ...data[key],
        ...value,
      },
    }));
  };

  useEffect(() => {
    setAppContext("games", { loading: true });

    getGames()
      .then((result) => {
        let active = appData.games.active;
        if (active && !result.find((g: any) => g.id === active.id)) {
          localStorage.removeItem(appLocalStorageKey);
          active = null;
        }

        setAppContext("games", { data: result, loading: false, active });
      })
      .catch(() => message.error("Error while fetching workspaces"));
  }, []);

  return [appData, setAppContext];
};
