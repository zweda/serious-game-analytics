import { Button, Flex, message, Modal, Table, theme, UploadFile } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { useCallback, useContext, useMemo, useState } from "react";
import { UploadChangeParam } from "antd/es/upload";
import Papa from "papaparse";
import { ColumnType } from "antd/es/table/interface";
import { aptabaseKeyIgnoreList, contentHeight } from "../constants";
import { snakeCaseToWords } from "../utils";
import { API_ENDPOINT } from "../api";
import { AppContext } from "../App.tsx";

export const Uploader = () => {
  const [preview, setPreview] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnType<any>[]>([]);

  const dataExists = useMemo(() => data.length > 0, [data]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { appContext } = useContext(AppContext);

  const handleChange = useCallback(
    (info: UploadChangeParam<UploadFile<any>>) => {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    [],
  );

  const handlePreview = useCallback(async (data: any) => {
    if (data.type === "text/csv") {
      Papa.parse(data.file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (results) => {
          setData(
            results.data.map((d: any, idx) => ({
              key: idx,
              ...d,
            })),
          );
          setColumns(
            results.meta.fields
              ? results.meta.fields
                  .filter((field) => !aptabaseKeyIgnoreList.includes(field))
                  .map((field) => ({
                    title: snakeCaseToWords(field),
                    key: field,
                    dataIndex: field,
                    sorter: (a, b) => a[field].localeCompare(b[field]),
                    align: "center",
                  }))
              : [],
          );
        },
      });
    } else {
      message.error("Please upload a CSV file for preview.");
    }
  }, []);

  const handleBeforeUpload = useCallback(
    (file: File) => {
      handlePreview({ file: file, type: file.type });
    },
    [handlePreview],
  );

  return (
    <Flex
      style={{
        padding: 24,
        height: contentHeight,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        position: "relative",
      }}
      vertical
      align="center"
      gap={50}
    >
      <Dragger
        name="file"
        maxCount={1}
        accept="text/csv"
        multiple={false}
        action={`${API_ENDPOINT}/refresh-data/${appContext.games.active.code}/`}
        onChange={handleChange}
        beforeUpload={handleBeforeUpload}
        showUploadList={{
          showRemoveIcon: false,
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint" style={{ maxWidth: 700 }}>
          Here you upload your monthly export csv from your{" "}
          <b>Aptabase server</b>. This action is additive which means all
          already added events will be skipped while only new one are recorded.
          Each user event is determined by{" "}
          <b>game, event name, user, session</b> and <b>timestamp</b>.
        </p>
      </Dragger>
      {dataExists && (
        <Button type="primary" onClick={() => setPreview(true)}>
          Data Preview
        </Button>
      )}
      <Modal
        open={preview}
        footer={null}
        width="100%"
        height="calc(100vh - 30px)"
        centered={true}
        onCancel={() => setPreview(false)}
      >
        <Table
          dataSource={data}
          columns={columns}
          scroll={{ y: "calc(100vh - 30px - 160px)" }}
          sticky={true}
          size="small"
        />
      </Modal>
    </Flex>
  );
};
