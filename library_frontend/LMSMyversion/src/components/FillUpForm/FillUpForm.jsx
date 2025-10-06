
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import api from "../../config/api";

const formatDate = (d) => d.toISOString().split("T")[0];

export default function FillUpForm() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowLimit, setBorrowLimit] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------- Fetch chosen book ----------------
  useEffect(() => {
    const books = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
    const fromState = location.state?.borrowNow || location.state?.book || null;
    const fromKey = JSON.parse(localStorage.getItem("borrowNow") || "null");
    const chosen = fromState || fromKey || (books.length ? books[0] : null);
    setBorrowedBooks(chosen ? [chosen] : []);
  }, [location.state]);

  // ---------------- Fetch borrow_day_limit from settings ----------------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings/public");
        const data = res.data;
        const limit = Array.isArray(data)
          ? data[0]?.borrow_day_limit
          : data.borrow_day_limit;
        setBorrowLimit(limit ?? 14);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setBorrowLimit(14);
      }
    })();
  }, []);

  // ---------------- Initialize form data ----------------
  useEffect(() => {
    if (borrowLimit == null || !borrowedBooks.length) return;

    const today = new Date();
    const currentDateStr = formatDate(today);

    const initial = {};
    borrowedBooks.forEach((b) => {
      initial[b.book_id] = {
        borrowDate: currentDateStr,
        returnDate: "",
      };
    });
    setFormData(initial);
  }, [borrowLimit, borrowedBooks]);

  // ---------------- Handle date change ----------------
  const handleDateChange = (bookId, value) => {
    setFormData((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], returnDate: value },
    }));
  };

  // ---------------- Submit Borrow Request ----------------
  const handleSubmit = async () => {
    if (!borrowedBooks.length) return;
    setLoading(true);

    try {
      const today = new Date();

      for (const book of borrowedBooks) {
        const f = formData[book.book_id];
        if (!f || !f.returnDate) {
          alert(`Please select a return date for "${book.title}"`);
          setLoading(false);
          return;
        }

        const selectedReturnDate = new Date(f.returnDate);
        const diffDays = Math.ceil(
          (selectedReturnDate - today) / (1000 * 60 * 60 * 24)
        );

        // ✅ Validate return date within borrowing limit
        if (diffDays > borrowLimit) {
          alert(
            `Return date for "${book.title}" exceeds the borrowing limit of ${borrowLimit} days. Please choose a closer date.`
          );
          setLoading(false);
          return;
        }

        // ✅ Post borrow request if valid
        await api.post("/borrow/borrow/", { book_id: Number(book.id) });
      }

      alert("Borrow request placed successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Fill Up Book Borrow Form
        </h1>

        {!borrowLimit && <p className="text-gray-500 mb-4">Loading settings…</p>}

        <div className="space-y-8">
          {borrowedBooks.map((book) => {
            const f = formData[book.book_id] || {};
            return (
              <div
                key={book.book_id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-start gap-6">
                  <img
                    src={book.coverImage || book.image}
                    alt={book.title}
                    className="w-28 h-36 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{book.authors}</p>

                    {/* Borrow info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Date
                        </label>
                        <div className="w-full border rounded px-3 py-2 bg-gray-50">
                          {f.borrowDate || "—"}
                        </div>
                      </div>

                      {/* Return Date Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Return Date
                        </label>
                        <input
                          type="date"
                          value={f.returnDate || ""}
                          onChange={(e) =>
                            handleDateChange(book.book_id, e.target.value)
                          }
                          className="w-full border rounded px-3 py-2"
                          min={f.borrowDate}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {borrowedBooks.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md disabled:opacity-50"
            >
              {loading ? "Booking…" : "Book Now"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
