

// src/pages/ManageCategory/ManageCategory.jsx

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Layers,
} from "lucide-react";
import api from "../../config/api";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import Pagination from "../../components/Pagination/Pagination";

const PAGE_SIZE = 6;

function FilterBarCategories({ queryTitle, setQueryTitle, onReset }) {
  return (
    <section className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-gray-400" />
        <input
          value={queryTitle}
          onChange={(e) => setQueryTitle(e.target.value)}
          placeholder="Search category..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
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

  // Add/Edit modal
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
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

  // Filtered categories
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

  // --------- Handlers ----------
  const handleOpenCreate = () => {
    setMode("create");
    setForm({ title: "" });
    setOpenModal(true);
  };

  const handleOpenEdit = (index) => {
    setMode("edit");
    setEditingIndex(index);
    setForm({
      title:
        categories[index].category_title || categories[index].title || "",
    });
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
          `/categories/books/category/${
            category.category_id || category.id
          }`,
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
      await api.delete(
        `/categories/books/category/${category.category_id || category.id}`
      );
      setCategories((prev) =>
        prev.filter((_, idx) => idx !== pendingDeleteIndex)
      );
      setConfirmOpen(false);
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading categories...
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={22} /> Manage Categories
          </h1>

          <button
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 text-white px-4 py-2 hover:bg-sky-600 shadow"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        <FilterBarCategories
          queryTitle={queryTitle}
          setQueryTitle={setQueryTitle}
          onReset={clearFilters}
        />

        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-sky-50">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageCategories.map((c, idx) => (
                <tr
                  key={c.category_id || c.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2 font-medium">
                    {c.category_id || c.id}
                  </td>
                  <td className="border px-4 py-2">
                    {c.category_title || c.title}
                  </td>
                  <td className="border px-4 py-2 flex items-center gap-3">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                      onClick={() =>
                        handleOpenEdit(categories.indexOf(c))
                      }
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                      onClick={() => handleDelete(categories.indexOf(c))}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={tablePage}
            totalItems={filteredCategories.length}
            pageSize={PAGE_SIZE}
            onPageChange={setTablePage}
          />
        </div>

        {/* Add/Edit Modal */}
        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {mode === "create" ? "Add Category" : "Edit Category"}
              </h2>
              <input
                className="w-full border rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="Category Title"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this category?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




// // UploadBookPage.jsx
// import { useState, useEffect } from "react";
// import {
//   CalendarDays,
//   Upload,
//   Users,
//   BookOpen,
//   HelpCircle,
//   LogOut,
//   Image as ImageIcon,
//   FileText,
//   FileAudio,
//   Loader2,
//   CheckCircle2,
//   PartyPopper,
//   X,
//   HandHeart,
// } from "lucide-react";
// import UserSidebar from "../UserSidebar/UserSidebar";
// import axios from "axios";
// export default function UploadBookPage() {
//   const initialBookData = {
//     title: "",
//     mainCategory: "",
//     quantity: 1,
//     author: "",
//     bsEmail: "", 
//     bsIdNo: "", 
//     description: "",
//   };

//   const [bookData, setBookData] = useState(initialBookData);

//   // Upload states (logic unchanged)
//   const [coverPreview, setCoverPreview] = useState(null);
//   const [pdfSelected, setPdfSelected] = useState(false);
//   const [audioSelected, setAudioSelected] = useState(false);

//   const [loadingCover, setLoadingCover] = useState(false);
//   const [loadingPDF, setLoadingPDF] = useState(false);
//   const [loadingAudio, setLoadingAudio] = useState(false);

//   const [files, setFiles] = useState({
//     cover: null,
//     pdf: null,
//     audio: null,
//   });

//   // Success Popup
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setBookData((prev) => ({ ...prev, [name]: value }));
//   };

//   const simulateDelay = (ms = 3000) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   // ==== Upload logic (kept exactly the same) ====
//   const handleCoverUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingCover(true);
//     setFiles((prev) => ({ ...prev, cover: file }));
//     await simulateDelay(3000);
//     const url = URL.createObjectURL(file);
//     setCoverPreview(url);
//     setLoadingCover(false);
//   };

//   const handlePDFUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingPDF(true);
//     setFiles((prev) => ({ ...prev, pdf: file }));
//     await simulateDelay(3000);
//     setPdfSelected(true);
//     setLoadingPDF(false);
//   };

//   const handleAudioUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingAudio(true);
//     setFiles((prev) => ({ ...prev, audio: file }));
//     await simulateDelay(3000);
//     setAudioSelected(true);
//     setLoadingAudio(false);
//   };
//   // ==== /Upload logic ====

//   // Helper: reset the form so user can fill up again (also resets stepper colors)
//   const resetForm = () => {
//     // revoke any object URL to avoid leaks
//     if (coverPreview) URL.revokeObjectURL(coverPreview);
//     setBookData(initialBookData);
//     setFiles({ cover: null, pdf: null, audio: null });
//     setCoverPreview(null);
//     setPdfSelected(false);
//     setAudioSelected(false);
//     setLoadingCover(false);
//     setLoadingPDF(false);
//     setLoadingAudio(false);
//   };

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   const payload = {
//   //     ...bookData,
//   //     hasCoverImage: !!files.cover,
//   //     hasPDF: !!files.pdf,
//   //     hasAudio: !!files.audio,
//   //   };
//   //   console.log("Book submitted:", payload, files);

//   //   // Optional: save a simple history entry (so “fill up history” can refresh elsewhere if you read it)
//   //   try {
//   //     const history = JSON.parse(localStorage.getItem("donationHistory") || "[]");
//   //     history.push({
//   //       ...payload,
//   //       createdAt: new Date().toISOString(),
//   //       files: {
//   //         cover: files.cover?.name || null,
//   //         pdf: files.pdf?.name || null,
//   //         audio: files.audio?.name || null,
//   //       },
//   //     });
//   //     localStorage.setItem("donationHistory", JSON.stringify(history));
//   //   } catch {}

//   //   // Show popup
//   //   setShowSuccess(true);

//   //   // Auto close + auto reset after a few seconds so the form is ready to fill again
//   //   setTimeout(() => {
//   //     setShowSuccess(false);
//   //     resetForm();
//   //     // If you prefer a hard refresh instead, uncomment:
//   //     // window.location.reload();
//   //   }, 2500);
//   // };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//     const fieldMapping = {
//       mainCategory: "category",
//       quantity: "copies",
//       bsEmail: "email",
//       bsIdNo: "BS_ID",
//     };

//   const formData = new FormData();
//   for (const [key, value] of Object.entries(bookData)) {
//       if (value !== undefined && value !== null) {
//         const mappedKey = fieldMapping[key] || key;
//         formData.append(mappedKey, value);
//       }
//     }
//   if (files.cover) formData.append("file", files.cover);

//   try {
//     const token = localStorage.getItem("token");
//     const res = await axios.post("http://localhost:8000/donation_books/", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     console.log("Donation success:", res.data);
//     setShowSuccess(true);
//     setTimeout(() => {
//       setShowSuccess(false);
//       resetForm();
//     }, 2500);
//   } catch (err) {
//     console.error("Donation failed:", err);
//     alert("Failed to upload donation. Please try again.");
//   }
// };


//   // ------ Stepper derived states (your rules) ------
//   // Step 1 completes when BS ID No is filled
//   const detailsComplete = Boolean(String(bookData.bsIdNo || "").trim().length > 0);
//   // Step 2 completes when AUDIO is uploaded
//   const uploadsComplete = Boolean(files.audio || audioSelected);
//   // -------------------------------------------------

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar (kept) */}
//       <UserSidebar />

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//          <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
//               <HandHeart className="text-sky-500" size={24} />
//               Donation Book
//             </h1>
//           </div>
//           <p className="text-sm text-gray-600 mb-8">
//             Fill in the details below to add a new book to the library database.
//           </p>
//           </div>

//           {/* Stepper */}
//           <div className="mt-6">
//             <div className="flex items-center gap-3 text-[10px] sm:text-xs">
//               {/* Step 1 */}
//               <div className="flex items-center gap-2">
//                 <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white grid place-items-center font-semibold">
//                   1
//                 </span>
//                 <span className="font-medium text-gray-800">Book Details</span>
//               </div>

//               {/* Line 1: ash -> sky when BS ID No is filled */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     detailsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 2 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "bg-sky-600"
//                         : "bg-rose-600"
//                       : "bg-gray-300"
//                   }`}
//                 >
//                   2
//                 </span>
//                 <span
//                   className={`font-medium transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "text-gray-800"
//                         : "text-rose-600"
//                       : "text-gray-400"
//                   }`}
//                 >
//                   Upload Files
//                 </span>
//               </div>

//               {/* Line 2: ash -> sky after AUDIO is uploaded */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     uploadsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 3 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     uploadsComplete ? "bg-sky-600" : "bg-gray-300"
//                   }`}
//                 >
//                   3
//                 </span>
//                 <span
//                   className={`font-medium ${
//                     uploadsComplete ? "text-gray-800" : "text-gray-400"
//                   }`}
//                 >
//                   Review & Confirm
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="mt-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* LEFT SECTION — Book Details */}
//               <div className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-sm font-semibold text-gray-800">Book Details</h2>
//                   <div className="hidden sm:flex items-center gap-2 text-[11px]">
//                     <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 px-2 py-0.5">
//                       <ImageIcon size={12} />
//                       Cover
//                     </span>
//                     <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2 py-0.5">
//                       <FileText size={12} />
//                       PDF
//                     </span>
//                     <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
//                       <FileAudio size={12} />
//                       Audio
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Book Title
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="e.g.,Book Title"
//                     value={bookData.title}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category / Genre
//                     </label>
//                     <input
//                       type="text"
//                       name="mainCategory"
//                       placeholder="e.g.,Software Engineering"
//                       value={bookData.mainCategory}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Quantity Available
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       step="1"
//                       name="quantity"
//                       placeholder="e.g.,3"
//                       value={bookData.quantity}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Author Name
//                   </label>
//                   <input
//                     type="text"
//                     name="author"
//                     placeholder="e.g.,Author Name"
//                     value={bookData.author}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div>

//                 {/* BS Email & BS ID No */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       BS Email
//                     </label>
//                     <input
//                       type="email"
//                       name="bsEmail"
//                       placeholder="e.g., user@brainstation-23.com"
//                       value={bookData.bsEmail}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       BS ID No <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="bsIdNo"
//                       placeholder="e.g., BS-0000"
//                       value={bookData.bsIdNo}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                     <p
//                       className={`mt-1 text-xs ${
//                         detailsComplete ? "text-sky-600" : "text-gray-400"
//                       }`}
//                     >
//                       {detailsComplete
//                         ? "Step 1 completed ✓"
//                         : "Fill BS ID No to complete Step 1"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Book ID No */}
//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Book ID No
//                   </label>
//                   <input
//                     type="text"
//                     name="bookIdNo"
//                     placeholder="e.g., BK-000123"
//                     value={bookData.bookIdNo}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div> */}

//                 <div>
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Description <span className="text-gray-400 font-normal">(Optional)</span>
//                     </label>
//                     <span className="text-xs text-gray-400">
//                       {bookData.description?.length || 0}/600
//                     </span>
//                   </div>
//                   <textarea
//                     name="description"
//                     rows="4"
//                     placeholder="Add a short summary, edition info, condition notes, etc."
//                     value={bookData.description}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     maxLength={600}
//                   />
//                 </div>
//               </div>

//               {/* RIGHT SECTION — Upload Files */}
//               <div className="space-y-4">
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
//                   <h2 className="text-sm font-semibold text-gray-800">Upload Files</h2>

//                   {/* Cover Image Upload */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">Cover image upload</p>

//                     {!coverPreview && !loadingCover && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose image
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleCoverUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(JPG/PNG)</span>
//                       </p>
//                     )}

//                     {loadingCover && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading cover…</span>
//                       </div>
//                     )}

//                     {coverPreview && !loadingCover && (
//                       <div className="flex flex-col items-center gap-2">
//                         <img
//                           src={coverPreview}
//                           alt="Cover preview"
//                           className="w-28 h-36 object-cover rounded shadow"
//                         />
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <ImageIcon size={18} />
//                           <span className="text-sm">Image uploaded</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* PDF File Upload */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">PDF file upload</p>

//                     {!pdfSelected && !loadingPDF && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose PDF
//                           <input
//                             type="file"
//                             accept="application/pdf"
//                             onChange={handlePDFUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(Max ~50MB)</span>
//                       </p>
//                     )}

//                     {loadingPDF && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading PDF…</span>
//                       </div>
//                     )}

//                     {pdfSelected && !loadingPDF && (
//                       <div className="flex flex-col items-center gap-2 text-gray-700">
//                         <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100">
//                           <FileText className="text-rose-600" size={28} />
//                         </span>
//                         <span className="text-sm font-medium text-rose-700">
//                           PDF uploaded {files?.pdf?.name ? `• ${files.pdf.name}` : ""}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Audio Clip Upload (completes Step 2) */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">
//                       Audio clip upload <span className="text-rose-500">*</span>
//                     </p>

//                     {!audioSelected && !loadingAudio && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose audio
//                           <input
//                             type="file"
//                             accept="audio/*"
//                             onChange={handleAudioUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(MP3/WAV)</span>
//                       </p>
//                     )}

//                     {loadingAudio && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading audio…</span>
//                       </div>
//                     )}

//                     {audioSelected && !loadingAudio && (
//                       <div className="flex flex-col items-center gap-2 text-gray-700">
//                         <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
//                           <FileAudio className="text-indigo-600" size={28} />
//                         </span>
//                         <span className="text-sm font-medium text-indigo-700">
//                           Audio uploaded {files?.audio?.name ? `• ${files.audio.name}` : ""}
//                         </span>
//                         <p className="text-xs text-sky-600">Step 2 completed ✓</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                     <button
//                       type="button"
//                       className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
//                       onClick={resetForm}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-medium"
//                     >
//                       Confirm Book
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>

//           {/* Donation Guidelines */}
//           <div className="mt-8">
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//               <h3 className="text-sm font-semibold text-gray-800 mb-4">
//                 Donation Guidelines
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-emerald-700">Include (Good to Have)</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Original, legally shareable content you own or have rights to donate.</li>
//                     <li>Clear title, author, category/genre, and approximate quantity.</li>
//                     <li>Short description (edition, language, condition, highlights).</li>
//                     <li>High-quality cover image (JPG/PNG) for catalog visibility.</li>
//                     <li>Optional PDF and/or short audio sample (intro, synopsis, author note).</li>
//                   </ul>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-rose-700">Do Not Include</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Pirated or copyrighted material without explicit permission.</li>
//                     <li>Broken files, password-protected PDFs, or corrupted audio.</li>
//                     <li>Offensive or illegal content.</li>
//                     <li>Blurry/low-resolution covers that make the book hard to identify.</li>
//                     <li>Personal data inside files (IDs, phone numbers, addresses, etc.).</li>
//                   </ul>
//                 </div>
//               </div>

//               <div className="mt-4 text-xs text-gray-500">
//                 By submitting, you confirm the content complies with all applicable laws and you have
//                 the right to donate and distribute it.
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Animated Success Popup */}
//       {showSuccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           {/* Backdrop */}
//           <div className="absolute inset-0 bg-black/40 animate-fade-in" />

//           {/* Card */}
//           <div
//             className="
//               relative z-10 w-[92%] sm:w-[86%] md:w-[90%] max-w-md rounded-2xl bg-white shadow-xl
//               px-6 py-8 text-center
//               transition-all duration-300 ease-out
//               opacity-100 scale-100
//               animate-[pop_0.28s_ease-out]
//             "
//           >
//             <button
//               className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
//               onClick={() => setShowSuccess(false)}
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>

//             <div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
//               <CheckCircle2 className="text-emerald-600" size={36} />
//             </div>

//             <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
//               Book Uploaded Successfully
//               <PartyPopper className="text-amber-500 animate-bounce" size={20} />
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               Your book information and files have been recorded.
//             </p>
//           </div>

//           {/* Tiny CSS keyframes for pop + backdrop fade */}
//           <style>{`
//             @keyframes pop {
//               0% { transform: scale(0.9); opacity: 0; }
//               100% { transform: scale(1); opacity: 1; }
//             }
//             .animate-fade-in {
//               animation: fade-in 0.25s ease-out forwards;
//             }
//             @keyframes fade-in {
//               from { opacity: 0; }
//               to { opacity: 1; }
//             }
//           `}</style>
//         </div>
//       )}
//     </div>
//   );
// }










// // src/components/Upload/UploadBookPage.jsx
// import { useState } from "react";
// import api from "../../config/api";            // ✅ use shared axios instance
// import {
//   Image as ImageIcon,
//   FileText,
//   FileAudio,
//   Loader2,
//   CheckCircle2,
//   PartyPopper,
//   X,
//   HandHeart,
// } from "lucide-react";
// import UserSidebar from "../UserSidebar/UserSidebar";

// export default function UploadBookPage() {
//   const initialBookData = {
//     title: "",
//     author: "",
//     mainCategory: "",
//     categoryId: "",
//     quantity: "",
//     description: "",
//     bsEmail: "",
//     bsIdNo: "",
//     bookIdNo: "",
//   };

//   const [bookData, setBookData] = useState(initialBookData);
//   const [coverPreview, setCoverPreview] = useState(null);
//   const [pdfSelected, setPdfSelected] = useState(false);
//   const [audioSelected, setAudioSelected] = useState(false);
//   const [loadingCover, setLoadingCover] = useState(false);
//   const [loadingPDF, setLoadingPDF] = useState(false);
//   const [loadingAudio, setLoadingAudio] = useState(false);
//   const [files, setFiles] = useState({ cover: null, pdf: null, audio: null });
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setBookData((prev) => ({ ...prev, [name]: value }));
//   };

//   const simulateDelay = (ms = 3000) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   const handleCoverUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingCover(true);
//     setFiles((p) => ({ ...p, cover: file }));
//     await simulateDelay();
//     setCoverPreview(URL.createObjectURL(file));
//     setLoadingCover(false);
//   };
//   const handlePDFUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingPDF(true);
//     setFiles((p) => ({ ...p, pdf: file }));
//     await simulateDelay();
//     setPdfSelected(true);
//     setLoadingPDF(false);
//   };
//   const handleAudioUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingAudio(true);
//     setFiles((p) => ({ ...p, audio: file }));
//     await simulateDelay();
//     setAudioSelected(true);
//     setLoadingAudio(false);
//   };

//   const resetForm = () => {
//     if (coverPreview) URL.revokeObjectURL(coverPreview);
//     setBookData(initialBookData);
//     setFiles({ cover: null, pdf: null, audio: null });
//     setCoverPreview(null);
//     setPdfSelected(false);
//     setAudioSelected(false);
//   };

//   // ✅ Updated submit to call your FastAPI donation endpoint
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append("book_title", bookData.title);
//       formData.append("category_title", bookData.mainCategory);
//       formData.append("category_id", bookData.categoryId);
//       formData.append("book_author", bookData.author);
//       formData.append("BS_mail", bookData.bsEmail);
//       formData.append("BS_ID", bookData.bsIdNo);
//       formData.append("book_detail", bookData.description);
//       formData.append("book_count", bookData.quantity);
//       if (files.cover) formData.append("book_photo", files.cover);
//       if (files.pdf) formData.append("book_pdf", files.pdf);
//       if (files.audio) formData.append("book_audio", files.audio);

//       const token = localStorage.getItem("access_token");
//       await api.put("/donation/", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       });

//       setShowSuccess(true);
//       setTimeout(() => {
//         setShowSuccess(false);
//         resetForm();
//       }, 2500);
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Failed to upload book. Please check your login/token.");
//     }
//   };

//   const detailsComplete = Boolean(bookData.bsIdNo.trim());
//   const uploadsComplete = Boolean(files.audio || audioSelected);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <UserSidebar />
//       <main className="flex-1 p-4 sm:p-6 md:p-10">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
//               <HandHeart className="text-sky-500" size={24} />
//               Donation Book
//             </h1>
//           </div>
//           <p className="text-sm text-gray-600 mb-8">
//             Fill in the details below to add a new book to the library database.
//           </p>

//           {/* --- FORM --- */}
//           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* left side fields */}
//             <div className="space-y-4 bg-white rounded-xl border p-4">
//               <div>
//                 <label className="block text-sm font-medium">Book Title</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={bookData.title}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Category Title</label>
//                 <input
//                   type="text"
//                   name="mainCategory"
//                   value={bookData.mainCategory}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Category ID</label>
//                 <input
//                   type="text"
//                   name="categoryId"
//                   value={bookData.categoryId}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Quantity</label>
//                 <input
//                   type="number"
//                   name="quantity"
//                   value={bookData.quantity}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Author Name</label>
//                 <input
//                   type="text"
//                   name="author"
//                   value={bookData.author}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">BS Email</label>
//                 <input
//                   type="email"
//                   name="bsEmail"
//                   value={bookData.bsEmail}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">BS ID</label>
//                 <input
//                   type="text"
//                   name="bsIdNo"
//                   value={bookData.bsIdNo}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Description</label>
//                 <textarea
//                   name="description"
//                   rows="4"
//                   value={bookData.description}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md bg-gray-50"
//                 />
//               </div>
//             </div>

//             {/* right side uploads */}
//             <div className="space-y-4 bg-white rounded-xl border p-4">
//               {/* Cover Image */}
//               <div className="flex flex-col relative">
//                 <label className="text-sm font-semibold mb-2">Cover Image</label>
//                 <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-sky-400 hover:bg-sky-50 transition">
//                   {coverPreview ? (
//                     <img
//                       src={coverPreview}
//                       alt="Preview"
//                       className="rounded-lg shadow-md max-h-48 object-cover"
//                     />
//                   ) : (
//                     <div className="flex flex-col items-center text-gray-500 pointer-events-none">
//                       <ImageIcon size={40} className="mb-2 text-sky-500" />
//                       <p className="text-sm">Drag & drop or click to upload</p>
//                     </div>
//                   )}
//                   {/* file input now only fills this drop-zone */}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleCoverUpload}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-semibold mb-2">PDF File</label>
//                 <label className="flex items-center justify-between w-full border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition">
//                   <div className="flex items-center space-x-2 text-gray-700">
//                     <FileText className="text-rose-500" size={22} />
//                     <span className="text-sm">
//                       {pdfSelected ? files.pdf?.name : "Choose a PDF file"}
//                     </span>
//                   </div>
//                   <input
//                     type="file"
//                     accept="application/pdf"
//                     onChange={handlePDFUpload}
//                     className="hidden"
//                   />
//                 </label>
//               </div>

//               <div className="flex flex-col">
//                 <label className="text-sm font-semibold mb-2">Audio Clip *</label>
//                 <label className="flex items-center justify-between w-full border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition">
//                   <div className="flex items-center space-x-2 text-gray-700">
//                     <FileAudio className="text-emerald-500" size={22} />
//                     <span className="text-sm">
//                       {audioSelected ? files.audio?.name : "Choose an audio file"}
//                     </span>
//                   </div>
//                   <input
//                     type="file"
//                     accept="audio/*"
//                     onChange={handleAudioUpload}
//                     className="hidden"
//                   />
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
//               >
//                 Confirm Book
//               </button>
//             </div>

            
//           </form>
//         </div>
//       </main>

//       {/* success popup */}
//       {showSuccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/40" />
//           <div className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white shadow-xl px-6 py-8 text-center">
//             <button
//               className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
//               onClick={() => setShowSuccess(false)}
//             >
//               <X size={18} />
//             </button>
//             <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
//               <CheckCircle2 className="text-emerald-600" size={36} />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
//               Book Uploaded Successfully
//               <PartyPopper className="text-amber-500" size={20} />
//             </h3>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// // UploadBookPage.jsx
// import { useState, useEffect } from "react";
// import {
//   CalendarDays,
//   Upload,
//   Users,
//   BookOpen,
//   HelpCircle,
//   LogOut,
//   Image as ImageIcon,
//   FileText,
//   FileAudio,
//   Loader2,
//   CheckCircle2,
//   PartyPopper,
//   X,
//   HandHeart,
// } from "lucide-react";
// import UserSidebar from "../UserSidebar/UserSidebar";

// export default function UploadBookPage() {
//   const initialBookData = {
//     title: "",
//     author: "",
//     // input-based category
//     mainCategory: "",
//     quantity: "",
//     description: "",
//     // Added
//     bsEmail: "",
//     bsIdNo: "",
//     bookIdNo: "",
//   };

//   const [bookData, setBookData] = useState(initialBookData);

//   // Upload states (logic unchanged)
//   const [coverPreview, setCoverPreview] = useState(null);
//   const [pdfSelected, setPdfSelected] = useState(false);
//   const [audioSelected, setAudioSelected] = useState(false);

//   const [loadingCover, setLoadingCover] = useState(false);
//   const [loadingPDF, setLoadingPDF] = useState(false);
//   const [loadingAudio, setLoadingAudio] = useState(false);

//   const [files, setFiles] = useState({
//     cover: null,
//     pdf: null,
//     audio: null,
//   });

//   // Success Popup
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setBookData((prev) => ({ ...prev, [name]: value }));
//   };

//   const simulateDelay = (ms = 3000) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   // ==== Upload logic (kept exactly the same) ====
//   const handleCoverUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingCover(true);
//     setFiles((prev) => ({ ...prev, cover: file }));
//     await simulateDelay(3000);
//     const url = URL.createObjectURL(file);
//     setCoverPreview(url);
//     setLoadingCover(false);
//   };

//   const handlePDFUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingPDF(true);
//     setFiles((prev) => ({ ...prev, pdf: file }));
//     await simulateDelay(3000);
//     setPdfSelected(true);
//     setLoadingPDF(false);
//   };

//   const handleAudioUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingAudio(true);
//     setFiles((prev) => ({ ...prev, audio: file }));
//     await simulateDelay(3000);
//     setAudioSelected(true);
//     setLoadingAudio(false);
//   };
//   // ==== /Upload logic ====

//   // Helper: reset the form so user can fill up again (also resets stepper colors)
//   const resetForm = () => {
//     // revoke any object URL to avoid leaks
//     if (coverPreview) URL.revokeObjectURL(coverPreview);
//     setBookData(initialBookData);
//     setFiles({ cover: null, pdf: null, audio: null });
//     setCoverPreview(null);
//     setPdfSelected(false);
//     setAudioSelected(false);
//     setLoadingCover(false);
//     setLoadingPDF(false);
//     setLoadingAudio(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const payload = {
//       ...bookData,
//       hasCoverImage: !!files.cover,
//       hasPDF: !!files.pdf,
//       hasAudio: !!files.audio,
//     };
//     console.log("Book submitted:", payload, files);

//     // Optional: save a simple history entry (so “fill up history” can refresh elsewhere if you read it)
//     try {
//       const history = JSON.parse(localStorage.getItem("donationHistory") || "[]");
//       history.push({
//         ...payload,
//         createdAt: new Date().toISOString(),
//         files: {
//           cover: files.cover?.name || null,
//           pdf: files.pdf?.name || null,
//           audio: files.audio?.name || null,
//         },
//       });
//       localStorage.setItem("donationHistory", JSON.stringify(history));
//     } catch {}

//     // Show popup
//     setShowSuccess(true);

//     // Auto close + auto reset after a few seconds so the form is ready to fill again
//     setTimeout(() => {
//       setShowSuccess(false);
//       resetForm();
//       // If you prefer a hard refresh instead, uncomment:
//       // window.location.reload();
//     }, 2500);
//   };

//   // ------ Stepper derived states (your rules) ------
//   // Step 1 completes when BS ID No is filled
//   const detailsComplete = Boolean(String(bookData.bsIdNo || "").trim().length > 0);
//   // Step 2 completes when AUDIO is uploaded
//   const uploadsComplete = Boolean(files.audio || audioSelected);
//   // -------------------------------------------------

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar (kept) */}
//       <UserSidebar />

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//          <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
//               <HandHeart className="text-sky-500" size={24} />
//               Donation Book
//             </h1>
//           </div>
//           <p className="text-sm text-gray-600 mb-8">
//             Fill in the details below to add a new book to the library database.
//           </p>
//           </div>

//           {/* Stepper */}
//           <div className="mt-6">
//             <div className="flex items-center gap-3 text-[10px] sm:text-xs">
//               {/* Step 1 */}
//               <div className="flex items-center gap-2">
//                 <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white grid place-items-center font-semibold">
//                   1
//                 </span>
//                 <span className="font-medium text-gray-800">Book Details</span>
//               </div>

//               {/* Line 1: ash -> sky when BS ID No is filled */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     detailsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 2 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "bg-sky-600"
//                         : "bg-rose-600"
//                       : "bg-gray-300"
//                   }`}
//                 >
//                   2
//                 </span>
//                 <span
//                   className={`font-medium transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "text-gray-800"
//                         : "text-rose-600"
//                       : "text-gray-400"
//                   }`}
//                 >
//                   Upload Files
//                 </span>
//               </div>

//               {/* Line 2: ash -> sky after AUDIO is uploaded */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     uploadsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 3 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     uploadsComplete ? "bg-sky-600" : "bg-gray-300"
//                   }`}
//                 >
//                   3
//                 </span>
//                 <span
//                   className={`font-medium ${
//                     uploadsComplete ? "text-gray-800" : "text-gray-400"
//                   }`}
//                 >
//                   Review & Confirm
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="mt-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* LEFT SECTION — Book Details */}
//               <div className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-sm font-semibold text-gray-800">Book Details</h2>
//                   <div className="hidden sm:flex items-center gap-2 text-[11px]">
//                     <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 px-2 py-0.5">
//                       <ImageIcon size={12} />
//                       Cover
//                     </span>
//                     <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2 py-0.5">
//                       <FileText size={12} />
//                       PDF
//                     </span>
//                     <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
//                       <FileAudio size={12} />
//                       Audio
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Book Title
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="e.g.,Book Title"
//                     value={bookData.title}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category / Genre
//                     </label>
//                     <input
//                       type="text"
//                       name="mainCategory"
//                       placeholder="e.g.,Software Engineering"
//                       value={bookData.mainCategory}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Quantity Available
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       step="1"
//                       name="quantity"
//                       placeholder="e.g.,3"
//                       value={bookData.quantity}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Author Name
//                   </label>
//                   <input
//                     type="text"
//                     name="author"
//                     placeholder="e.g.,Author Name"
//                     value={bookData.author}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div>

//                 {/* BS Email & BS ID No */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       BS Email
//                     </label>
//                     <input
//                       type="email"
//                       name="bsEmail"
//                       placeholder="e.g., user@brainstation-23.com"
//                       value={bookData.bsEmail}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       BS ID No <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="bsIdNo"
//                       placeholder="e.g., BS-0000"
//                       value={bookData.bsIdNo}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     />
//                     <p
//                       className={`mt-1 text-xs ${
//                         detailsComplete ? "text-sky-600" : "text-gray-400"
//                       }`}
//                     >
//                       {detailsComplete
//                         ? "Step 1 completed ✓"
//                         : "Fill BS ID No to complete Step 1"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Book ID No */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Book ID No
//                   </label>
//                   <input
//                     type="text"
//                     name="bookIdNo"
//                     placeholder="e.g., BK-000123"
//                     value={bookData.bookIdNo}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                   />
//                 </div>

//                 <div>
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Description <span className="text-gray-400 font-normal">(Optional)</span>
//                     </label>
//                     <span className="text-xs text-gray-400">
//                       {bookData.description?.length || 0}/600
//                     </span>
//                   </div>
//                   <textarea
//                     name="description"
//                     rows="4"
//                     placeholder="Add a short summary, edition info, condition notes, etc."
//                     value={bookData.description}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//                     maxLength={600}
//                   />
//                 </div>
//               </div>

//               {/* RIGHT SECTION — Upload Files */}
//               <div className="space-y-4">
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
//                   <h2 className="text-sm font-semibold text-gray-800">Upload Files</h2>

//                   {/* Cover Image Upload */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">Cover image upload</p>

//                     {!coverPreview && !loadingCover && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose image
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleCoverUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(JPG/PNG)</span>
//                       </p>
//                     )}

//                     {loadingCover && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading cover…</span>
//                       </div>
//                     )}

//                     {coverPreview && !loadingCover && (
//                       <div className="flex flex-col items-center gap-2">
//                         <img
//                           src={coverPreview}
//                           alt="Cover preview"
//                           className="w-28 h-36 object-cover rounded shadow"
//                         />
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <ImageIcon size={18} />
//                           <span className="text-sm">Image uploaded</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* PDF File Upload */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">PDF file upload</p>

//                     {!pdfSelected && !loadingPDF && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose PDF
//                           <input
//                             type="file"
//                             accept="application/pdf"
//                             onChange={handlePDFUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(Max ~50MB)</span>
//                       </p>
//                     )}

//                     {loadingPDF && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading PDF…</span>
//                       </div>
//                     )}

//                     {pdfSelected && !loadingPDF && (
//                       <div className="flex flex-col items-center gap-2 text-gray-700">
//                         <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100">
//                           <FileText className="text-rose-600" size={28} />
//                         </span>
//                         <span className="text-sm font-medium text-rose-700">
//                           PDF uploaded {files?.pdf?.name ? `• ${files.pdf.name}` : ""}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Audio Clip Upload (completes Step 2) */}
//                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//                     <p className="text-sm text-gray-700 font-medium">
//                       Audio clip upload <span className="text-rose-500">*</span>
//                     </p>

//                     {!audioSelected && !loadingAudio && (
//                       <p className="text-sm text-gray-600">
//                         Drag & Drop or{" "}
//                         <label className="text-sky-600 underline cursor-pointer">
//                           Choose audio
//                           <input
//                             type="file"
//                             accept="audio/*"
//                             onChange={handleAudioUpload}
//                             className="hidden"
//                           />
//                         </label>{" "}
//                         <span className="text-gray-400">(MP3/WAV)</span>
//                       </p>
//                     )}

//                     {loadingAudio && (
//                       <div className="flex items-center justify-center gap-2 text-gray-600">
//                         <Loader2 className="animate-spin" size={18} />
//                         <span className="text-sm">Uploading audio…</span>
//                       </div>
//                     )}

//                     {audioSelected && !loadingAudio && (
//                       <div className="flex flex-col items-center gap-2 text-gray-700">
//                         <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
//                           <FileAudio className="text-indigo-600" size={28} />
//                         </span>
//                         <span className="text-sm font-medium text-indigo-700">
//                           Audio uploaded {files?.audio?.name ? `• ${files.audio.name}` : ""}
//                         </span>
//                         <p className="text-xs text-sky-600">Step 2 completed ✓</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                     <button
//                       type="button"
//                       className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
//                       onClick={resetForm}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-medium"
//                     >
//                       Confirm Book
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>

//           {/* Donation Guidelines */}
//           <div className="mt-8">
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//               <h3 className="text-sm font-semibold text-gray-800 mb-4">
//                 Donation Guidelines
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-emerald-700">Include (Good to Have)</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Original, legally shareable content you own or have rights to donate.</li>
//                     <li>Clear title, author, category/genre, and approximate quantity.</li>
//                     <li>Short description (edition, language, condition, highlights).</li>
//                     <li>High-quality cover image (JPG/PNG) for catalog visibility.</li>
//                     <li>Optional PDF and/or short audio sample (intro, synopsis, author note).</li>
//                   </ul>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-rose-700">Do Not Include</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Pirated or copyrighted material without explicit permission.</li>
//                     <li>Broken files, password-protected PDFs, or corrupted audio.</li>
//                     <li>Offensive or illegal content.</li>
//                     <li>Blurry/low-resolution covers that make the book hard to identify.</li>
//                     <li>Personal data inside files (IDs, phone numbers, addresses, etc.).</li>
//                   </ul>
//                 </div>
//               </div>

//               <div className="mt-4 text-xs text-gray-500">
//                 By submitting, you confirm the content complies with all applicable laws and you have
//                 the right to donate and distribute it.
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Animated Success Popup */}
//       {showSuccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           {/* Backdrop */}
//           <div className="absolute inset-0 bg-black/40 animate-fade-in" />

//           {/* Card */}
//           <div
//             className="
//               relative z-10 w-[92%] sm:w-[86%] md:w-[90%] max-w-md rounded-2xl bg-white shadow-xl
//               px-6 py-8 text-center
//               transition-all duration-300 ease-out
//               opacity-100 scale-100
//               animate-[pop_0.28s_ease-out]
//             "
//           >
//             <button
//               className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
//               onClick={() => setShowSuccess(false)}
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>

//             <div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
//               <CheckCircle2 className="text-emerald-600" size={36} />
//             </div>

//             <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
//               Book Uploaded Successfully
//               <PartyPopper className="text-amber-500 animate-bounce" size={20} />
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               Your book information and files have been recorded.
//             </p>
//           </div>

//           {/* Tiny CSS keyframes for pop + backdrop fade */}
//           <style>{`
//             @keyframes pop {
//               0% { transform: scale(0.9); opacity: 0; }
//               100% { transform: scale(1); opacity: 1; }
//             }
//             .animate-fade-in {
//               animation: fade-in 0.25s ease-out forwards;
//             }
//             @keyframes fade-in {
//               from { opacity: 0; }
//               to { opacity: 1; }
//             }
//           `}</style>
//         </div>
//       )}
//     </div>
//   );
// }






// // UploadBookPage.jsx
// import { useState, useEffect } from "react";
// import {
//   CalendarDays,
//   Upload,
//   Users,
//   BookOpen,
//   HelpCircle,
//   LogOut,
//   Image as ImageIcon,
//   FileText,
//   FileAudio,
//   Loader2,
//   CheckCircle2,
//   PartyPopper,
//   X,
//   HandHeart,
// } from "lucide-react";
// import UserSidebar from "../UserSidebar/UserSidebar";

// export default function UploadBookPage() {
//   const initialBookData = {
//     title: "",
//     author: "",
//     // input-based category
//     mainCategory: "",
//     quantity: "",
//     description: "",
//     // Added
//     bsEmail: "",
//     bsIdNo: "",
//     bookIdNo: "",
//   };

  

//   const [bookData, setBookData] = useState(initialBookData);

//   // Upload states (logic unchanged)
//   const [coverPreview, setCoverPreview] = useState(null);
//   const [pdfSelected, setPdfSelected] = useState(false);
//   const [audioSelected, setAudioSelected] = useState(false);

//   const [loadingCover, setLoadingCover] = useState(false);
//   const [loadingPDF, setLoadingPDF] = useState(false);
//   const [loadingAudio, setLoadingAudio] = useState(false);

//   const [files, setFiles] = useState({
//     cover: null,
//     pdf: null,
//     audio: null,
//   });

//   // Success Popup
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setBookData((prev) => ({ ...prev, [name]: value }));
//   };

//   const simulateDelay = (ms = 3000) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   // ==== Upload logic (kept exactly the same) ====
//   const handleCoverUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingCover(true);
//     setFiles((prev) => ({ ...prev, cover: file }));
//     await simulateDelay(3000);
//     const url = URL.createObjectURL(file);
//     setCoverPreview(url);
//     setLoadingCover(false);
//   };

//   const handlePDFUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingPDF(true);
//     setFiles((prev) => ({ ...prev, pdf: file }));
//     await simulateDelay(3000);
//     setPdfSelected(true);
//     setLoadingPDF(false);
//   };

//   const handleAudioUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setLoadingAudio(true);
//     setFiles((prev) => ({ ...prev, audio: file }));
//     await simulateDelay(3000);
//     setAudioSelected(true);
//     setLoadingAudio(false);
//   };
//   // ==== /Upload logic ====

//   // Helper: reset the form so user can fill up again (also resets stepper colors)
//   const resetForm = () => {
//     // revoke any object URL to avoid leaks
//     if (coverPreview) URL.revokeObjectURL(coverPreview);
//     setBookData(initialBookData);
//     setFiles({ cover: null, pdf: null, audio: null });
//     setCoverPreview(null);
//     setPdfSelected(false);
//     setAudioSelected(false);
//     setLoadingCover(false);
//     setLoadingPDF(false);
//     setLoadingAudio(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const payload = {
//       ...bookData,
//       hasCoverImage: !!files.cover,
//       hasPDF: !!files.pdf,
//       hasAudio: !!files.audio,
//     };
//     console.log("Book submitted:", payload, files);

//     // Optional: save a simple history entry (so “fill up history” can refresh elsewhere if you read it)
//     try {
//       const history = JSON.parse(localStorage.getItem("donationHistory") || "[]");
//       history.push({
//         ...payload,
//         createdAt: new Date().toISOString(),
//         files: {
//           cover: files.cover?.name || null,
//           pdf: files.pdf?.name || null,
//           audio: files.audio?.name || null,
//         },
//       });
//       localStorage.setItem("donationHistory", JSON.stringify(history));
//     } catch {}

//     // Show popup
//     setShowSuccess(true);

//     // Auto close + auto reset after a few seconds so the form is ready to fill again
//     setTimeout(() => {
//       setShowSuccess(false);
//       resetForm();
//       // If you prefer a hard refresh instead, uncomment:
//       // window.location.reload();
//     }, 2500);
//   };

//   // ------ Stepper derived states (your rules) ------
//   // Step 1 completes when BS ID No is filled
//   const detailsComplete = Boolean(String(bookData.bsIdNo || "").trim().length > 0);
//   // Step 2 completes when AUDIO is uploaded
//   const uploadsComplete = Boolean(files.audio || audioSelected);

//   export default function DonationBookPage() {
//     const [bookData, setBookData] = useState({
//       title: "",
//       mainCategory: "",
//       quantity: 1,
//       author: "",
//       bsEmail: "",
//       bsIdNo: "",
//       description: "",
//     });
//     const [coverFile, setCoverFile] = useState(null);
//     const [coverPreview, setCoverPreview] = useState(null);
//     const [loadingCover, setLoadingCover] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);
  
//     // handle text input changes
//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setBookData((prev) => ({ ...prev, [name]: value }));
//     };
  
//     // cover image upload preview
//     const handleCoverUpload = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         setCoverFile(file);
//         setCoverPreview(URL.createObjectURL(file));
//       }
//     };

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       try {
//         const token = getAuthToken(); // <-- your existing auth util
  
//         const formData = new FormData();
//         formData.append("book_title", bookData.title);
//         formData.append("category_id", 1); // Replace with actual numeric category ID selection
//         formData.append("category_title", bookData.mainCategory);
//         formData.append("book_author", bookData.author);
//         formData.append("BS_mail", bookData.bsEmail);
//         formData.append("BS_ID", bookData.bsIdNo);
//         formData.append("book_detail", bookData.description || "");
//         formData.append("book_count", bookData.quantity);
//         if (coverFile) formData.append("book_photo", coverFile);
  
//         await axios.put("/donation/", formData, {
//           baseURL: import.meta.env.VITE_API_BASE_URL, // or your API base
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         });
  
//         setShowSuccess(true);
//         setBookData({
//           title: "",
//           mainCategory: "",
//           quantity: 1,
//           author: "",
//           bsEmail: "",
//           bsIdNo: "",
//           description: "",
//         });
//         setCoverFile(null);
//         setCoverPreview(null);
//       } catch (error) {
//         console.error("Donation upload failed:", error);
//         alert(
//           error.response?.data?.detail ||
//             "Something went wrong while uploading the donation book."
//         );
//       }
//     };
  
//   // -------------------------------------------------

//   return (

//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar (kept) */}
//       <UserSidebar />

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//          <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
//               <HandHeart className="text-sky-500" size={24} />
//               Donation Book
//             </h1>
//           </div>
//           <p className="text-sm text-gray-600 mb-8">
//             Fill in the details below to add a new book to the library database.
//           </p>
//           </div>

//           {/* Stepper */}
//           <div className="mt-6">
//             <div className="flex items-center gap-3 text-[10px] sm:text-xs">
//               {/* Step 1 */}
//               <div className="flex items-center gap-2">
//                 <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white grid place-items-center font-semibold">
//                   1
//                 </span>
//                 <span className="font-medium text-gray-800">Book Details</span>
//               </div>

//               {/* Line 1: ash -> sky when BS ID No is filled */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     detailsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 2 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "bg-sky-600"
//                         : "bg-rose-600"
//                       : "bg-gray-300"
//                   }`}
//                 >
//                   2
//                 </span>
//                 <span
//                   className={`font-medium transition-colors ${
//                     detailsComplete
//                       ? uploadsComplete
//                         ? "text-gray-800"
//                         : "text-rose-600"
//                       : "text-gray-400"
//                   }`}
//                 >
//                   Upload Files
//                 </span>
//               </div>

//               {/* Line 2: ash -> sky after AUDIO is uploaded */}
//               <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${
//                     uploadsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
//                   }`}
//                 />
//               </div>

//               {/* Step 3 */}
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
//                     uploadsComplete ? "bg-sky-600" : "bg-gray-300"
//                   }`}
//                 >
//                   3
//                 </span>
//                 <span
//                   className={`font-medium ${
//                     uploadsComplete ? "text-gray-800" : "text-gray-400"
//                   }`}
//                 >
//                   Review & Confirm
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="mt-6">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     {/* LEFT SECTION — Book Details */}
//     <div className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//       <div className="flex items-center justify-between">
//         <h2 className="text-sm font-semibold text-gray-800">Book Details</h2>
//         <div className="hidden sm:flex items-center gap-2 text-[11px]">
//           <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 px-2 py-0.5">
//             <ImageIcon size={12} /> Cover
//           </span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2 py-0.5">
//             <FileText size={12} /> PDF
//           </span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
//             <FileAudio size={12} /> Audio
//           </span>
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
//         <input
//           type="text"
//           name="title"
//           placeholder="e.g.,Book Title"
//           value={bookData.title || book_title}
//           onChange={handleChange}
//           className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Category / Genre</label>
//           <input
//             type="text"
//             name="mainCategory"
//             placeholder="e.g.,Software Engineering"
//             value={bookData.mainCategory || category_title}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
//           <input
//             type="number"
//             min="1"
//             step="1"
//             name="quantity"
//             placeholder="e.g.,3"
//             value={bookData.quantity || book_count}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
//         <input
//           type="text"
//           name="author"
//           placeholder="e.g.,Author Name"
//           value={bookData.author || book_author}
//           onChange={handleChange}
//           className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">BS Email</label>
//           <input
//             type="email"
//             name="bsEmail"
//             placeholder="e.g., user@brainstation-23.com"
//             value={bookData.bsEmail || BS_mail}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             BS ID No <span className="text-rose-500">*</span>
//           </label>
//           <input
//             type="text"
//             name="bsIdNo"
//             placeholder="e.g., BS-0000"
//             value={bookData.bsIdNo || BS_ID}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//           />
//           <p className={`mt-1 text-xs ${detailsComplete ? "text-sky-600" : "text-gray-400"}`}>
//             {detailsComplete ? "Step 1 completed ✓" : "Fill BS ID No to complete Step 1"}
//           </p>
//         </div>
//       </div>

//       <div>
//         <div className="flex items-center justify-between mb-1">
//           <label className="block text-sm font-medium text-gray-700">
//             Description <span className="text-gray-400 font-normal">(Optional)</span>
//           </label>
//           <span className="text-xs text-gray-400">{bookData.description?.length || 0}/600</span>
//         </div>
//         <textarea
//           name="description"
//           rows="4"
//           placeholder="Add a short summary, edition info, condition notes, etc."
//           value={bookData.description || book_details}
//           onChange={handleChange}
//           className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
//           maxLength={600}
//         />
//       </div>
//     </div>

//     {/* RIGHT SECTION — Upload Files */}
//     <div className="space-y-4">
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
//         <h2 className="text-sm font-semibold text-gray-800">Upload Files</h2>

//         {/* Cover Image Upload */}
//         <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
//           <p className="text-sm text-gray-700 font-medium">Cover image upload</p>
//           {!coverPreview && !loadingCover && (
//             <p className="text-sm text-gray-600">
//               Drag & Drop or{" "}
//               <label className="text-sky-600 underline cursor-pointer">
//                 Choose image
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleCoverUpload}
//                   className="hidden"
//                 />
//               </label>{" "}
//               <span className="text-gray-400">(JPG/PNG)</span>
//             </p>
//           )}

//           {coverPreview ? (
//             <div className="flex flex-col items-center gap-2">
//               <img
//                 src={coverPreview || book_photo}
//                 alt="Cover preview"
//                 className="w-28 h-36 object-cover rounded shadow"
//               />
//               <div className="flex items-center gap-2 text-gray-700">
//                 <ImageIcon size={18} />
//                 <span className="text-sm">Image uploaded</span>
//               </div>
//             </div>
//           ) : null}
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-3 pt-2">
//           <button
//             type="button"
//             className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
//             onClick={resetForm}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-medium"
//           >
//             Confirm Book
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// </form>


//           {/* Donation Guidelines */}
//           <div className="mt-8">
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//               <h3 className="text-sm font-semibold text-gray-800 mb-4">
//                 Donation Guidelines
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-emerald-700">Include (Good to Have)</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Original, legally shareable content you own or have rights to donate.</li>
//                     <li>Clear title, author, category/genre, and approximate quantity.</li>
//                     <li>Short description (edition, language, condition, highlights).</li>
//                     <li>High-quality cover image (JPG/PNG) for catalog visibility.</li>
//                     <li>Optional PDF and/or short audio sample (intro, synopsis, author note).</li>
//                   </ul>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-rose-700">Do Not Include</h4>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     <li>Pirated or copyrighted material without explicit permission.</li>
//                     <li>Broken files, password-protected PDFs, or corrupted audio.</li>
//                     <li>Offensive or illegal content.</li>
//                     <li>Blurry/low-resolution covers that make the book hard to identify.</li>
//                     <li>Personal data inside files (IDs, phone numbers, addresses, etc.).</li>
//                   </ul>
//                 </div>
//               </div>

//               <div className="mt-4 text-xs text-gray-500">
//                 By submitting, you confirm the content complies with all applicable laws and you have
//                 the right to donate and distribute it.
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Animated Success Popup */}
//       {showSuccess && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           {/* Backdrop */}
//           <div className="absolute inset-0 bg-black/40 animate-fade-in" />

//           {/* Card */}
//           <div
//             className="
//               relative z-10 w-[92%] sm:w-[86%] md:w-[90%] max-w-md rounded-2xl bg-white shadow-xl
//               px-6 py-8 text-center
//               transition-all duration-300 ease-out
//               opacity-100 scale-100
//               animate-[pop_0.28s_ease-out]
//             "
//           >
//             <button
//               className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
//               onClick={() => setShowSuccess(false)}
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>

//             <div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
//               <CheckCircle2 className="text-emerald-600" size={36} />
//             </div>

//             <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
//               Book Uploaded Successfully
//               <PartyPopper className="text-amber-500 animate-bounce" size={20} />
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               Your book information and files have been recorded.
//             </p>
//           </div>

//           {/* Tiny CSS keyframes for pop + backdrop fade */}
//           <style>{`
//             @keyframes pop {
//               0% { transform: scale(0.9); opacity: 0; }
//               100% { transform: scale(1); opacity: 1; }
//             }
//             .animate-fade-in {
//               animation: fade-in 0.25s ease-out forwards;
//             }
//             @keyframes fade-in {
//               from { opacity: 0; }
//               to { opacity: 1; }
//             }
//           `}</style>
//         </div>
//       )}
//     </div>


    
//   );
  
// }



