"use client";
import React, { useState, useEffect } from "react";
import supabase from "@/app/utils/db";
import { FiEdit } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/id";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Form,
  Drawer,
  Space,
  Row,
  Col,
  Button,
  Input,
  Select,
  notification,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import AdminLogActivity from "../AdminActivityLog";
import LogAttemptTable from "../ActivityLog/LoginFailed/Table";

dayjs.extend(localizedFormat);
dayjs.locale("id");

const ManageAccount = ({ itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [initialData, setInitialData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const router = useRouter();

  const [form] = useForm();
  const [editForm] = useForm();

  const formatTanggal = (tanggal) => {
    return dayjs(tanggal).format("D MMMM YYYY");
  };

  const getTodayDate = () => {
    return dayjs().format("YYYY-MM-DD");
  };

  const getHashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const fetchAccount = async () => {
    function getInitials(name) {
      const words = name.trim().split(/\s+/); // Pisahkan kata berdasarkan spasi
      if (words.length === 1) {
        return words[0][0].toUpperCase(); // Hanya 1 kata
      } else {
        return words[0][0].toUpperCase() + words[1][0].toUpperCase(); // Dua kata pertama
      }
    }

    try {
      const { data, error } = await supabase.from("users").select("*");
      const usersData = data.map((row, index) => ({
        id: row.id,
        name: row.name,
        username: row.username,
        email: row.email,
        role: row.role,
        provider: row.provider,
        status: row.status,
        since: formatTanggal(row.since),
        initials: getInitials(row.name),
        showMenu: row.role !== "Admin",
      }));
      setInitialData(usersData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const totalPages = Math.ceil(initialData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = initialData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [selectedMember, setSelectedMember] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleRoleClick = (id) => {
    setSelectedMember(id);
    setShowDropdown((prev) => !prev);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    // hideEditDrawer();
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const { data, error } = await supabase.from("users").insert([
        {
          name: values.name,
          username: values.username,
          email: values.email,
          password: getHashPassword(values.password),
          provider: "credentials",
          role: values.role,
          since: getTodayDate(),
          status: "Active",
        },
      ]);

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        fetchAccount();
      }
      onClose();
      form.resetFields();

      if (error) {
        notification.error({
          message: "Error",
          description: "Terjadi kesalahan saat menambah member",
          placement: "top",
          duration: 3,
        });
      } else {
        notification.success({
          message: "Berhasil",
          description: "Member baru berhasil ditambahkan",
          placement: "top",
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Error on submit data!");
      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat menambah member",
        placement: "top",
        duration: 3,
      });
    } finally {
      router.refresh();
    }
  };

  const showEditDrawer = (values) => {
    setEditDrawerOpen(true);

    editForm.setFieldsValue({
      id: values.id,
      name: values.name,
      username: values.username,
      email: values.email,
      role: values.role,
      status: values.status,
    });
  };

  const hideEditDrawer = () => {
    setEditDrawerOpen(false);
    editForm.resetFields();
  };

  const handleEdit = async (values) => {
    try {
      const updateData = {
        name: values.name,
        username: values.username,
        email: values.email,
        role: values.role,
        status: values.status,
      };

      if (values.password) {
        updateData.password = getHashPassword(values.password);
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", values.id);

      if (error) {
        throw new Error(error.message);
      }

      notification.success({
        message: "Berhasil",
        description: "Data member berhasil diperbarui",
        placement: "top",
        duration: 5,
      });

      hideEditDrawer();
      fetchAccount();
    } catch (err) {
      console.error("Error updating user:", err);

      notification.error({
        message: "Error",
        description: "Terjadi kesalahan saat memperbarui data member",
        placement: "top",
        duration: 3,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-700 bg-green-100";
      case "Inactive":
        return "text-red-700 bg-red-100";
      case "Invited":
        return "text-amber-700 bg-amber-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="space-y-4 max-w-5xl mx-auto">
        <div>
          <h2 className="text-lg font-medium">Team members</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Invite or manage your organisation's members.
          </p>
        </div>

        <div className="border rounded-lg h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Member List</h3>
            <button
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-white"
              onClick={showDrawer}
            >
              Add member
            </button>
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
              extra={<p className="text-lg font-bold">Add member</p>}
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
                      Cancel
                    </button>
                    <button
                      onClick={() => form.submit()}
                      type="button"
                      className="min-w-36 text-wrap rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                    >
                      Save
                    </button>
                  </Space>
                </div>
              }
            >
              <Form
                layout="vertical"
                onFinish={handleSubmit}
                form={form}
                initialValues={{ role: "Owner" }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[
                        {
                          required: true,
                          message: "Enter your full name",
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        id="name"
                        placeholder="Enter your full name"
                        style={{
                          minHeight: 40,
                          maxHeight: 40,
                        }}
                        className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        required
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[
                        {
                          required: true,
                          message: "Enter your username",
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        id="username"
                        placeholder="Enter your username"
                        style={{
                          minHeight: 40,
                          maxHeight: 40,
                        }}
                        className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        required
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {
                          required: true,
                          message: "Enter your email",
                        },
                      ]}
                    >
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        style={{
                          minHeight: 40,
                          maxHeight: 40,
                        }}
                        className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        required
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Enter your password",
                        },
                      ]}
                    >
                      <Input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        style={{
                          minHeight: 40,
                          maxHeight: 40,
                        }}
                        className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                        required
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="role"
                      label="Role"
                      rules={[
                        {
                          required: true,
                          message: "Select role",
                        },
                      ]}
                    >
                      <Select
                        className="custom-select w-full"
                        placeholder="Select role"
                        style={{ minHeight: 40 }}
                        options={[
                          { label: "Admin", value: "Admin" },
                          { label: "Owner", value: "Owner" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Drawer>
          </div>

          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {initialData.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-500"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.hasAvatar ? (
                          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            <img
                              src={`/api/placeholder/32/32`}
                              alt={member.name}
                              className="h-8 w-8"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                            {member.initials}
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="flex space-x-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                              {"(" + member.username + ")"}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-50">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium text-gray-600 dark:text-gray-400`}
                      >
                        {member.since}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {member.role !== "Admin" && (
                        <button
                          className="text-red-600 hover:text-red-900 pt-1"
                          onClick={() => {
                            showEditDrawer(member);
                          }}
                        >
                          <FiEdit size={20} />
                        </button>
                      )}
                      <Drawer
                        width={720}
                        onClose={hideEditDrawer}
                        open={editDrawerOpen}
                        styles={{
                          body: {
                            paddingBottom: 80,
                          },
                        }}
                        className="custom-drawer"
                        extra={<p className="text-lg font-bold">Add member</p>}
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
                                onClick={hideEditDrawer}
                                className="max-w-44 text-wrap rounded border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => editForm.submit()}
                                type="button"
                                className="min-w-36 text-wrap rounded border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring active:text-emerald-500 transition-colors"
                              >
                                Save
                              </button>
                            </Space>
                          </div>
                        }
                      >
                        <Form
                          layout="vertical"
                          onFinish={(values) =>
                            handleEdit({
                              ...values,
                              id: editForm.getFieldValue("id"),
                            })
                          }
                          form={editForm}
                          initialValues={editForm}
                        >
                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter your full name",
                                  },
                                ]}
                              >
                                <Input
                                  type="text"
                                  id="name"
                                  placeholder="Enter your full name"
                                  style={{
                                    minHeight: 40,
                                    maxHeight: 40,
                                  }}
                                  className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                                  required
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="username"
                                label="Username"
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter your username",
                                  },
                                ]}
                              >
                                <Input
                                  type="text"
                                  id="username"
                                  placeholder="Enter your username"
                                  style={{
                                    minHeight: 40,
                                    maxHeight: 40,
                                  }}
                                  className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                                  required
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter your email",
                                  },
                                ]}
                              >
                                <Input
                                  type="email"
                                  id="email"
                                  placeholder="Enter your email"
                                  style={{
                                    minHeight: 40,
                                    maxHeight: 40,
                                  }}
                                  className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                                  required
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="password"
                                label={
                                  <div className="flex items-center gap-2">
                                    Replace Password
                                    <Button
                                      type={isEditable ? "default" : "primary"}
                                      size="small"
                                      onClick={() =>
                                        setIsEditable((prev) => !prev)
                                      }
                                    >
                                      {isEditable
                                        ? "Disable Editing"
                                        : "Confirm Change"}
                                    </Button>
                                  </div>
                                }
                                rules={[
                                  {
                                    required: false,
                                    message: "Enter your password",
                                  },
                                ]}
                              >
                                <Input
                                  type="password"
                                  id="password"
                                  placeholder="Enter your password"
                                  disabled={!isEditable}
                                  style={{
                                    minHeight: 40,
                                    maxHeight: 40,
                                  }}
                                  className="custom-input w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                                  required
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="role"
                                label="Role"
                                rules={[
                                  {
                                    required: true,
                                    message: "Select role",
                                  },
                                ]}
                              >
                                <Select
                                  className="custom-select w-full"
                                  placeholder="Select role"
                                  style={{ minHeight: 40 }}
                                  options={[
                                    { label: "Admin", value: "Admin" },
                                    { label: "Owner", value: "Owner" },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                name="status"
                                label="Status"
                                rules={[
                                  {
                                    required: true,
                                    message: "Select status",
                                  },
                                ]}
                              >
                                <Select
                                  className="custom-select w-full"
                                  placeholder="Select status"
                                  style={{ minHeight: 40 }}
                                  options={[
                                    { label: "Active", value: "Active" },
                                    { label: "Disable", value: "Disable" },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </Drawer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          data={initialData}
        />
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  paginate,
  indexOfFirstItem,
  indexOfLastItem,
  data,
}) => {
  const generatePageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      pageNumbers.push(1);

      if (currentPage > 4) pageNumbers.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      pageNumbers.push(
        ...Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        )
      );

      if (currentPage < totalPages - 3) pageNumbers.push("...");

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between px-0 py-2 border-t border-gray-200">
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-center inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {generatePageNumbers().map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === "number" && paginate(number)}
            disabled={number === "..."}
            className={`text-center inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md ${
              currentPage === number
                ? "z-10 bg-blue-600 text-white border-blue-600"
                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            } ${number === "..." ? "cursor-default" : ""}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-center inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="text-xs hidden sm:block">
        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> -{" "}
        <span className="font-medium">
          {Math.min(indexOfLastItem, data.length)}
        </span>{" "}
        of <span className="font-medium">{data.length}</span> results
      </div>
    </div>
  );
};

export default ManageAccount;
