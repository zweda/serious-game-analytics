import { ColumnType } from "antd/es/table/interface";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { EditableCell } from "../components/EditableCell.tsx";

export const userTableColumns: ColumnType<any>[] = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    align: "center",
    render: (value) => <a href="">{value}</a>,
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
    title: "ID",
    key: "id",
    dataIndex: "id",
    align: "center",
    render: (value) => <a href="">{value}</a>,
  },
  {
    title: "Name",
    key: "name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    align: "center",
  },
  {
    title: "Number of Events",
    key: "count",
    dataIndex: "count",
    sorter: (a: any, b: any) => a.count - b.count,
    align: "center",
    render: (value) => <a href="">{value}</a>,
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
      <span>
        {tags &&
          tags.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
      </span>
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
  sum: "Sum of values of an accessor in a session",
  count: "Number of values of an accessor in a session",
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
};

export const AggregationPolicies = {
  "per-user": "Apply aggregation function per user",
  globally: "Apply aggregation function globally across users",
};

export const SessionPolicy = {
  "only-first": "Take into account only first session of a user",
  average: "Take averages of sessions for a users",
  each: "Count each session as individual run (for each session of each user)",
};

export const Measurement = {
  immersion: "Immersion",
  learning: "Learning",
  gameplay: "Gameplay",
  engagement: "Engagement",
};
