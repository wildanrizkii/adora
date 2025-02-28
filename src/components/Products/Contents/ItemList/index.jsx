"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import supabase from "@/app/utils/db";
import { useRouter } from "next/navigation";
import {
  Tabs,
  Avatar,
  Card,
  Badge,
  Flex,
  Switch,
  Button,
  Progress,
  Col,
  DatePicker,
  Popconfirm,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Divider,
  List,
  Spin,
  Empty,
  Result,
  Table,
  notification,
} from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const ItemList = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [idMaterial, setIdMaterial] = useState("");
  const [initialData, setInitialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();

  const [addForm] = Form.useForm();

  const [editForm] = Form.useForm();

  const onClose = () => {
    setOpen(false);
    addForm.resetFields();
    hideEditDrawer();
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const showEditDrawer = (values) => {
    setIdMaterial(values.key);
    setEditDrawerOpen(true);

    editForm.setFieldsValue({
      id_material: values.key,
      namamaterial: values.nama,
    });
  };

  const hideEditDrawer = () => {
    setEditDrawerOpen(false);
    editForm.resetFields();
  };

  const handleEdit = async (values) => {
    try {
      const { data, error } = await supabase
        .from("material")
        .update({ nama: values.namamaterial })
        .eq("id_material", idMaterial);

      if (error) {
        notification.error({
          message: "Error",
          description: "Terjadi kesalahan saat mengubah material",
          placement: "top",
          duration: 3,
        });
        hideEditDrawer();
        fetchMaterial();
      } else {
        notification.success({
          message: "Berhasil",
          description: "Material berhasil diubah",
          placement: "top",
          duration: 5,
        });
        hideEditDrawer();
        fetchMaterial();
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat mengubah material",
        placement: "top",
        duration: 3,
      });
      hideEditDrawer();
      fetchMaterial();
    }
  };

  const handleDeleteMaterial = async (values) => {
    try {
      const { data, error } = await supabase
        .from("material")
        .delete()
        .eq("id_material", values);

      if (error) {
        notification.error({
          message: "Error",
          description: "Terjadi kesalahan saat menghapus material",
          placement: "top",
          duration: 3,
        });

        fetchMaterial();
      } else {
        notification.success({
          message: "Berhasil",
          description: "Material berhasil dihapus",
          placement: "top",
          duration: 5,
        });

        fetchMaterial();
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat menghapus material",
        placement: "top",
        duration: 3,
      });

      fetchMaterial();
    }
  };

  const suffix = (
    <SearchOutlined
      style={{
        fontSize: 16,
      }}
    />
  );

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      width: 54,
      key: "no",
      align: "center",
    },
    {
      title: "Item Name",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Edit",
      dataIndex: "edit",
      key: "Edit",
      width: 128,
      align: "center",
      render: (_, record) => (
        <div className="inline-flex overflow-hidden rounded-md border shadow-sm">
          <button
            className="inline-block border-e p-3 hover:bg-emerald-200 hover:dark:text-black focus:relative transition-colors"
            title="Ubah material"
            onClick={() => showEditDrawer(record)}
          >
            <EditOutlined />
          </button>

          <Popconfirm
            placement="bottomRight"
            cancelText="Batal"
            okText="Hapus"
            title="Konfirmasi"
            description="Anda yakin ingin menghapus material ini?"
            onConfirm={() => handleDeleteMaterial(record.key)}
            icon={
              <QuestionCircleOutlined
                style={{
                  color: "red",
                }}
              />
            }
          >
            <button
              className="inline-block p-3 hover:bg-red-200 hover:dark:text-black focus:relative transition-colors"
              title="Hapus material"
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const fetchMaterial = async () => {
    try {
      const { data, error } = await supabase.from("material").select("*");
      const materialData = data.map((row, index) => ({
        key: row.id_material,
        no: index + 1 + ".",
        nama: row.nama,
      }));
      setInitialData(materialData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      setFilteredData(initialData);
      return;
    }

    const filtered = initialData.filter((item) => {
      const nama = (item.nama || "-").toString();
      const searchValue = value.toString();

      return nama.toLowerCase().includes(searchValue.toLowerCase());
    });

    setFilteredData(filtered);
  };

  useEffect(() => {
    setFilteredData(initialData);
    fetchMaterial();
  }, []);

  useEffect(() => {
    setFilteredData(initialData);
  }, [initialData]);

  const handleSubmit = async (values) => {
    try {
      const { data, error } = await supabase.from("material").insert([
        {
          id_material: await supabase
            .from("material")
            .select("id_material", { count: "exact", head: true })
            .then((r) => r.count + 1),
          nama: values.namamaterial,
        },
      ]);
      if (error) {
        console.error("Error inserting data:", error);
      } else {
        fetchMaterial();
      }
      onClose();
      addForm.resetFields();

      if (error) {
        notification.error({
          message: "Error",
          description: "Terjadi kesalahan saat menambah material",
          placement: "top",
          duration: 3,
        });
      } else {
        notification.success({
          message: "Berhasil",
          description: "Material baru berhasil ditambahkan",
          placement: "top",
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Error on submit data!");
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat menambah material",
        placement: "top",
        duration: 3,
      });
    } finally {
      router.refresh();
    }
  };

  return (
    mounted && (
      <div className="max-w-screen-xl">
        <div className="space-y-4">
          <Drawer
            width={720}
            onClose={onClose}
            open={open}
            styles={{
              body: {
                paddingBottom: 80,
              },
            }}
            className="custom-drawer"
            extra={<p className="text-lg font-bold">Tambah Material</p>}
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "10px",
                }}
              >
                <Space>
                  <button
                    type="button"
                    onClick={onClose}
                    className="max-w-44 text-wrap rounded border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => addForm.submit()}
                    type="button"
                    className="min-w-36 text-wrap rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                  >
                    Simpan
                  </button>
                </Space>
              </div>
            }
          >
            <Form layout="vertical" onFinish={handleSubmit} form={addForm}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="namamaterial"
                    label="Nama Material"
                    rules={[
                      {
                        required: true,
                        message: "Isi field ini terlebih dahulu!",
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      id="namamaterial"
                      placeholder="Masukkan nomor part induk"
                      style={{
                        minHeight: 39,
                      }}
                      className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                      required
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Drawer>

          <Drawer
            width={720}
            onClose={() => hideEditDrawer()}
            open={editDrawerOpen}
            styles={{
              body: {
                paddingBottom: 80,
              },
            }}
            className="custom-drawer"
            extra={<p className="text-lg font-bold">Edit Material</p>}
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "10px",
                }}
              >
                <Space>
                  <button
                    type="button"
                    onClick={onClose}
                    className="max-w-44 text-wrap rounded border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => editForm.submit()}
                    type="button"
                    className="min-w-36 text-wrap rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                  >
                    Simpan
                  </button>
                </Space>
              </div>
            }
          >
            <Form layout="vertical" onFinish={handleEdit} form={editForm}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="namamaterial"
                    label="Nama Material"
                    rules={[
                      {
                        required: true,
                        message: "Isi field ini terlebih dahulu!",
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      id="namamaterial"
                      placeholder="Masukkan nama material"
                      style={{
                        minHeight: 39,
                      }}
                      className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                      required
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Drawer>
          <div>
            <div className="space-y-4">
              <button
                onClick={showDrawer}
                type="submit"
                className="max-w-44 text-wrap rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>

          <div>
            <Input
              placeholder="Search Item Name"
              size="large"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={suffix}
              className="custom-input bg-white dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <Flex gap="middle" vertical>
            <Table
              className="custom-table"
              columns={columns}
              dataSource={filteredData}
              pagination={{
                position: ["bottomCenter"],
                responsive: true,
              }}
              size="large"
              bordered={true}
              loading={loading}
              scroll={{ x: "max-content" }}
            />
          </Flex>
        </div>
      </div>
    )
  );
};

export default ItemList;
