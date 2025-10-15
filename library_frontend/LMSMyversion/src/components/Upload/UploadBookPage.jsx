

import { useState } from "react";
import {
  Image as ImageIcon,
  FileText,
  FileAudio,
  CheckCircle2,
  PartyPopper,
  X,
  HandHeart,
  Loader2,
} from "lucide-react";
import UserSidebar from "../UserSidebar/UserSidebar";
import api from "../../config/api";

export default function UploadBookPage() {
  const initialBookData = {
    title: "",
    mainCategory: "",
    categoryId: "",
    quantity: "",
    author: "",
    bsEmail: "",
    bsIdNo: "",
    description: "",
  };

  const [bookData, setBookData] = useState(initialBookData);
  const [files, setFiles] = useState({ cover: null, pdf: null, audio: null });
  const [coverPreview, setCoverPreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [pdfSelected, setPdfSelected] = useState(false);
  const [audioSelected, setAudioSelected] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const simulateDelay = (ms = 1000) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Upload handlers using cover image logic
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingCover(true);
    setFiles((prev) => ({ ...prev, cover: file }));
    await simulateDelay();
    setCoverPreview(URL.createObjectURL(file));
    setLoadingCover(false);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingPDF(true);
    setFiles((prev) => ({ ...prev, pdf: file }));
    await simulateDelay();
    setPdfPreview(URL.createObjectURL(file));
    setPdfSelected(true);
    setLoadingPDF(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAudio(true);
    setFiles((prev) => ({ ...prev, audio: file }));
    await simulateDelay();
    setAudioPreview(URL.createObjectURL(file));
    setAudioSelected(true);
    setLoadingAudio(false);
  };

  const resetForm = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setBookData(initialBookData);
    setFiles({ cover: null, pdf: null, audio: null });
    setCoverPreview(null);
    setPdfPreview(null);
    setAudioPreview(null);
    setPdfSelected(false);
    setAudioSelected(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("book_title", bookData.title);
      formData.append("category_title", bookData.mainCategory);
      formData.append("category_id", bookData.categoryId);
      formData.append("book_author", bookData.author);
      formData.append("BS_mail", bookData.bsEmail);
      formData.append("BS_ID", bookData.bsIdNo);
      formData.append("book_detail", bookData.description);
      formData.append("book_count", bookData.quantity);
      if (files.cover) formData.append("book_photo", files.cover);
      if (files.pdf) formData.append("book_pdf", files.pdf);
      if (files.audio) formData.append("book_audio", files.audio);

      const token = localStorage.getItem("access_token");
      await api.put("/donation/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
      }, 2500);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload book. Please check your login/token.");
    }
  };

  const detailsComplete = Boolean(bookData.bsIdNo.trim());
  const uploadsComplete = Boolean(files.audio || audioSelected);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <HandHeart className="text-sky-500" size={24} />
              Donation Book
            </h1>
          </div>
          <p className="text-sm text-gray-600 mb-8">
            Fill in the details below to add a new book to the library database.
          </p>

          {/* Stepper */}
          <div className="mt-6 flex items-center gap-3 text-[10px] sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white grid place-items-center font-semibold">
                1
              </span>
              <span className="font-medium text-gray-800">Book Details</span>
            </div>
            <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  detailsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
                  detailsComplete ? (uploadsComplete ? "bg-sky-600" : "bg-rose-600") : "bg-gray-300"
                }`}
              >
                2
              </span>
              <span
                className={`font-medium transition-colors ${
                  detailsComplete ? (uploadsComplete ? "text-gray-800" : "text-rose-600") : "text-gray-400"
                }`}
              >
                Upload Files
              </span>
            </div>
            <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  uploadsComplete ? "w-full bg-sky-500" : "w-0 bg-sky-500"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center font-semibold text-white transition-colors ${
                  uploadsComplete ? "bg-sky-600" : "bg-gray-300"
                }`}
              >
                3
              </span>
              <span className={`font-medium ${uploadsComplete ? "text-gray-800" : "text-gray-400"}`}>
                Review & Confirm
              </span>
            </div>
          </div>

          {/* --- FORM --- */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left Side Fields */}
            <div className="space-y-4 bg-white rounded-xl border p-4">
              {[
                { label: "Book Title", name: "title", type: "text" },
                { label: "Category Title", name: "mainCategory", type: "text" },
                { label: "Category ID", name: "categoryId", type: "text" },
                { label: "Quantity", name: "quantity", type: "number" },
                { label: "Author Name", name: "author", type: "text" },
                { label: "BS Email", name: "bsEmail", type: "email" },
                { label: "BS ID", name: "bsIdNo", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={bookData[field.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={bookData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>

            {/* Right Side Uploads */}
            <div className="space-y-4 bg-white rounded-xl border p-4">
              {/* Cover Image */}
              <div className="flex flex-col relative">
                <label className="text-sm font-semibold mb-2">Cover Image</label>
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-sky-400 hover:bg-sky-50 transition">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="rounded-lg shadow-md max-h-48 object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                      <ImageIcon size={40} className="mb-2 text-sky-500" />
                      <p className="text-sm">Drag & drop or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
                <p className="text-sm text-gray-700 font-medium">PDF file upload</p>
                {!pdfSelected && !loadingPDF && (
                  <p className="text-sm text-gray-600">
                    Drag & Drop or{" "}
                    <label className="text-sky-600 underline cursor-pointer">
                      Choose PDF
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFUpload}
                        className="hidden"
                      />
                    </label>{" "}
                    <span className="text-gray-400">(Max ~50MB)</span>
                  </p>
                )}
                {loadingPDF && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Uploading PDF…</span>
                  </div>
                )}
                {pdfSelected && files?.pdf && (
                  <div className="flex flex-col items-center gap-2 text-gray-700">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100">
                      <FileText className="text-rose-600" size={28} />
                    </span>
                    <span className="text-sm font-medium text-rose-700">
                      PDF uploaded • {files.pdf.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Upload */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center space-y-3">
                <p className="text-sm text-gray-700 font-medium">
                  Audio clip upload <span className="text-rose-500">*</span>
                </p>
                {!audioSelected && !loadingAudio && (
                  <p className="text-sm text-gray-600">
                    Drag & Drop or{" "}
                    <label className="text-sky-600 underline cursor-pointer">
                      Choose audio
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>{" "}
                    <span className="text-gray-400">(MP3/WAV)</span>
                  </p>
                )}
                {loadingAudio && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Uploading audio…</span>
                  </div>
                )}
                {audioSelected && files?.audio && (
                  <div className="flex flex-col items-center gap-2 text-gray-700">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                      <FileAudio className="text-indigo-600" size={28} />
                    </span>
                    <span className="text-sm font-medium text-indigo-700">
                      Audio uploaded • {files.audio.name}
                    </span>
                    <p className="text-xs text-sky-600">Step 2 completed ✓</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
              >
                Confirm Book
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white shadow-xl px-6 py-8 text-center">
            <button
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setShowSuccess(false)}
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600" size={36} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
              Book Uploaded Successfully
              <PartyPopper className="text-amber-500" size={20} />
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

