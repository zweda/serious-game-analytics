import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Table,
  theme,
} from "antd";
import { FC, useContext, useEffect, useState } from "react";
import { AppContext } from "../App.tsx";
import { getEvents, getHypothesis } from "../api/get-data.ts";
import { ColumnType } from "antd/es/table/interface";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { saveHypothesis, deleteHypothesis } from "../api/actions.ts";
import {
  AggregationPolicies,
  Aggregations,
  Measurement,
  SessionPolicy,
  ValuePolicies,
  Visualizations,
} from "../constants/data.tsx";
import { Link } from "react-router-dom";
import { getRelativeContentHeight, selectSearchHandler } from "../utils";
import { contentHeight } from "../constants";

export const HypothesisManager = () => {
  const [hypothesis, setHypothesis] = useState<any[]>([]);
  const [events, setEvents] = useState<
    { name: string; id: string; fields: string[] }[]
  >([]);
  const { appContext } = useContext(AppContext);
  const {
    token: { colorBgContainer, borderRadiusLG, colorTextDescription },
  } = theme.useToken();

  // FORM state
  const [form] = Form.useForm();
  const [rQModalOpened, setRQModalOpened] = useState<boolean>(false);
  const [newRQLoading, setNewRQLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [eventKeyOptions, setEventKeyOptions] = useState<
    {
      label: string;
      value: string;
    }[][]
  >([[], []]);
  const [aggregationFunctionDisabled, setAggregationFunctionDisabled] =
    useState(true);
  const [eventValueDelimitersDisabled, setEventValueDelimitersDisabled] =
    useState<boolean[]>([true, true]);
  const [timeBetweenEnabled, setTimeBetweenEnabled] = useState<boolean>(false);
  const [showTimeBetween, setShowTimeBetween] = useState(false);

  const filterEventKeyOptions = (
    value: string,
    field: number,
    name: string,
  ) => {
    setEventKeyOptions((prev) => {
      const list = structuredClone(prev);
      list[field] =
        events
          .find((e) => e.id === value)
          ?.fields.map((f) => ({
            label: f,
            value: f,
          })) || [];

      return list;
    });

    form.setFieldValue(["events", field, name], undefined);
  };

  useEffect(() => {
    getHypothesis(appContext.games.active.id)
      .then((res: any) => setHypothesis(res))
      .catch(() => message.error(`Unable to get game events`));
    getEvents(appContext.games.active.id).then((res: any) =>
      setEvents(
        res
          .filter((ev: any) => !ev.reserved)
          .map((ev: any) => ({ id: ev.id, name: ev.name, fields: ev.fields })),
      ),
    );
  }, [appContext.games.active.id]);

  const handleSaveResearchQuestion = (data: any) => {
    setNewRQLoading(true);
    saveHypothesis(
      {
        name: data.name,
        description: data.description,
        uses_context: data.usesContext,
        measurement: data.measurement,
        context_accessor: data.contextAccessor,
        session_policy: data.sessionPolicy,
        aggregation_policy: data.aggregationPolicy,
        aggregation_function: data.aggregationFunction,
        visualization_type: data.visualizationType,
        game: appContext.games.active.id,
        time_between: data.timeBetween,
        label_for_time: data.timeLabel,
        event_groups: data.events
          .filter((ev: any) => !!ev.event)
          .map((ev: any) => ({
            accessor: ev.accessor,
            value_policy: ev.valuePolicy,
            event: ev.event,
            label: ev.label,
            end_value: ev.endValue,
            start_value: ev.startValue,
            game: appContext.games.active.id,
          })),
      },
      isEdit,
      editId,
    )
      .then((res) => {
        if (res.created) {
          setRQModalOpened(false);
          setIsEdit(false);
          setEditId(undefined);
          getHypothesis(appContext.games.active.id).then((res: any) =>
            setHypothesis(res),
          );
        }

        setNewRQLoading(false);
      })
      .catch(() => setNewRQLoading(false));
  };

  const handleDeleteResearchQuestion = (id: string) => {
    deleteHypothesis(id).then((res: any) => {
      if (res.deleted)
        setHypothesis(hypothesis.filter((h: any) => h.id !== id));
      else message.error(res.message);
    });
  };

  const hypothesisTableColumns: ColumnType<any>[] = [
    {
      title: "Question",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <Link
          to=""
          onClick={() => {
            form.setFieldsValue(record);
            setRQModalOpened(true);
            setIsEdit(true);
            setEditId(record.id);
            setShowTimeBetween(record.events.length >= 2);
          }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value) => <p style={{ color: colorTextDescription }}>{value}</p>,
    },
    {
      title: "Measurement",
      dataIndex: "measurement",
      key: "measurement",
      align: "center",
      render: (value: keyof typeof Measurement) => (
        <Link to={"/" + value}>{Measurement[value]}</Link>
      ),
    },
    {
      title: "Uses Context",
      dataIndex: "usesContext",
      align: "center",
      key: "usesContext",
      render: (value, record) =>
        value ? (
          <Flex align="center" justify="center" gap={5}>
            <CheckCircleOutlined style={{ color: "green" }} />
            <span>Field:</span>
            <b>{record.contextAccessor}</b>
          </Flex>
        ) : (
          <CloseCircleOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Session Policy",
      dataIndex: "sessionPolicy",
      key: "sessionPolicy",
      render: (value: keyof typeof SessionPolicy) => SessionPolicy[value],
    },
    {
      title: "Aggregation Policy",
      dataIndex: "aggregationPolicy",
      key: "aggregationPolicy",
      align: "center",
      render: (value: keyof typeof AggregationPolicies) => (
        <p style={{ color: colorTextDescription }}>
          {AggregationPolicies[value]}
        </p>
      ),
    },
    {
      title: "Aggregation Function",
      dataIndex: "aggregationFunction",
      key: "aggregationFunction",
      align: "center",
      render: (value: keyof typeof Aggregations) => Aggregations[value],
    },
    {
      title: "Visualization",
      dataIndex: "visualizationType",
      key: "visualizationType",
      render: (value: keyof typeof Visualizations, record) => (
        <Link to={"/" + record.measurement}>{Visualizations[value]}</Link>
      ),
    },
    {
      align: "center",
      render: (_, record) => (
        <DeleteOutlined
          style={{ color: "red", fontSize: 20 }}
          onClick={() => handleDeleteResearchQuestion(record.id)}
        />
      ),
    },
  ];

  const EventGroupTable: FC<{ data: any[]; record: any }> = ({
    data,
    record,
  }) => {
    const columns: ColumnType<any>[] = [
      {
        title: "Event name",
        dataIndex: "event",
        key: "event",
        render: (value) =>
          events.find((ev: any) => ev.id === value)?.name || "",
      },
      { title: "Label", dataIndex: "label", key: "label" },
      { title: "Field", dataIndex: "accessor", key: "accessor" },
      {
        title: "Value Policy",
        dataIndex: "valuePolicy",
        key: "valuePolicy",
        render: (value: keyof typeof ValuePolicies) => ValuePolicies[value],
      },
      { title: "Start Value", dataIndex: "startValue", key: "startValue" },
      { title: "End Value", dataIndex: "endValue", key: "endValue" },
    ];

    return (
      <Flex vertical gap={10}>
        {record.timeBetween && (
          <Flex
            gap={10}
            style={{ color: colorTextDescription, marginBottom: 20 }}
          >
            <CheckCircleOutlined style={{ color: "green" }} />
            <span>Only time between these events is calculated</span>
          </Flex>
        )}
        <Table
          dataSource={data}
          columns={columns}
          size="small"
          rowKey="id"
        ></Table>
      </Flex>
    );
  };

  return (
    <Flex
      style={{
        height: contentHeight,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        padding: 24,
        fontSize: 20,
        color: colorTextDescription,
        position: "relative",
      }}
      align="center"
      vertical
    >
      <Button
        type="primary"
        style={{
          position: "absolute",
          left: 30,
          bottom: 30,
          zIndex: 100,
        }}
        onClick={() => {
          setRQModalOpened(true);
          setIsEdit(false);
          setEditId(undefined);
        }}
      >
        <Flex gap={5} align="center">
          <PlusCircleOutlined style={{ fontSize: 20 }} />
          <span>Add</span>
        </Flex>
      </Button>
      <Table
        dataSource={hypothesis}
        columns={hypothesisTableColumns}
        scroll={{ y: getRelativeContentHeight(230) }}
        expandable={{
          expandedRowRender: (record: any) => (
            <EventGroupTable data={record.events} record={record} />
          ),
        }}
        rowKey="id"
      />
      <Modal
        title="Define a new research question"
        width="85vw"
        height="90vh"
        open={rQModalOpened}
        footer={null}
        centered={true}
        onCancel={() => {
          setRQModalOpened(false);
          setIsEdit(false);
          setEditId(undefined);
        }}
      >
        <Form
          form={form}
          variant="outlined"
          style={{
            marginTop: 20,
            height: "calc(90vh - 2*20px - 24px)",
            overflow: "auto",
          }}
          onFinish={handleSaveResearchQuestion}
        >
          <Flex align="center" gap={20}>
            <Form.Item
              label="Research Question"
              name="name"
              rules={[{ required: true, message: "Name is required!" }]}
              style={{ minWidth: 500 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Measurement"
              name="measurement"
              style={{ minWidth: 400 }}
              rules={[{ required: true, message: "This field is required" }]}
            >
              <Select>
                {Object.keys(Measurement).map((k) => (
                  <Select.Option value={k} key={k}>
                    {Measurement[k as keyof typeof Measurement]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>
          <Form.Item
            label="Desctiption"
            name="description"
            rules={[{ required: true, message: "Description is required" }]}
            style={{ maxWidth: 500 }}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Divider />
          <Flex
            gap={10}
            style={{ color: colorTextDescription, marginBottom: 20 }}
          >
            <InfoCircleOutlined />
            <span>
              Represents what data is taken into account, if you want you can
              just use time between two event occurrences
            </span>
          </Flex>
          {showTimeBetween && (
            <Flex gap={20} align="center" style={{ marginBottom: 20 }}>
              <Form.Item
                name="timeBetween"
                valuePropName="checked"
                style={{ margin: 0 }}
              >
                <Checkbox
                  onChange={(e) => setTimeBetweenEnabled(e.target.checked)}
                >
                  Use time between events
                </Checkbox>
              </Form.Item>
              <Form.Item
                label="Label"
                name="timeLabel"
                style={{ maxWidth: 400, margin: 0 }}
              >
                <Input disabled={!timeBetweenEnabled} />
              </Form.Item>
            </Flex>
          )}
          <Form.List name="events">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Form.Item label="Event" key={field.key}>
                    <Flex gap={20}>
                      <Form.Item
                        name={[field.name, "event"]}
                        style={{ width: 250, marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Event name"
                          showSearch
                          filterOption={selectSearchHandler}
                          onChange={(value) =>
                            filterEventKeyOptions(value, field.name, "accessor")
                          }
                          options={events.map((e) => ({
                            label: e.name,
                            value: e.id,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "accessor"]}
                        style={{ width: 350, marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Event data key"
                          options={eventKeyOptions[field.name]}
                          disabled={timeBetweenEnabled}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "label"]}
                        style={{ width: 350, marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Event label"
                          disabled={timeBetweenEnabled}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "valuePolicy"]}
                        style={{ minWidth: 400, marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Value policy"
                          onChange={(value) =>
                            setEventValueDelimitersDisabled((prev) => {
                              const list = [...prev];
                              list[field.key] =
                                value !== "time" && value !== "time-sum";

                              return list;
                            })
                          }
                          disabled={timeBetweenEnabled}
                        >
                          {Object.keys(ValuePolicies).map((k) => (
                            <Select.Option value={k} key={k}>
                              {ValuePolicies[k as keyof typeof ValuePolicies]}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "startValue"]}
                        style={{ width: 350, marginBottom: 0 }}
                      >
                        <Input
                          placeholder="First occurence of event value"
                          disabled={
                            eventValueDelimitersDisabled[field.name] ||
                            timeBetweenEnabled
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "endValue"]}
                        style={{ width: 350, marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Last occurence of event value"
                          disabled={
                            eventValueDelimitersDisabled[field.name] ||
                            timeBetweenEnabled
                          }
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ fontSize: 24 }}
                      />
                    </Flex>
                  </Form.Item>
                ))}
                {fields.length < 2 && (
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={() => {
                        fields.length == 1 && setShowTimeBetween(true);
                        add();
                      }}
                      style={{ width: 150 }}
                      icon={<PlusOutlined />}
                    >
                      Add Event
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
          <Divider />
          <Flex gap={10} style={{ color: colorTextDescription }}>
            <InfoCircleOutlined />
            <span>Take into account context in which data is collected</span>
          </Flex>
          <Form.Item
            name="usesContext"
            valuePropName="checked"
            style={{ marginTop: 20 }}
          >
            <Checkbox>Use Context</Checkbox>
          </Form.Item>
          <Form.Item
            label="Context Key"
            name="contextAccessor"
            style={{ maxWidth: 400 }}
          >
            <Input />
          </Form.Item>
          <Divider />
          <Flex
            gap={10}
            style={{
              color: colorTextDescription,
              marginBottom: 20,
            }}
          >
            <InfoCircleOutlined />
            <span>
              How and in what way is data coming from the events is accumulated
              and shown
            </span>
          </Flex>
          <Flex align="center" gap={20}>
            <Form.Item
              label="Aggregation Policy"
              name="aggregationPolicy"
              style={{ minWidth: 400 }}
            >
              <Select
                onChange={(value) =>
                  setAggregationFunctionDisabled(value === "user")
                }
              >
                {Object.keys(AggregationPolicies).map((k) => (
                  <Select.Option value={k} key={k}>
                    {AggregationPolicies[k as keyof typeof AggregationPolicies]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Aggregation Function"
              name="aggregationFunction"
              style={{ minWidth: 400 }}
            >
              <Select disabled={aggregationFunctionDisabled}>
                {Object.keys(Aggregations).map((k) => (
                  <Select.Option value={k} key={k}>
                    {Aggregations[k as keyof typeof Aggregations]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>
          <Flex>
            <Form.Item
              label="Session Policy"
              name="sessionPolicy"
              style={{ minWidth: 400 }}
            >
              <Select>
                {Object.keys(SessionPolicy).map((k) => (
                  <Select.Option value={k} key={k}>
                    {SessionPolicy[k as keyof typeof SessionPolicy]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>
          <Form.Item
            label="Visualization Type"
            name="visualizationType"
            style={{ maxWidth: 400 }}
          >
            <Select>
              {Object.keys(Visualizations).map((k) => (
                <Select.Option value={k} key={k}>
                  {Visualizations[k as keyof typeof Visualizations]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="flex-end">
              <Button
                type="primary"
                htmlType="submit"
                disabled={newRQLoading}
                style={{ width: 75 }}
              >
                {newRQLoading ? (
                  <LoadingOutlined />
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};
