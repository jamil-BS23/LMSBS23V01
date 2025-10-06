
import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import Pagination from "../../components/Pagination/Pagination";
import api from "../../config/api";

const PAGE_SIZE = 6;

function FilterBarCategories({ queryTitle, setQueryTitle, onReset }) {
  return (
    <section className="bg-white rounded-lg shadow border border-gray-200 mb-4 p-4 flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={queryTitle}
          onChange={(e) => setQueryTitle(e.target.value)}
          placeholder="Search by category name"
          className="w-64 rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="ml-auto inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        Reset
      </button>
    </section>
  );
}

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryTitle, setQueryTitle] = useState("");
  const [tablePage, setTablePage] = useState(1);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ title: "" });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  useEffect(() => {
    document.title = "Manage Categories";

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/categories/books/category/all");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = queryTitle.trim().toLowerCase();
    return categories.filter((c) =>
      !q || (c.category_title || c.title || "").toLowerCase().includes(q)
    );
  }, [categories, queryTitle]);

  const pageCategories = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, tablePage]);

  const clearFilters = () => {
    setQueryTitle("");
  };

  // ---------- Handlers ----------
  const handleOpenCreate = () => {
    setMode("create");
    setForm({ title: "" });
    setOpenModal(true);
  };

  const handleOpenEdit = (index) => {
    setMode("edit");
    setEditingIndex(index);
    setForm({ title: categories[index].category_title || categories[index].title });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Title is required");
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await api.post("/categories/books/category", {
          category_title: form.title,
        });
        setCategories((prev) => [...prev, res.data]);
      } else if (mode === "edit") {
        const category = categories[editingIndex];
        const res = await api.patch(
          `/categories/books/category/${category.category_id || category.id}`,
          { category_title: form.title }
        );
        setCategories((prev) =>
          prev.map((c, idx) => (idx === editingIndex ? res.data : c))
        );
      }
      setOpenModal(false);
    } catch (err) {
      console.error("Failed to save category:", err);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index) => {
    setPendingDeleteIndex(index);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const category = categories[pendingDeleteIndex];
    try {
      await api.delete(`/categories/books/category/${category.category_id || category.id}`);
      setCategories((prev) => prev.filter((_, idx) => idx !== pendingDeleteIndex));
      setConfirmOpen(false);
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading categories...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-sky-700 flex items-center gap-2">
          <span className="text-sky-500">📚</span> Manage Categories
        </h1>

        <FilterBarCategories
          queryTitle={queryTitle}
          setQueryTitle={setQueryTitle}
          onReset={clearFilters}
        />

        <button
          className="mb-4 inline-flex items-center gap-2 rounded-md bg-sky-500 text-white px-4 py-2 hover:bg-sky-600 shadow"
          onClick={handleOpenCreate}
        >
          <Plus size={16} /> Add Category
        </button>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-sky-100">
              <tr>
                <th className="px-4 py-3 border text-left">Category ID</th>
                <th className="px-4 py-3 border text-left">Category Title</th>
                <th className="px-4 py-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageCategories.map((c, idx) => (
                <tr
                  key={c.category_id || c.id}
                  className="hover:bg-sky-50 transition"
                >
                  <td className="px-4 py-2 border text-gray-600">
                    {c.category_id || c.id}
                  </td>
                  <td className="px-4 py-2 border font-medium">
                    {c.category_title || c.title}
                  </td>
                  <td className="px-4 py-2 border flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(categories.indexOf(c))}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1 hover:bg-blue-600"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(categories.indexOf(c))}
                      className="px-3 py-1 bg-red-500 text-white rounded-md flex items-center gap-1 hover:bg-red-600"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={tablePage}
            totalItems={filteredCategories.length}
            pageSize={PAGE_SIZE}
            onPageChange={setTablePage}
          />
        </div>

        {/* Add/Edit Modal */}
        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-sky-600">
                {mode === "create" ? "Add Category" : "Edit Category"}
              </h2>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Category Title"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 flex items-center gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Confirm Delete
              </h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this category?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





// // ManageCategory.jsx
// // ManageCategory.jsx

// // ManageCategory.jsx
// // src/pages/ManageCategory/ManageCategory.jsx

// import { useEffect, useState, useMemo } from "react";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Search,
//   Layers,
//   Loader2,
// } from "lucide-react";
// import api from "../../config/api";

// const PAGE_SIZE = 6;

// function FilterBarCategories({
//   queryTitle,
//   setQueryTitle,
//   onReset,
// }) {
//   return (
//     <section className="bg-white rounded-lg shadow border border-gray-200 mb-4">
//       <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
//         <div className="relative">
//           <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
//           <input
//             value={queryTitle}
//             onChange={(e) => setQueryTitle(e.target.value)}
//             placeholder="Search by category name"
//             className="w-64 rounded border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={onReset}
//           className="ml-auto inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
//         >
//           Reset
//         </button>
//       </div>
//     </section>
//   );
// }

// export default function ManageCategory() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [queryTitle, setQueryTitle] = useState("");
//   const [tablePage, setTablePage] = useState(1);

//   // Add/Edit modal
//   const [openModal, setOpenModal] = useState(false);
//   const [mode, setMode] = useState("create"); // create | edit
//   const [editingIndex, setEditingIndex] = useState(-1);
//   const [form, setForm] = useState({ title: "" });
//   const [saving, setSaving] = useState(false);

//   // Delete confirmation
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

//   useEffect(() => {
//     document.title = "Manage Categories";

//     const fetchCategories = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get("/categories/books/category/all");
//         setCategories(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         console.error("Failed to fetch categories:", err);
//         setError("Failed to fetch categories");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Filtered categories
//   const filteredCategories = useMemo(() => {
//     const q = queryTitle.trim().toLowerCase();
//     return categories.filter((c) =>
//       !q || (c.category_title || c.title || "").toLowerCase().includes(q)
//     );
//   }, [categories, queryTitle]);

//   const pageCategories = useMemo(() => {
//     const start = (tablePage - 1) * PAGE_SIZE;
//     return filteredCategories.slice(start, start + PAGE_SIZE);
//   }, [filteredCategories, tablePage]);

//   const clearFilters = () => {
//     setQueryTitle("");
//   };

//   // --------- Handlers ----------
//   const handleOpenCreate = () => {
//     setMode("create");
//     setForm({ title: "" });
//     setOpenModal(true);
//   };

//   const handleOpenEdit = (index) => {
//     setMode("edit");
//     setEditingIndex(index);
//     setForm({ title: categories[index].category_title || categories[index].title });
//     setOpenModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.title.trim()) return alert("Title is required");
//     setSaving(true);
//     try {
//       if (mode === "create") {
//         const res = await api.post("/categories/books/category", { category_title: form.title });
//         setCategories((prev) => [...prev, res.data]);
//       } else if (mode === "edit") {
//         const category = categories[editingIndex];
//         const res = await api.patch(`/categories/books/category/${category.category_id || category.id}`, { category_title: form.title });
//         setCategories((prev) =>
//           prev.map((c, idx) => (idx === editingIndex ? res.data : c))
//         );
//       }
//       setOpenModal(false);
//     } catch (err) {
//       console.error("Failed to save category:", err);
//       alert("Failed to save category");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (index) => {
//     setPendingDeleteIndex(index);
//     setConfirmOpen(true);
//   };

//   const confirmDelete = async () => {
//     const category = categories[pendingDeleteIndex];
//     try {
//       await api.delete(`/categories/books/category/${category.category_id || category.id}`);
//       setCategories((prev) => prev.filter((_, idx) => idx !== pendingDeleteIndex));
//       setConfirmOpen(false);
//     } catch (err) {
//       console.error("Failed to delete category:", err);
//       alert("Failed to delete category");
//     }
//   };

//   if (loading) return <p>Loading categories...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Manage Categories</h1>

//       <FilterBarCategories
//         queryTitle={queryTitle}
//         setQueryTitle={setQueryTitle}
//         onReset={clearFilters}
//       />

//       <button
//         className="mb-4 inline-flex items-center gap-2 rounded-md bg-sky-500 text-white px-4 py-2 hover:bg-sky-600"
//         onClick={handleOpenCreate}
//       >
//         <Plus size={16} /> Add Category
//       </button>

//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             <th className="border px-3 py-2 text-left">Title</th>
//             <th className="border px-3 py-2 text-left">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {pageCategories.map((c, idx) => (
//             <tr key={c.category_id || c.id}>
//               <td className="border px-3 py-2">{c.category_title || c.title}</td>
//               <td className="border px-3 py-2">
//                 <button
//                   className="mr-2 text-blue-500"
//                   onClick={() => handleOpenEdit(categories.indexOf(c))}
//                 >
//                   <Pencil size={16} />
//                 </button>
//                 <button
//                   className="text-red-500"
//                   onClick={() => handleDelete(categories.indexOf(c))}
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       {filteredCategories.length > PAGE_SIZE && (
//         <div className="mt-4 flex gap-2">
//           {Array.from({ length: Math.ceil(filteredCategories.length / PAGE_SIZE) }, (_, i) => (
//             <button
//               key={i}
//               className={`px-3 py-1 border ${tablePage === i + 1 ? "bg-sky-500 text-white" : ""}`}
//               onClick={() => setTablePage(i + 1)}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       {openModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <h2 className="text-xl font-semibold mb-4">{mode === "create" ? "Add Category" : "Edit Category"}</h2>
//             <input
//               className="w-full border px-3 py-2 mb-4"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               placeholder="Category Title"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 className="px-4 py-2 border rounded"
//                 onClick={() => setOpenModal(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-sky-500 text-white rounded"
//                 onClick={handleSave}
//                 disabled={saving}
//               >
//                 {saving ? <Loader2 className="animate-spin" /> : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation */}
//       {confirmOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
//             <p>Are you sure you want to delete this category?</p>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 className="px-4 py-2 border rounded"
//                 onClick={() => setConfirmOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-500 text-white rounded"
//                 onClick={confirmDelete}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
