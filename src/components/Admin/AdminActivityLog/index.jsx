import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import supabase from "@/app/utils/db";
import dayjs from "dayjs";

const AdminLogActivity = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("log_activity")
      .select("*")
      .order("times", { ascending: false });

    if (error) console.error("❌ Gagal mengambil log:", error);
    else setLogs(data);
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
      console.log("✅ Semua log aktivitas berhasil dihapus.");
      return true;
    } catch (error) {
      console.error("❌ Gagal menghapus log aktivitas:", error);
      return false;
    }
  };

  const ClearLogButton = () => {
    const [loading, setLoading] = useState(false);

    const handleClearLog = async () => {
      if (!confirm("Apakah Anda yakin ingin menghapus semua log aktivitas?"))
        return;

      setLoading(true);
      const success = await clearLogActivity();
      setLoading(false);

      if (success) {
        alert("✅ Semua log aktivitas telah dihapus!");
        fetchLogs();
      }
    };

    return (
      <button
        onClick={handleClearLog}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
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
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "User Agent",
      dataIndex: "user_agent",
      key: "user_agent",
      ellipsis: true,
    },
    {
      title: "Times",
      dataIndex: "times",
      key: "times",
      render: (text) => dayjs(text).format("DD MMM YYYY HH:mm"),
    },
  ];

  return (
    <div>
      <div className="flex justify-between ">
        <h2 className="text-lg font-semibold mb-4 items-center">
          📜 User Activity Logs
        </h2>
        <ClearLogButton />
      </div>

      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminLogActivity;
