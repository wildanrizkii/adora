"use client";
import React, { useState, useEffect } from "react";
import supabase from "@/app/utils/db";

const DashboardAdmin = ({ itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [initialData, setInitialData] = useState([]);

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
    <div className="w-full space-y-4">
      {/* Table Container with horizontal scroll on small screens */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          {/* Table Header */}
          <thead className="bg-white dark:bg-zinc-500 border-b-2">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 font-medium whitespace-nowrap"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white dark:bg-zinc-400 dark:hover:bg-zinc-500 hover:bg-zinc-100"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-gray-700">
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
