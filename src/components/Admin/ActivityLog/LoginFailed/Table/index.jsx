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
      message.error("Gagal mengambil data log percobaan login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogAttempts();
  }, []);

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
    <Spin spinning={loading}>
      <div className="flex justify-between ">
        <h2 className="text-lg font-medium mb-4 items-center">
          Login Attemp Logs
        </h2>
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
      />
    </Spin>
  );
};

export default LogAttemptTable;
