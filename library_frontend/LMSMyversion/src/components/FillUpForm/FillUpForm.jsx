

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import api from "../../config/api"; // <-- Import the preconfigured API instance

// Helper: format Date -> yyyy-mm-dd
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
        const res = await api.get("/settings/public"); // <-- use api instance
        const data = res.data;
        const limit = Array.isArray(data) ? data[0]?.borrow_day_limit : data.borrow_day_limit;
        setBorrowLimit(limit ?? 14);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setBorrowLimit(14); // fallback if settings not found
      }
    })();
  }, []);

  // ---------------- Auto-fill dates once limit is known ----------------
  useEffect(() => {
    if (borrowLimit == null || !borrowedBooks.length) return;

    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + borrowLimit);

    const currentDateStr = formatDate(today);
    const returnDateStr = formatDate(returnDate);

    const initial = {};
    borrowedBooks.forEach((b) => {
      initial[b.book_id] = {
        borrowDate: currentDateStr,
        returnDate: returnDateStr,
        days: borrowLimit,
      };
    });
    setFormData(initial);
  }, [borrowLimit, borrowedBooks]);

  // ---------------- Submit Borrow Request ----------------
  const handleSubmit = async () => {
    if (!borrowedBooks.length) return;
    setLoading(true);
  
    try {
      for (const book of borrowedBooks) {

        console.log("Borrowing book:", book);
        // Convert book.id to number
        const res = await api.post("/borrow/borrow/", { book_id: Number(book.book_id) });
  
        if (!res || !res.data) {
          throw new Error(`Failed for book ${book.title}`);
        }
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Date
                        </label>
                        <div className="w-full border rounded px-3 py-2 bg-gray-50">
                          {f.borrowDate || "—"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Return Date
                        </label>
                        <div className="w-full border rounded px-3 py-2 bg-gray-50">
                          {f.returnDate || "—"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Borrowing Days
                        </label>
                        <div className="w-full border rounded px-3 py-2 bg-gray-50">
                          {f.days ?? "—"}
                        </div>
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
              {loading ? "Booking…" : "Booked"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}





// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../Sidebar/Sidebar";

// // Helper: format Date -> yyyy-mm-dd
// const formatDate = (d) => d.toISOString().split("T")[0];

// export default function FillUpForm() {
//   const [borrowedBooks, setBorrowedBooks] = useState([]);
//   const [borrowLimit, setBorrowLimit] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ---------------- Fetch chosen book ----------------
//   useEffect(() => {
//     const books = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
//     const fromState = location.state?.borrowNow || location.state?.book || null;
//     const fromKey = JSON.parse(localStorage.getItem("borrowNow") || "null");
//     const chosen = fromState || fromKey || (books.length ? books[0] : null);
//     setBorrowedBooks(chosen ? [chosen] : []);
//   }, [location.state]);

//   // ---------------- Fetch borrow_day_limit from settings ----------------
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings/public`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         const limit =
//           Array.isArray(data) ? data[0]?.borrow_day_limit : data.borrow_day_limit;
//         setBorrowLimit(limit ?? 14);
//       } catch (err) {
//         console.error("Failed to load settings:", err);
//         setBorrowLimit(14); // fallback if settings not found
//       }
//     })();
//   }, []);

//   // ---------------- Auto-fill dates once limit is known ----------------
//   useEffect(() => {
//     if (borrowLimit == null || !borrowedBooks.length) return;

//     const today = new Date();
//     const returnDate = new Date();
//     returnDate.setDate(today.getDate() + borrowLimit);

//     const currentDateStr = formatDate(today);
//     const returnDateStr = formatDate(returnDate);

//     const initial = {};
//     borrowedBooks.forEach((b) => {
//       initial[b.id] = {
//         borrowDate: currentDateStr,
//         returnDate: returnDateStr,
//         days: borrowLimit,
//       };
//     });
//     setFormData(initial);
//   }, [borrowLimit, borrowedBooks]);

//   // ---------------- Submit Borrow Request ----------------
//   const handleSubmit = async () => {
//     if (!borrowedBooks.length) return;
//     setLoading(true);
  
//     try {
//       const token = localStorage.getItem("token"); // <-- get saved token
//       for (const book of borrowedBooks) {
//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/borrow/borrow/`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,      // <-- include token
//           },
//           body: JSON.stringify({ book_id: book.id }),
//         });
  
//         if (!res.ok) {
//           const err = await res.json().catch(() => ({}));
//           throw new Error(err.detail || `Failed for book ${book.title}`);
//         }
//       }
  
//       alert("Borrow request placed successfully!");
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       alert(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   // ---------------- UI ----------------
//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />

//       <main className="flex-1 p-8">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">
//           Fill Up Book Borrow Form
//         </h1>

//         {!borrowLimit && (
//           <p className="text-gray-500 mb-4">Loading settings…</p>
//         )}

//         <div className="space-y-8">
//           {borrowedBooks.map((book) => {
//             const f = formData[book.id] || {};
//             return (
//               <div
//                 key={book.id}
//                 className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
//               >
//                 <div className="flex items-start gap-6">
//                   <img
//                     src={book.coverImage || book.image}
//                     alt={book.title}
//                     className="w-28 h-36 object-cover rounded"
//                   />

//                   <div className="flex-1">
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {book.title}
//                     </h3>
//                     <p className="text-sm text-gray-500 mb-3">{book.authors}</p>

//                     {/* Borrow info */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Current Date
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.borrowDate || "—"}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Return Date
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.returnDate || "—"}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Borrowing Days
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.days ?? "—"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {borrowedBooks.length > 0 && (
//           <div className="mt-10 text-center">
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md disabled:opacity-50"
//             >
//               {loading ? "Booking…" : "Booked"}
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../Sidebar/Sidebar";

// // Helper: format Date -> yyyy-mm-dd
// const formatDate = (d) => d.toISOString().split("T")[0];

// export default function FillUpForm() {
//   const [borrowedBooks, setBorrowedBooks] = useState([]);
//   const [borrowLimit, setBorrowLimit] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ---------------- Fetch chosen book ----------------
//   useEffect(() => {
//     const books = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
//     const fromState = location.state?.borrowNow || location.state?.book || null;
//     const fromKey = JSON.parse(localStorage.getItem("borrowNow") || "null");
//     const chosen = fromState || fromKey || (books.length ? books[0] : null);
//     setBorrowedBooks(chosen ? [chosen] : []);
//   }, [location.state]);

//   // ---------------- Fetch borrow_day_limit from settings ----------------
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         // your settings endpoint might return an array or object
//         const limit =
//           Array.isArray(data) ? data[0]?.borrow_day_limit : data.borrow_day_limit;
//         setBorrowLimit(limit ?? 14);
//       } catch (err) {
//         console.error("Failed to load settings:", err);
//         setBorrowLimit(14); // fallback
//       }
//     })();
//   }, []);

//   // ---------------- Auto-fill dates once limit is known ----------------
//   useEffect(() => {
//     if (borrowLimit == null || !borrowedBooks.length) return;

//     const today = new Date();
//     const returnDate = new Date();
//     returnDate.setDate(today.getDate() + borrowLimit);

//     const currentDateStr = formatDate(today);
//     const returnDateStr = formatDate(returnDate);

//     const initial = {};
//     borrowedBooks.forEach((b) => {
//       initial[b.id] = {
//         borrowDate: currentDateStr,
//         returnDate: returnDateStr,
//         days: borrowLimit,
//       };
//     });
//     setFormData(initial);
//   }, [borrowLimit, borrowedBooks]);

//   // ---------------- Submit Borrow Request ----------------
//   const handleSubmit = async () => {
//     if (!borrowedBooks.length) return;
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token"); // adjust if you store JWT differently

//       for (const book of borrowedBooks) {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_BASE_URL}/borrow/borrow/`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               ...(token ? { Authorization: `Bearer ${token}` } : {}),
//             },
//             body: JSON.stringify({ book_id: book.id }),
//           }
//         );

//         if (!res.ok) {
//           const err = await res.json().catch(() => ({}));
//           throw new Error(err.detail || `Failed for book ${book.title}`);
//         }
//       }

//       alert("Borrow request placed successfully!");
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       alert(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- UI ----------------
//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />

//       <main className="flex-1 p-8">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">
//           Fill Up Book Borrow Form
//         </h1>

//         {!borrowLimit && (
//           <p className="text-gray-500 mb-4">Loading settings…</p>
//         )}

//         <div className="space-y-8">
//           {borrowedBooks.map((book) => {
//             const f = formData[book.id] || {};
//             return (
//               <div
//                 key={book.id}
//                 className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
//               >
//                 <div className="flex items-start gap-6">
//                   <img
//                     src={book.coverImage || book.image}
//                     alt={book.title}
//                     className="w-28 h-36 object-cover rounded"
//                   />

//                   <div className="flex-1">
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {book.title}
//                     </h3>
//                     <p className="text-sm text-gray-500 mb-3">{book.authors}</p>

//                     {/* Borrow info */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Current Date
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.borrowDate || "—"}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Return Date
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.returnDate || "—"}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Borrowing Days
//                         </label>
//                         <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                           {f.days ?? "—"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {borrowedBooks.length > 0 && (
//           <div className="mt-10 text-center">
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md disabled:opacity-50"
//             >
//               {loading ? "Booking…" : "Booked"}
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

























// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { CalendarDays, Upload, Users, BookOpen, HelpCircle, LogOut } from "lucide-react";
// import Sidebar from "../Sidebar/Sidebar";

// export default function FillUpForm() {
//   const [borrowedBooks, setBorrowedBooks] = useState([]);
//   const [formData, setFormData] = useState({});
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const books = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
//     const fromState = location.state?.borrowNow || location.state?.book || null;
//     const fromKey = JSON.parse(localStorage.getItem("borrowNow") || "null");

//     // Priority: router state > dedicated key > most recently added list item
//     const chosen =
//       fromState ||
//       fromKey ||
//       (books.length ? books[0] : null); // books[0] because we now place newest at front

//     setBorrowedBooks(chosen ? [chosen] : []);
//   }, [location.state]);

//   // Helper: compute whole-day difference from TODAY (local) to the selected return date.
//   const calcBorrowDays = (returnDateStr) => {
//     if (!returnDateStr) return "";
//     const today = new Date();
//     const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//     const rtn = new Date(returnDateStr);
//     const end = new Date(rtn.getFullYear(), rtn.getMonth(), rtn.getDate());
//     const diffMs = end - start;
//     const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
//     return days > 0 ? days : 0; // never negative
//   };

//   const handleChange = (e, bookId) => {
//     const { name, value } = e.target;

//     if (name === "returnDate") {
//       const autoDays = calcBorrowDays(value);
//       setFormData((prev) => ({
//         ...prev,
//         [bookId]: {
//           ...prev[bookId],
//           returnDate: value,
//           days: autoDays,
//         },
//       }));
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [bookId]: {
//         ...prev[bookId],
//         [name]: value,
//       },
//     }));
//   };

//   const handleSubmit = () => {
//     console.log("Submitted Data:", formData);
//     alert("Form submitted successfully!");
//     navigate("/dashboard");
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <main className="flex-1 p-8">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">Fill Up Book Borrow Form</h1>

//         <div className="space-y-8">
//           {borrowedBooks.map((book) => (
//             <div
//               key={book.id}
//               className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
//             >
//               <div className="flex items-start gap-6">
//                 <img
//                   src={book.coverImage || book.image}
//                   alt={book.title}
//                   className="w-28 h-36 object-cover rounded"
//                 />

//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     {book.title}
//                   </h3>
//                   <p className="text-sm text-gray-500 mb-3">{book.authors}</p>

//                   {/* Availability timeline (dummy) */}
//                   <div className="bg-gray-50 border border-dashed border-gray-300 p-3 rounded mb-4">
//                     <p className="text-sm text-gray-600">
//                       <span className="font-medium">Available from:</span> 12 Aug 2025<br />
//                       <span className="font-medium">Must return by:</span> 19 Aug 2025
//                     </p>
//                   </div>

//                   {/* Form fields */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* Borrowing Days: read-only (auto) */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Borrowing Days
//                       </label>
//                       <div className="w-full border rounded px-3 py-2 bg-gray-50">
//                         {formData[book.id]?.days ?? "—"}
//                       </div>
//                     </div>

//                     {/* Return Date */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Return Date
//                       </label>
//                       <input
//                         type="date"
//                         name="returnDate"
//                         className="w-full border rounded px-3 py-2"
//                         value={formData[book.id]?.returnDate || ""}
//                         onChange={(e) => handleChange(e, book.id)}
//                       />
//                     </div>

                   
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-10 text-center">
//           <button
//             onClick={handleSubmit}
//             className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md"
//           >
//             Booked
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }
