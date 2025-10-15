import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
   updateCategoryStatus
} from "../../features/Categories/categoiresSlice";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";

export default function Categories() {
  const dispatch = useDispatch();
  const { list: categories, loading } = useSelector((state) => state.categories);

  const [newCategory, setNewCategory] = useState({ name: "", status: "active" });
  const [search, setSearch] = useState("");
  const [editCategory, setEditCategory] = useState(null);

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    if (!newCategory.name.trim()) return;
    dispatch(addCategory(newCategory));
    setNewCategory({ name: "", status: "active" });
  };

  const handleUpdate = () => {
    if (!editCategory.name.trim()) return;
    dispatch(
      updateCategory({
        id: editCategory.id,
        data: { name: editCategory.name, status: editCategory.status },
      })
    );
    setEditCategory(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      dispatch(deleteCategory(id));
    }
  };

  // 🔹 Search + Pagination
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="">
      {/* Header */}
      <div className="flex bg-white shadow-md justify-between items-center mb-4 p-4 rounded-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📦 Category Manager
        </h1>
        {/* Search */}
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               transition duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 text-center gap-6">
        {/* Category Table */}
        <div className="col-span-2 bg-white shadow-md rounded-lg p-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              <table className="w-full  border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100  text-left">
                    <th className="p-2 text-center border">S/N</th>
                    <th className="p-2 text-center border">Name</th>
                    <th className="p-2 text-center border">Status</th>
                    <th className="p-2 text-center border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((cat, idx) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="p-2 border">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="p-2 border">{cat.name}</td>
                    <td className="p-2 border text-center">
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={cat.status.toLowerCase() === "active"}
      onChange={() =>
        dispatch(
          updateCategoryStatus({
            id: cat.id,
            status: cat.status.toLowerCase() === "active" ? "Inactive" : "Active",
          })
        )
      }
      className="sr-only peer"
    />
    <div
      className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none 
        peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
        peer-checked:after:border-white after:content-[''] after:absolute 
        after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
        peer-checked:bg-green-500"
    ></div>
  </label>
</td>



                      <td className="p-2 border">
                        <div className="flex gap-2 text-center justify-center">
                          <button
                            className="bg-green-500 p-2 rounded text-white"
                            onClick={() => setEditCategory(cat)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="bg-red-500 p-2 rounded text-white"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 🔹 Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Category Form */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} /> {editCategory ? "Edit Category" : "Add New Category"}
          </h2>

          <input
            type="text"
            placeholder="Enter category name"
            value={editCategory ? editCategory.name : newCategory.name}
            onChange={(e) =>
              editCategory
                ? setEditCategory({ ...editCategory, name: e.target.value })
                : setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="border rounded p-2 w-full mb-3"
          />

          {/* 🔹 Status Dropdown */}
          <select
            value={editCategory ? editCategory.status : newCategory.status}
            onChange={(e) =>
              editCategory
                ? setEditCategory({ ...editCategory, status: e.target.value })
                : setNewCategory({ ...newCategory, status: e.target.value })
            }
            className="border rounded p-2 w-full mb-3"
          >
            <option value="active">Active ✅</option>
            <option value="inactive">Inactive ❌</option>
          </select>

          {editCategory ? (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-2 bg-green-600 text-white rounded flex active:scale-105 active:bg-green-500 justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin active:scale-105 active:bg-green-500 w-5 h-5" />
                ) : (
                  "Update Category"
                )}
              </button>
              <button
                onClick={() => setEditCategory(null)}
                className="w-full py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded flex justify-center items-center"
            >
              {loading ? (
                <Loader2 className="animate-spin active:scale-105 active:bg-green-500 w-5 h-5" />
              ) : (
                "Save Category"
              )}
            </button>
          )}

          {/* Total Categories */}
          <div className="mt-6 p-4 bg-gray-50 rounded shadow-sm text-center">
            <p className="text-sm font-semibold text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
