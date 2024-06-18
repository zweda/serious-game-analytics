export const API_ENDPOINT = "http://127.0.0.1:8000/api";

export const httpRequest = async (
  url: string,
  method: "get" | "put" | "post" | "delete" | "patch",
  params?: any,
  data?: any,
  isFormData?: boolean,
) => {
  const response = await fetch(
    API_ENDPOINT + "/" + url + "/?" + new URLSearchParams(params || {}),
    {
      method,
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
      body: isFormData ? data : JSON.stringify(data),
    },
  );

  let responseData = null;

  try {
    responseData = await response.json();
  } catch (_) {
    //do nothing
  }

  return {
    data: responseData,
    status: response.status,
    ok: response.ok,
  };
};
