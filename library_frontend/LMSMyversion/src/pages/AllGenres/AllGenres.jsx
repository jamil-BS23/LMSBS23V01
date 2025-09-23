
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import BookCard from "../../components/BookCard/BookCard";

export default function AllGenres() {
  const navigate = useNavigate();
  const location = useLocation();

  const [allBooks, setAllBooks] = useState([]);
  const [filter, setFilter] = useState(location.state?.filter || null);

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

  // Fetch books from backend API
  useEffect(() => {
    let cancelled = false;
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAllBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load books:", err);
        if (!cancelled) setAllBooks([]);
      }
    };
    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset filter if coming from location state
  useEffect(() => {
    if (location.state?.filter !== undefined) setFilter(location.state.filter);
  }, [location.state]);

  // Helper: read book's category id/title from multiple possible shapes
  const getBookCategoryId = (b) =>
    b?.book_category_id ??
    b?.category_id ??
    (b?.book_category && (b.book_category.category_id ?? b.book_category.id)) ??
    null;

  const getBookCategoryTitle = (b) =>
    b?.category_title ??
    (b?.book_category && (b.book_category.category_title ?? b.book_category.title)) ??
    null;

  // Filtering logic:
  // - If filter.value is numeric -> compare category id (book_category_id / category_id / book_category.id)
  // - Else -> compare category title (case-insensitive)
  const filtered = useMemo(() => {
    if (!filter) return allBooks;
    if (filter.type === "all") return allBooks;

    if (filter.type === "category") {
      const fv = filter.value;
      const fvNum = Number(fv);
      const useIdCompare = !Number.isNaN(fvNum) && String(fv).trim() !== "";

      return allBooks.filter((b) => {
        const bookCatId = getBookCategoryId(b);
        const bookCatTitle = getBookCategoryTitle(b);

        if (useIdCompare) {
          // numeric category id comparison
          return bookCatId != null && Number(bookCatId) === fvNum;
        } else {
          // fallback: compare by category title (string)
          if (!bookCatTitle && !b.category) return false;
          const left = (bookCatTitle ?? b.category ?? "").toString().toLowerCase();
          const right = (fv ?? "").toString().toLowerCase();
          return left === right;
        }
      });
    }

    // keep other filter types unchanged
    return allBooks;
  }, [filter, allBooks]);

  useEffect(() => setPage(1), [filter]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (id) => navigate(`/book/${id}`);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onSelect={setFilter} />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">All Genres</h1>

        <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
          <div className="px-4 py-3 bg-white">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Browse Books
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {pageItems.length ? (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                  {pageItems.map((b) => {
                    // Normalize fields safely
                    const bookId = b.book_id ?? b.id;
                    const title = b.book_title ?? b.title ?? "Untitled";
                    const cover = b.book_photo ?? b.book_image ?? b.coverImage ?? null;
                    // Availability may come as boolean under different keys
                    const availability =
                      b.book_availability ??
                      b.book_availibility ?? // handle possible typo
                      b.availability ??
                      b.available ??
                      null;

                    return (
                      <BookCard
                        key={bookId}
                        book={{
                          id: bookId,
                          title,
                          coverImage: cover,
                          // ensure a boolean (default: false)
                          availability: Boolean(availability),
                          author: b.book_author ?? b.author ?? "",
                          rating: b.book_rating ?? b.rating ?? 0,
                        }}
                        variant="grid"
                        size="scroller"
                        onClick={() => goTo(bookId)}
                        onReadThisBook={() => goTo(bookId)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">No books found.</div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && totalPages > 1 && (
              <div className="px-4 pb-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 text-sm rounded-md border ${
                          n === page
                            ? "bg-sky-600 text-white border-sky-600"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



// import { useNavigate, useLocation } from "react-router-dom";
// import { useMemo, useState, useEffect } from "react";
// import Sidebar from "../../components/Sidebar/Sidebar";
// import BookCard from "../../components/BookCard/BookCard";

// export default function AllGenres() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [allBooks, setAllBooks] = useState([]);
//   const [filter, setFilter] = useState(location.state?.filter || null);

//   const PAGE_SIZE = 9;
//   const [page, setPage] = useState(1);

//   // Fetch books
//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setAllBooks(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load books:", err);
//         setAllBooks([]);
//       }
//     };
//     fetchBooks();
//   }, []);

//   // Reset filter from location state
//   useEffect(() => {
//     if (location.state?.filter !== undefined) setFilter(location.state.filter);
//   }, [location.state]);

//   const filtered = useMemo(() => {
//     if (!filter) return allBooks;
//     if (filter.type === "all") return allBooks;
  
//     if (filter.type === "category") {
//       // Assuming each book has `book_category` object with `id` field
//       return allBooks.filter(
//         (b) =>
//           b.book_category && Number(b.book_category.id) === Number(filter.value)
//       );
//     }
  
//     return allBooks;
//   }, [filter, allBooks]);
  

//   useEffect(() => setPage(1), [filter]);

//   const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   const start = (page - 1) * PAGE_SIZE;
//   const pageItems = filtered.slice(start, start + PAGE_SIZE);

//   const goTo = (id) => navigate(`/book/${id}`);

//   return (
//     <div className="flex min-h-screen bg-white">
//       <Sidebar onSelect={setFilter} />

//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-6">All Genres</h1>

//         <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
//           <div className="px-4 py-3 bg-white">
//             <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//               Browse Books
//             </h2>
//           </div>

//           <div className="border-t border-gray-200">
//             {pageItems.length ? (
//               <div className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
//                   {pageItems.map((b) => (
//                     <BookCard
//                       key={b.book_id}
//                       book={{
//                         id: b.book_id,
//                         title: b.book_title,
//                         coverImage: b.book_photo,
//                         availability: Boolean(b.book_availibility), // ✅ correct boolean
//                         author: b.author,
//                         rating: b.rating,
//                       }}
//                       variant="grid"
//                       size="scroller"
//                       onClick={() => goTo(b.book_id)}
//                       onReadThisBook={() => goTo(b.book_id)}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="p-4 text-sm text-gray-500">No books found.</div>
//             )}

//             {/* Pagination */}
//             {filtered.length > 0 && totalPages > 1 && (
//               <div className="px-4 pb-4 flex items-center justify-between gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
//                     <button
//                       key={n}
//                       onClick={() => setPage(n)}
//                       className={`w-8 h-8 text-sm rounded-md border ${
//                         n === page
//                           ? "bg-sky-600 text-white border-sky-600"
//                           : "border-gray-300 bg-white hover:bg-gray-50"
//                       }`}
//                       aria-current={n === page ? "page" : undefined}
//                     >
//                       {n}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/AllGenres/AllGenres.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { useMemo, useState, useEffect } from "react";
// import Sidebar from "../../components/Sidebar/Sidebar";
// import BookCard from "../../components/BookCard/BookCard";

// export default function AllGenres() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [allBooks, setAllBooks] = useState([]);
//   const [filter, setFilter] = useState(location.state?.filter || null);

//   // Pagination
//   const PAGE_SIZE = 9;
//   const [page, setPage] = useState(1);

//   // Fetch books from backend API
//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_BASE_URL}/books/`
//         );
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setAllBooks(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load books:", err);
//         setAllBooks([]);
//       }
//     };
//     fetchBooks();
//   }, []);

//   // Reset filter if coming from location state
//   useEffect(() => {
//     if (location.state?.filter !== undefined) setFilter(location.state.filter);
//   }, [location.state]);

//   const filtered = useMemo(() => {
//     if (!filter) return allBooks;
//     if (filter.type === "all") return allBooks;
//     if (filter.type === "category") {
//       return allBooks.filter(
//         (b) =>
//           (b.category_title || "").toLowerCase() ===
//           (filter.value || "").toLowerCase()
//       );
//     }
//     return allBooks;
//   }, [filter, allBooks]);

//   useEffect(() => setPage(1), [filter]);

//   const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   const start = (page - 1) * PAGE_SIZE;
//   const pageItems = filtered.slice(start, start + PAGE_SIZE);

//   const goTo = (id) => navigate(`/book/${id}`);

//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Sidebar */}
//       <Sidebar onSelect={setFilter} />

//       {/* Book Grid */}
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-6">All Genres</h1>

//         <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
//           <div className="px-4 py-3 bg-white">
//             <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//               Browse Books
//             </h2>
//           </div>

//           <div className="border-t border-gray-200">
//             {pageItems.length ? (
//               <div className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
//                   {pageItems.map((b) => (
//                    <BookCard
//                    key={b.book_id}
//                    book={{
//                      id: b.book_id,
//                      title: b.book_title,
//                      coverImage: b.book_photo,
//                      availability: b.book_availibility, // <-- ensure boolean
//                      author: b.author,
//                      rating: b.rating,
//                    }}
//                    variant="grid"
//                    size="scroller"
//                    onClick={() => goTo(b.book_id)}
//                    onReadThisBook={() => goTo(b.book_id)}
//                  />
                 
//                   ))}



//                 </div>
//               </div>
//             ) : (
//               <div className="p-4 text-sm text-gray-500">No books found.</div>
//             )}

//             {/* Pagination */}
//             {filtered.length > 0 && totalPages > 1 && (
//               <div className="px-4 pb-4 flex items-center justify-between gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (n) => (
//                       <button
//                         key={n}
//                         onClick={() => setPage(n)}
//                         className={`w-8 h-8 text-sm rounded-md border ${
//                           n === page
//                             ? "bg-sky-600 text-white border-sky-600"
//                             : "border-gray-300 bg-white hover:bg-gray-50"
//                         }`}
//                         aria-current={n === page ? "page" : undefined}
//                       >
//                         {n}
//                       </button>
//                     )
//                   )}
//                 </div>

//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/AllGenres/AllGenres.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { useMemo, useState, useEffect } from "react";
// import books from "../../data/sampleBooks";
// import Sidebar from "../../components/Sidebar/Sidebar";
// import BookCard from "../../components/BookCard/BookCard";

// const getStockStatus = (title = "") => {
//   const t = title.toLowerCase();
//   if (t.includes("out")) return "Stock Out";
//   if (t.includes("upcoming")) return "Upcoming";
//   return "Available";
// };

// // tiny helper to format countdowns like "2d 4h", "3h 12m", "12m"
// const formatCountdown = (targetMs, nowMs) => {
//   const diff = Math.max(0, new Date(targetMs).getTime() - nowMs);
//   const mins = Math.floor(diff / 60000);
//   const days = Math.floor(mins / (60 * 24));
//   const hours = Math.floor((mins % (60 * 24)) / 60);
//   const minutes = mins % 60;
//   if (days > 0) return `${days}d ${hours}h`;
//   if (hours > 0) return `${hours}h ${minutes}m`;
//   return `${minutes}m`;
// };

// const isToday = (dt) => {
//   const d = new Date(dt);
//   const n = new Date();
//   return (
//     d.getFullYear() === n.getFullYear() &&
//     d.getMonth() === n.getMonth() &&
//     d.getDate() === n.getDate()
//   );
// };

// export default function AllGenres() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const allBooks = [
//     ...(books?.recommended || []),
//     ...(books?.popular || []),
//     ...(books?.featuredBooks || []), // safe if missing
//   ];

//   const [filter, setFilter] = useState(location.state?.filter || null);

//   // pagination
//   const PAGE_SIZE = 9; // keep your paging logic
//   const [page, setPage] = useState(1);

//   const [now, setNow] = useState(Date.now());
//   useEffect(() => {
//     const id = setInterval(() => setNow(Date.now()), 60000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     if (location.state?.filter !== undefined) setFilter(location.state.filter);
//   }, [location.state]);

//   const filtered = useMemo(() => {
//     if (!filter) return allBooks;
//     if (filter.type === "all") return allBooks;
//     if (filter.type === "category") {
//       return allBooks.filter(
//         (b) =>
//           (b.category || "").toLowerCase() ===
//           (filter.value || "").toLowerCase()
//       );
//     }
//     if (filter.type === "subcategory") {
//       return allBooks.filter(
//         (b) =>
//           (b.category || "").toLowerCase() ===
//           (filter.parent || "").toLowerCase()
//       );
//     }
//     return allBooks;
//   }, [filter, allBooks]);

//   useEffect(() => {
//     setPage(1);
//   }, [filter]);

//   const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   const start = (page - 1) * PAGE_SIZE;
//   const pageItems = filtered.slice(start, start + PAGE_SIZE);

//   const goTo = (id) => navigate(`/book/${id}`);

//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Sidebar */}
//       <Sidebar onSelect={setFilter} />

//       {/* Book Grid */}
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-6">All Genres</h1>

//         <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
//           <div className="px-4 py-3 bg-white">
//             <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//               Browse Books
//             </h2>
//           </div>

//           <div className="border-t border-gray-200">
//             {pageItems.length ? (
//               <div className="p-4">
//                 {/* EXACT 3-COLUMN GRID ON DESKTOP, SAME CARD SIZE AS SCROLLER */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
//                   {pageItems.map((b) => (
//                     <BookCard
//                       key={b.id}
//                       book={{
//                         ...b,
//                         coverImage: b.coverImage || b.image, // map to shared card field
//                         status: b.status || getStockStatus(b.title),
//                       }}
//                       variant="grid"
//                       size="scroller"
//                       status={b.status || getStockStatus(b.title)}
//                       onClick={() => goTo(b.id)}
//                       onReadThisBook={() => goTo(b.id)}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="p-4 text-sm text-gray-500">No books found.</div>
//             )}

//             {/* Pagination (unchanged) */}
//             {filtered.length > 0 && totalPages > 1 && (
//               <div className="px-4 pb-4 flex items-center justify-between gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 bg_white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (n) => (
//                       <button
//                         key={n}
//                         onClick={() => setPage(n)}
//                         className={`w-8 h-8 text-sm rounded-md border ${
//                           n === page
//                             ? "bg-sky-600 text-white border-sky-600"
//                             : "border-gray-300 bg-white hover:bg-gray-50"
//                         }`}
//                         aria-current={n === page ? "page" : undefined}
//                       >
//                         {n}
//                       </button>
//                     )
//                   )}
//                 </div>

//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
