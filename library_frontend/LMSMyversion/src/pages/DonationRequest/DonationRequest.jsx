import { useEffect, useState, useMemo } from "react";
import {
  HandHeart, CheckCircle2, XCircle, Clock,
  Search, Filter, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import Pagination from "../../components/Pagination/Pagination";
import api from "../../config/api";          // <== same axios instance with auth interceptor

const PAGE_SIZE = 8;

export default function DonationRequest() {
  const [items, setItems] = useState([]); // all donation requests
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingPage, setPendingPage] = useState(1);
  const [collectedPage, setCollectedPage] = useState(1);
  const [unifiedPage, setUnifiedPage] = useState(1);

  // ------------------ Fetch donations ------------------
  useEffect(() => {
    document.title = "Donation Request";
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/donation/"); // <-- GET all donations
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load donation requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ------------------ Accept/Reject ------------------
  const handleAction = async (id, action) => {
    try {
      if (action === "accepted") {
        await api.patch(`/donation/${id}/approve`);
      } else {
        await api.patch(`/donation/${id}/reject`);
      }
      // refresh list
      const res = await api.get("/donation/");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action === "accepted" ? "approve" : "reject"} request.`);
    }
  };


const [collectedItems, setCollectedItems] = useState([]);
const [loadingCollected, setLoadingCollected] = useState(false);
const [errorCollected, setErrorCollected] = useState("");

  useEffect(() => {
    const fetchCollected = async () => {
      try {
        setLoadingCollected(true);
        const res = await api.get("/donation/status?book_approve=approved"); // authenticated
        setCollectedItems(res.data || []);
      } catch (err) {
        console.error(err);
        setErrorCollected("Failed to load collected books.");
      } finally {
        setLoadingCollected(false);
      }
    };
  
    fetchCollected();
  }, []);
  

  // ------------------ Filtering ------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchQ =
        !q ||
        (it.user_name || "").toLowerCase().includes(q) ||
        (it.book_title || "").toLowerCase().includes(q);
      const matchS = statusFilter === "all" ? true : (it.book_approve || "").toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
  }, [items, query, statusFilter]);

  const pendingRows  = filtered.filter((x) => (x.book_approve || "").toLowerCase() === "pending");
  const acceptedRows = filtered.filter((x) => (x.book_approve || "").toLowerCase() === "accepted");

  const paginate = (rows, p) => rows.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);

  // ------------------ Table component ------------------
  const Table = ({ rows, showActions, pageForCalc }) => (
    <div className="overflow-x-hidden rounded-lg border border-gray-300">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-300">
          <tr className="text-left">
            <th className="px-4 py-2">Serial No #</th>
            <th className="px-4 py-2">Donor</th>
            <th className="px-4 py-2">Book / Purpose</th>
            <th className="px-4 py-2">Status</th>
            {showActions && <th className="px-4 py-2 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.d_book_id} className="border-t border-gray-300">
                <td className="px-4 py-2 font-medium">{r.d_book_id}</td>
                <td className="px-4 py-2 font-medium">{r.BS_ID || "—"}</td>
                <td className="px-4 py-2 font-medium">{r.book_title || "—"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border
                      ${
                        (r.book_approve || "").toLowerCase() === "accepted"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : (r.book_approve || "").toLowerCase() === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                  >
                    {(r.book_approve || "").toLowerCase() === "accepted" ? (
                      <CheckCircle2 size={14} />
                    ) : (r.book_approve || "").toLowerCase() === "rejected" ? (
                      <XCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {r.book_approve || "pending"}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAction(r.d_book_id, "accepted")}
                        className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(r.d_book_id, "rejected")}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HandHeart className="text-sky-600" /> Donation Request
            </h1>
            <p className="text-sm text-gray-600">
              Accept / Reject commissions and view collected donations.
            </p>
          </div>

          {/* simple page toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm font-medium">Page {page} / 2</span>
            <button
              onClick={() => setPage((p) => Math.min(2, p + 1))}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-lg shadow border border-gray-300">
          <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by donor or book"
                className="w-64 md:w-80 rounded border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        {/* Page 1: Pending + Collected */}
        {page === 1 && (
  <>
    {/* Pending Requests */}
    <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-800">Pending Requests</h3>
      </div>
      <div className="p-4">
        <Table
          rows={paginate(pendingRows, pendingPage, PAGE_SIZE)}
          showActions
          pageForCalc={pendingPage}
        />
        <Pagination
          page={pendingPage}
          setPage={setPendingPage}
          totalItems={pendingRows.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </section>

    {/* Collected Requests */}
    <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-800">Collected</h3>
      </div>
      <div className="p-4">
        {loadingCollected ? (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        ) : errorCollected ? (
          <div className="text-center py-6 text-rose-600">{errorCollected}</div>
        ) : (
          <>
            <Table
              rows={paginate(collectedItems, collectedPage, PAGE_SIZE)}
              showActions={false}
              pageForCalc={collectedPage}
            />
            <Pagination
              page={collectedPage}
              setPage={setCollectedPage}
              totalItems={collectedItems.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>
    </section>
  </>
)}


        {/* Page 2: unified filtered table */}
        {page === 2 && (
          <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-300">
              <h3 className="text-sm font-semibold text-gray-800">All Requests</h3>
            </div>
            <div className="p-4">
              <Table rows={paginate(filtered, unifiedPage)} showActions pageForCalc={unifiedPage} />
              <Pagination
                page={unifiedPage}
                setPage={setUnifiedPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
