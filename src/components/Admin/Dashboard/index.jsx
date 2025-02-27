"use client";
import React, { useState, useEffect } from "react";
import supabase from "@/app/utils/db";
import AdminLogActivity from "@/components/Admin/AdminActivityLog";
import LogAttemptTable from "@/components/Admin/ActivityLog/LoginFailed/Table";
import LoginChart from "../UserLoginChart";

const DashboardAdmin = ({ itemsPerPage = 10 }) => {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialData, setInitialData] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAccount = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      const usersData = data.map((row, index) => ({
        key: row.id,
        no: index + 1 + ".",
        name: row.name,
        username: row.username,
        email: row.email,
        role: row.role,
        provider: row.provider,
        status: row.status,
      }));
      setInitialData(usersData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const columns = [
    { title: "No", key: "no" },
    { title: "Name", key: "name" },
    { title: "Username", key: "username" },
    { title: "Email", key: "email" },
    { title: "Role", key: "role" },
    { title: "Provider", key: "provider" },
    { title: "Status", key: "status" },
  ];

  useEffect(() => {
    fetchAccount();
  }, []);

  const totalPages = Math.ceil(initialData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = initialData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    mounted && (
      <div className="w-full space-y-4">
        <div>
          <LoginChart />
        </div>
        <div>
          <AdminLogActivity />
        </div>
        <div>
          <LogAttemptTable />
        </div>
      </div>
    )
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

export default DashboardAdmin;
