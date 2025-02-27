import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import supabase from "@/app/utils/db";
import dayjs from "dayjs";

const AdminLogActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("log_activity")
        .select("*")
        .order("times", { ascending: false });

      if (error) console.error("❌ Failed to fetch log: ", error);
      else setLogs(data);
    } catch (error) {
      console.error("Error while fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "text-indigo-700 bg-indigo-100";
      case "Owner":
        return "text-cyan-700 bg-cyan-100";
      case "Pending":
        return "text-sky-700 bg-sky-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const clearLogActivity = async () => {
    try {
      const { error } = await supabase
        .from("log_activity")
        .delete()
        .neq("id", 0);

      if (error) throw error;
      console.log("✅ All activity logs were successfully deleted..");
      return true;
    } catch (error) {
      console.error("❌ Failed to delete activity log:", error);
      return false;
    }
  };

  const ClearLogButton = () => {
    const [loading, setLoading] = useState(false);

    const handleClearLog = async () => {
      if (!confirm("Are you sure to clear activity logs?")) return;

      setLoading(true);
      const success = await clearLogActivity();
      setLoading(false);

      if (success) {
        alert("✅ Activity logs has been cleared!");
        fetchLogs();
      }
    };

    return (
      <button
        onClick={handleClearLog}
        className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Menghapus..." : "Clear Log"}
      </button>
    );
  };

  const columns = [
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${getRoleColor(
            role
          )}`}
        >
          {role}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "id_user",
      key: "id_user",
      // align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text) => (
        <Tag color={text === "Login" ? "blue" : "red"}>{text}</Tag>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Times",
      dataIndex: "times",
      key: "times",
      render: (text) => dayjs(text).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "User Agent",
      dataIndex: "user_agent",
      key: "user_agent",
      ellipsis: true,
    },
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
    },
  ];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">User Activity Logs</h2>
        <ClearLogButton />
      </div>

      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        className="custom-table"
        pagination={{
          position: ["bottomLeft"],
          responsive: true,
        }}
        bordered={true}
        scroll={{ x: "max-content" }}
        loading={loading}
      />
    </div>
  );
};

export default AdminLogActivity;
