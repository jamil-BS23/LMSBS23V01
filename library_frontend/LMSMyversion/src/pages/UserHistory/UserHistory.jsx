
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Eye, X } from "lucide-react";
import UserSidebar from "../../components/UserSidebar/UserSidebar";
import api from "../../config/api";
import { useAuth } from "../../Providers/AuthProvider";

const badge = (type) => {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  switch (type) {
    case "Borrowed":
      return `${base} bg-sky-100 text-sky-700`;
    case "Returned":
      return `${base} bg-green-100 text-green-700`;
    case "Booked":
      return `${base} bg-amber-100 text-amber-700`;
    case "Donation":
      return `${base} bg-violet-100 text-violet-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

const capitalize = (s) => {
  if (!s && s !== "") return "";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

export default function UserHistory() {
  useEffect(() => {
    document.title = "History";
  }, []);

  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Check user role and call appropriate API endpoint
        const apiEndpoint = user?.role === "admin" 
          ? "/borrow/borrow"  // Admin gets all borrow records
          : "/borrow/borrow/my";  // Regular users get only their own records
        
        const res = await api.get(apiEndpoint);
        const mapped = (res.data || []).map((b) => ({
          id: `BRW-${b.borrow_id}`,
          borrow_id: b.borrow_id,
          book: b.book_title,
          user: b.user_name,
          type: capitalize(b.borrow_status),
          requestStatus: capitalize(b.request_status),
          borrowedOn: b.borrow_date,
          dueOn: b.return_date,
          returnedOn:
            b.borrow_status && String(b.borrow_status).toLowerCase() === "returned"
              ? b.return_date
              : "",
          bookedOn: null,
          donatedOn: null,
          note: "",
        }));
        setRows(mapped);
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      let matchesType = true;
      if (typeFilter !== "All") {
        const tf = typeFilter.toLowerCase();
  
        // Check borrow type first
        const typeLower = String(r.type || "").toLowerCase();
        const requestLower = String(r.requestStatus || "").toLowerCase();
  
        // Match against type OR requestStatus depending on filter
        if (["borrowed", "returned", "pdf-borrow"].includes(tf)) {
          matchesType = typeLower === tf;
        } else {
          matchesType = requestLower === tf;
        }
      }
  
      const matchesSearch =
        !term ||
        [r.id, r.book, r.user, r.type, r.requestStatus]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));
  
      return matchesType && matchesSearch;
    });
  }, [rows, q, typeFilter]);

  // Pagination setup
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const maxPagesToShow = 3;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getPaginationRange = () => {
    const start = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
    const end = Math.min(start + maxPagesToShow - 1, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const [detail, setDetail] = useState(null);
  const openDetail = (row) => setDetail(row);
  const closeDetail = () => setDetail(null);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100 items-center justify-center">
        <UserSidebar active="history" />
        <div className="text-gray-600">Loading history…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-100 items-center justify-center">
        <UserSidebar active="history" />
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <UserSidebar active="history" />

      <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">History</h1>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-gray-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                  <Filter size={16} /> Type:
                </span>
                <div className="flex items-center gap-2">
                  {["All", "Borrowed", "Returned", "Pending", "Accepted", "Rejected", "Pdf-borrow"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                        typeFilter === t
                          ? "bg-sky-50 text-sky-700 ring-sky-200"
                          : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by book, user, id…"
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white">
                  <tr className="text-left">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4 min-w-[220px]">Book</th>
                    <th className="py-3 px-4 min-w-[160px]">User</th>
                    <th className="py-3 px-4">Borrowed On</th>
                    <th className="py-3 px-4">Due Date</th>
                    {/* <th className="py-3 px-4">Returned On</th> */}
                    <th className="py-3 px-4">Borrow Status</th>
                    <th className="py-3 px-4">Request Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRows.map((r, i) => (
                    <tr key={r.id} className="even:bg-gray-50">
                      <td className="py-3 px-4">{startIndex + i + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{r.book}</td>
                      <td className="py-3 px-4 text-gray-700">{r.user}</td>
                      <td className="py-3 px-4 text-gray-700">{r.borrowedOn || "—"}</td>
                      <td className="py-3 px-4 text-gray-700">{r.dueOn || "—"}</td>
                      {/* <td className="py-3 px-4 text-gray-700">{r.returnedOn || "—"}</td> */}
                      <td className="py-3 px-4"><span className={badge(r.type)}>{r.type}</span></td>
                      <td className="py-3 px-4 text-gray-700">{r.requestStatus || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openDetail(r)}
                          className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-500">
                        No matching history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="py-4 flex justify-center space-x-2 border-t border-gray-200 bg-white">
              <button
                className={`px-3 py-1 border rounded-md ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {getPaginationRange().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md ${
                    page === currentPage
                      ? "bg-sky-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                className={`px-3 py-1 border rounded-md ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal (unchanged) */}
      {detail && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && closeDetail()}
        >
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-lg mx-4 rounded-lg bg-white shadow-lg border border-gray-200 opacity-0 translate-y-2 animate-[popIn_.22s_ease-out_forwards]">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">History Details</h3>
                <button onClick={closeDetail} className="p-1 rounded hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Record ID</span><span className="font-medium">{detail.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Book</span><span className="font-medium">{detail.book}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-medium">{detail.user}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Borrow Status</span><span className={badge(detail.type)}>{detail.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Request Status</span><span className="font-medium">{detail.requestStatus}</span></div>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                <button onClick={closeDetail} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { to { opacity: 1 } }
        @keyframes popIn { to { opacity: 1; transform: translateY(0) } }
        .scrollbar-none::-webkit-scrollbar{ display:none }
        .scrollbar-none{ -ms-overflow-style:none; scrollbar-width:none }
      `}</style>
    </div>
  );
}

