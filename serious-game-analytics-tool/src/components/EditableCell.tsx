import { FC, useState } from "react";
import { Input } from "antd";
import { debounce } from "../utils";
import { httpRequest } from "../api";

export const EditableCell: FC<{
  value: string;
  name: string;
  url?: string;
  record?: any;
}> = ({ value, name, url, record }) => {
  const [controlledValue, setControlledValue] = useState(value);

  const updateValue = debounce(() => {
    if (url)
      httpRequest(url, "put", null, {
        [name]: controlledValue,
        ...(record || {}),
      });
  }, 500);

  const handleInput = (e: any) => {
    setControlledValue(e.target.value);
    updateValue();
  };

  return <Input name={name} value={controlledValue} onInput={handleInput} />;
};
