"use client";

import { useState, useEffect } from "react";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";

interface ICD {
  id: number;
  code: string;
  description: string;
}

export default function ICDPage() {
  // Initialize icds as an empty array to avoid the "not iterable" error
  const [icds, setIcds] = useState<ICD[]>([]);
  const [filteredIcds, setFilteredIcds] = useState<ICD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"code" | "description">("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    code: string;
    description: string;
  }>({
    code: "",
    description: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch ICDs
  useEffect(() => {
    fetchICDs();
  }, []);

  // Filter and sort ICDs
  useEffect(() => {
    try {
      // Check if icds is valid array before filtering
      if (!Array.isArray(icds)) {
        console.error("icds is not an array:", icds);
        setFilteredIcds([]);
        return;
      }

      let filtered = [...icds];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (icd) =>
            icd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icd.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortField === "code") {
          return sortDirection === "asc"
            ? a.code.localeCompare(b.code)
            : b.code.localeCompare(a.code);
        } else {
          return sortDirection === "asc"
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        }
      });

      setFilteredIcds(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } catch (err) {
      console.error("Error in filter effect:", err);
      setFilteredIcds([]);
    }
  }, [icds, searchTerm, sortField, sortDirection]);

  const fetchICDs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/icd");

      if (!response.ok) {
        throw new Error("Failed to fetch ICDs");
      }

      const result = await response.json();

      // Check if data.icds exists and is an array
      if (!result.data || !Array.isArray(result.data)) {
        console.error("Invalid ICD data format:", result);
        throw new Error("Invalid data format received from server");
      }

      setIcds(result.data);
    } catch (error) {
      console.error("Error fetching ICDs:", error);
      setError("Failed to load ICD data. Please try again.");
      toast.error("Gagal memuat data ICD");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: "code" | "description") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const startEdit = (icd: ICD) => {
    setEditingId(icd.id);
    setEditFormData({
      code: icd.code,
      description: icd.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/icd/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update ICD");
      }

      // Update local state
      setIcds((prevIcds) =>
        prevIcds.map((icd) =>
          icd.id === id ? { ...icd, ...editFormData } : icd
        )
      );

      setEditingId(null);
      toast.success("ICD berhasil diperbarui");
    } catch (error) {
      console.error("Error updating ICD:", error);
      toast.error("Gagal memperbarui ICD");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ICD ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/icd/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ICD");
      }

      // Update local state
      setIcds((prevIcds) => prevIcds.filter((icd) => icd.id !== id));
      toast.success("ICD berhasil dihapus");
    } catch (error) {
      console.error("Error deleting ICD:", error);
      toast.error("Gagal menghapus ICD");
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIcds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIcds.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderSortIcon = (field: "code" | "description") => {
    if (sortField !== field) return <FaSort className="inline ml-1" />;
    if (sortDirection === "asc") return <FaSortUp className="inline ml-1" />;
    return <FaSortDown className="inline ml-1" />;
  };

  // Render pagination
  const renderPagination = () => {
    const pageNumbers = [];

    // Determine page number range
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Ensure we always show 5 page numbers if possible
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-6">
        <nav className="flex items-center">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
          >
            &laquo;
          </button>

          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
          >
            &lt;
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-blue-100"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
          >
            &gt;
          </button>

          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
          >
            &raquo;
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 ">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Kode ICD</h1>
        <Link
          href="/icd/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Tambah ICD
        </Link>
      </div>

      {/* Search Box */}
      <div className="mb-6 relative">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Cari kode atau deskripsi ICD..."
            className="w-full bg-transparent outline-none text-black"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-3 text-gray-600">Memuat data ICD...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchICDs}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredIcds.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Tidak ada data ICD yang ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("code")}
                  >
                    Kode {renderSortIcon("code")}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("description")}
                  >
                    Deskripsi {renderSortIcon("description")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((icd, idx) => (
                  <tr key={icd.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + idx + 1}
                    </td>

                    {editingId === icd.id ? (
                      // Edit Mode
                      <>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="code"
                            value={editFormData.code}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1 text-black"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 py-1 text-black"
                            rows={2}
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleUpdate(icd.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Batal
                          </button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {icd.code}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {icd.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => startEdit(icd)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(icd.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="inline mr-1" /> Hapus
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {renderPagination()}

          {/* Info jumlah data */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            Menampilkan {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredIcds.length)} dari{" "}
            {filteredIcds.length} data
            {searchTerm && ` (filter: "${searchTerm}")`}
          </div>
        </>
      )}

      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
