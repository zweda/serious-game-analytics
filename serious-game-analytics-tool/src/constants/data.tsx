import { ColumnType } from "antd/es/table/interface";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Flex, Tag } from "antd";
import { EditableCell } from "../components/EditableCell.tsx";
import { Link } from "react-router-dom";
import { copyToClipboard } from "../utils/tools.ts";
import { getColorForText } from "../utils";

export const userTableColumns: ColumnType<any>[] = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    align: "center",
    render: (value) => (
      <Link to="" onClick={() => copyToClipboard(value)}>
        {value}
      </Link>
    ),
  },
  {
    title: "Email",
    key: "email",
    dataIndex: "email",
    sorter: (a: any, b: any) => (a.email ? a.email.localeCompare(b.email) : -1),
    align: "center",
  },
  {
    title: "Age",
    key: "age",
    dataIndex: "age",
    sorter: (a: any, b: any) => (a.age ? a.age - b.age : -1),
    align: "center",
  },
  {
    title: "Gender",
    key: "gender",
    dataIndex: "gender",
    sorter: (a: any, b: any) =>
      a.gender ? a.gender.localeCompare(b.gender) : -1,
    align: "center",
    render: (value) => (value === "f" ? "Female" : "Male"),
  },
  {
    title: "OS",
    key: "os",
    dataIndex: "os",
    sorter: (a: any, b: any) => (a.os ? a.os.localeCompare(b.os) : -1),
    align: "center",
  },
  {
    title: "Region",
    key: "region",
    dataIndex: "region",
    sorter: (a: any, b: any) =>
      a.region ? a.region.localeCompare(b.region) : -1,
    align: "center",
  },
];

export const eventTableColumns: ColumnType<any>[] = [
  {
    title: "Name",
    key: "name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    align: "center",
    render: (value) => (
      <Link to="" onClick={() => copyToClipboard(value)}>
        {value}
      </Link>
    ),
  },
  {
    title: "Number of Events",
    key: "count",
    dataIndex: "count",
    sorter: (a: any, b: any) => a.count - b.count,
    align: "center",
    render: (value) => <p style={{ color: "green" }}>{value}</p>,
  },
  {
    title: "Event Fields",
    key: "fields",
    dataIndex: "fields",
    align: "center",
    render: (tags: string[]) => (
      <Flex wrap justify="center" gap={5}>
        {tags &&
          tags.map((tag) => (
            <Tag color={getColorForText(tag)} key={tag} style={{ margin: 0 }}>
              {tag.toUpperCase()}
            </Tag>
          ))}
      </Flex>
    ),
  },
  {
    title: "Enumeration",
    key: "action",
    dataIndex: "action",
    align: "center",
    render: (value) =>
      value ? (
        <CheckCircleOutlined style={{ color: "green" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "red" }} />
      ),
  },
  {
    title: "Discrete Values",
    key: "enum",
    dataIndex: "enum",
    align: "center",
    render: (tags: string[]) => (
      <Flex wrap justify="center" gap={5}>
        {tags &&
          tags.map((tag) => (
            <Tag color={getColorForText(tag)} key={tag} style={{ margin: 0 }}>
              {tag.toUpperCase()}
            </Tag>
          ))}
      </Flex>
    ),
  },
  {
    title: "Notes",
    key: "description",
    dataIndex: "description",
    sorter: (a: any, b: any) =>
      a.description ? a.description.localeCompare(b.description) : -1,
    align: "center",
    render: (value, record) => (
      <EditableCell
        value={value}
        name="description"
        url={`events/${record.id}`}
        record={{ name: record.name, game: record.game }}
      />
    ),
  },
];

export const ValuePolicies = {
  value: "Use value directly from accessor",
  count: "Number of event occurrences in a session",
  sum: "Sum of values of an accessor in a session",
  average: "Average of values of an accessor in a session",
  time: "Get elapsed time between start and end value of this event.",
  "time-sum":
    "Get sum of elapsed times between start and end value in a session ",
};

export const Visualizations = {
  scalar: "Scalar Value",
  scatter: "Scatter Plot",
  bar: "Bar Chart",
  line: "Line Plot",
  pie: "Pie Chart",
};

export const Aggregations = {
  sum: "Sum",
  count: "Count",
  average: "Average",
};

export const AggregationPolicies = {
  user: "No grouping",
  region: "Group by region",
  gender: "Group by gender",
  age: "Group by age",
  globally: "Apply aggregation function globally",
};

export const SessionPolicy = {
  first: "Take into account only first session of a user",
  each: "Count each session as individual run",
};

export const Measurement = {
  immersion: "Immersion",
  learning: "Learning",
  gameplay: "Gameplay",
  engagement: "Engagement",
};
