import { FC, useCallback, useState } from "react";
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

  const updateValue = useCallback(
    (value: string) =>
      debounce((value: string) => {
        if (url)
          httpRequest(url, "put", null, {
            [name]: value,
            ...(record || {}),
          });
      }, 500)(value),
    [name, record, url],
  );

  return (
    <Input
      name={name}
      value={controlledValue}
      onChange={(e) => {
        const value = e.target.value;
        setControlledValue(value);
        updateValue(value);
      }}
    />
  );
};
