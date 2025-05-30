"use client";
import { useEffect, useState } from "react";
import { Table, Tag, Spin, message } from "antd";
import dayjs from "dayjs";
import supabase from "@/app/utils/db";

const LogAttemptTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogAttempts = async () => {
    setLoading(true);
    try {
      let { data: logAttempts, error } = await supabase
        .from("log_attempt")
        .select("*")
        .order("times", { ascending: false }); // Urutkan dari terbaru

      if (error) throw error;
      setData(logAttempts);
    } catch (err) {
      message.error("Failed to retrieve login attempt log data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogAttempts();
  }, []);

  const clearLogAttempt = async () => {
    try {
      const { error } = await supabase
        .from("log_attempt")
        .delete()
        .neq("id", 0);

      if (error) throw error;
      console.log("✅ All of login attempt has been cleared.");
      return true;
    } catch (error) {
      console.error("❌ Failed to clearing login attempt:", error);
      return false;
    }
  };

  const ClearLogButton = () => {
    const [loading, setLoading] = useState(false);

    const handleClearLog = async () => {
      if (!confirm("Are you sure to clear activity logs?")) return;

      setLoading(true);
      const success = await clearLogAttempt();
      setLoading(false);

      if (success) {
        alert("✅ Login Attempt has been cleared!");
        fetchLogAttempts();
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
    // {
    //   title: "No",
    //   dataIndex: "no",
    //   key: "no",
    //   render: (text, record, index) => index + 1,
    // },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
    },
    {
      title: "Location",
      dataIndex: "locations",
      key: "locations",
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
  ];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Login Attemp Logs</h2>
        <ClearLogButton />
      </div>
      <Table
        columns={columns}
        dataSource={data}
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

export default LogAttemptTable;
