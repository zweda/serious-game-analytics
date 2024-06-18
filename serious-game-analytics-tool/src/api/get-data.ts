import { httpRequest } from "./index.ts";
import { groupAges } from "../utils/data.ts";

export const getGames = async () => {
  const { data, ok } = await httpRequest("games", "get");
  if (ok)
    return data.results.map((g: any) => ({
      id: g["id"],
      code: g["code"],
      name: g["name"],
      description: g["description"],
      created: g["created_at"],
    }));

  return [];
};

export const getAnalytics = async (gameCode: string, type: string) => {
  const { data, ok } = await httpRequest(
    `analytics/${gameCode}/${type}`,
    "get",
  );

  if (ok) return data.results;
  return [];
};

export const getUserStatistics = async (gameCode: string) => {
  const { data, ok } = await httpRequest(`user-stats/${gameCode}`, "get");

  if (ok)
    return {
      age: groupAges(data["age_data"]),
      gender: data["gender_data"],
      region: data["region_data"],
    };

  return {
    age: [],
    gender: [],
    region: [],
  };
};

export const getUsers = async (gameId: string) => {
  const { data, ok } = await httpRequest(`users`, "get", { game: gameId });

  if (ok)
    return data.results.map((user: any) => ({
      id: user.id,
      email: user.email,
      age: user.age,
      gender: user.gender,
      os: user.os,
      region: user.region,
    }));

  return [];
};

export const getEvents = async (gameId: string) => {
  const { data, ok } = await httpRequest(`events`, "get", { game: gameId });

  if (ok)
    return data.results.map((event: any) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      action: event.name.startsWith("action"),
      count: event.count,
      enum: event.enum,
      game: event.game,
      fields: event.fields,
      reserved: event.reserved,
    }));

  return [];
};

export const getHypothesis = async (gameId: string) => {
  const { data, ok } = await httpRequest(`research-questions`, "get", {
    game: gameId,
  });

  if (ok)
    return data.results.map((rq: any) => ({
      id: rq.id,
      name: rq.name,
      description: rq.description,
      measurement: rq.measurement,
      usesContext: rq["uses_context"],
      contextAccessor: rq["context_accessor"],
      sessionPolicy: rq["session_policy"],
      aggregationPolicy: rq["aggregation_policy"],
      aggregationFunction: rq["aggregation_function"],
      visualizationType: rq["visualization_type"],
      events: rq["event_groups"].map((eg: any) => ({
        id: eg.id,
        accessor: eg.accessor,
        valuePolicy: eg["value_policy"],
        event: eg.event,
        startValue: eg["start_value"],
        endValue: eg["end_value"],
        label: eg.label,
      })),
    }));

  return [];
};
