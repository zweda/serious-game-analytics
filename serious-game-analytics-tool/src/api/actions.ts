import { httpRequest } from "./index.ts";
import { getLocalFormattedDateTime } from "../utils";

export const createGame = async (data: any) => {
  const {
    data: createdGame,
    ok,
    status,
  } = await httpRequest("games", "post", null, data);

  if (ok) {
    return {
      created: true,
      data: {
        id: createdGame["id"],
        code: createdGame["code"],
        name: createdGame["name"],
        description: createdGame["description"],
        created: getLocalFormattedDateTime(createdGame["created_at"]),
      },
    };
  }

  let message = "Error creating workspace";
  if (status === 400) message = "Game code must be unique";
  return {
    created: false,
    message,
  };
};

export const deleteGame = async (id: string) => {
  const { status, ok } = await httpRequest(`games/${id}`, "delete");

  let message = "";
  if (status === 400)
    message = "Cannot delete a game workspace because there are active events";

  return {
    deleted: ok,
    message,
  };
};

export const saveHypothesis = async (
  data: any,
  isEdit?: boolean,
  id?: string,
) => {
  const { data: rq, ok } = await httpRequest(
    "research-questions" + (isEdit ? "/" + id : ""),
    isEdit ? "put" : "post",
    null,
    data,
  );

  if (ok) return { created: true, data: rq };

  return {
    created: false,
    message: "Error creating research question",
  };
};

export const deleteHypothesis = async (id: string) => {
  const { ok } = await httpRequest(`research-questions/${id}`, "delete");

  return {
    deleted: ok,
    message: "",
  };
};
