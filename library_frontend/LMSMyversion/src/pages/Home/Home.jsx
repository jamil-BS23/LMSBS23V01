

// src/pages/Home/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import axios from "axios";

export default function Home() {
  const [filter, setFilter] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);

  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Scroll refs
  const recRowRef = useRef(null);
  const popRowRef = useRef(null);
  const newRowRef = useRef(null);

  // === Fetch all book sections ===
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = "http://127.0.0.1:8000/books"; // ✅ kept exactly as your original

        const [recRes, popRes, newRes] = await Promise.all([
          axios.get(`${baseUrl}/recommended?page=1&page_size=10`),
          axios.get(`${baseUrl}/popular?page=1&page_size=10`),
          axios.get(`${baseUrl}/new?page=1&page_size=10`),
        ]);

        setRecommendedBooks(recRes.data || []);
        setPopularBooks(popRes.data || []);
        setNewBooks(newRes.data || []);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load book data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get category id/title safely
  const getBookCategoryId = (b) =>
    b?.book_category_id ??
    b?.category_id ??
    (b?.book_category && (b.book_category.category_id ?? b.book_category.id)) ??
    null;

  const getBookCategoryTitle = (b) =>
    b?.category_title ??
    (b?.book_category && (b.book_category.category_title ?? b.book_category.title)) ??
    null;

  // ===== Filter logic like AllGenres.jsx =====
  const applyFilter = (books) => {
    if (!filter) return books;
    if (filter.type !== "category") return books;

    const fv = filter.value;
    const fvNum = Number(fv);
    const useIdCompare = !Number.isNaN(fvNum) && String(fv).trim() !== "";

    return books.filter((b) => {
      const bookCatId = getBookCategoryId(b);
      const bookCatTitle = getBookCategoryTitle(b);

      if (useIdCompare) {
        return bookCatId != null && Number(bookCatId) === fvNum;
      } else {
        const left = (bookCatTitle ?? b.category ?? "").toString().toLowerCase();
        const right = (fv ?? "").toString().toLowerCase();
        return left === right;
      }
    });
  };

  const filteredRecommended = useMemo(
    () => applyFilter(recommendedBooks),
    [filter, recommendedBooks]
  );
  const filteredPopular = useMemo(
    () => applyFilter(popularBooks),
    [filter, popularBooks]
  );
  const filteredNew = useMemo(() => applyFilter(newBooks), [filter, newBooks]);

  const goTo = (id) => navigate(`/book/${id}`);

  const scrollByAmount = (node, dir = 1) => {
    if (!node?.current) return;
    const container = node.current;
    const step = Math.min(360, container.clientWidth * 0.8);
    container.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  // ====== UI: Loading / Error ======
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading book collections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl w-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Sidebar */}
        <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-none md:sticky md:top-20">
          <Sidebar onSelect={setFilter} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
            {/* ======== RECOMMENDED ======== */}
            <BookSection
              title="Recommended"
              data={filteredRecommended}
              refNode={recRowRef}
              onClickBook={goTo}
              scrollByAmount={scrollByAmount}
            />

            {/* ======== POPULAR ======== */}
            <BookSection
              title="Popular"
              data={filteredPopular}
              refNode={popRowRef}
              onClickBook={goTo}
              scrollByAmount={scrollByAmount}
            />

            {/* ======== NEW COLLECTION ======== */}
            <BookSection
              title="New Book Collections"
              data={filteredNew}
              refNode={newRowRef}
              onClickBook={goTo}
              scrollByAmount={scrollByAmount}
            />
          </div>
        </main>
      </div>

      {/* Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedBanner />
      </div>

      {/* Mobile Sidebar Drawer */}
      {openFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpenFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text_base font-semibold text-gray-800">Filters</h3>
              <button
                aria-label="Close filters"
                onClick={() => setOpenFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Sidebar
              onSelect={(v) => {
                setFilter(v);
                setOpenFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Reusable Book Section component
function BookSection({ title, data, refNode, onClickBook, scrollByAmount }) {
  return (
    <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
      <div className="px-4 py-3 bg-white flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {title}
        </h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByAmount(refNode, -1)}
            className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByAmount(refNode, 1)}
            className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 relative bg-white">
        <div ref={refNode} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-5 p-3 sm:p-4 snap-x snap-mandatory">
            {data.length === 0 ? (
              <p className="text-gray-500 text-sm">No books found.</p>
            ) : (
              data.map((b) => (
                <BookCard
                  key={b.book_id}
                  book={{
                    ...b,
                    coverImage: b.book_photo || b.image,
                    rating: Number(b.book_rating) || 0,
                  }}
                  variant="row"
                  status="Available"
                  onClick={() => onClickBook(b.book_id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// // Reusable BookSection component omitted (we inline the markup above to keep your original structure)


// // src/pages/Home/Home.jsx
// import { useEffect, useMemo, useRef, useState } from "react";
// import Sidebar from "../../components/Sidebar/Sidebar";
// import Navbar from "../../components/Navbar/Navbar";
// import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
// import NewBookCollections from "../../components/NewBookCollections/NewBookCollections";
// import { useNavigate } from "react-router-dom";
// import {
//   Star,
//   Filter,
//   X,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import BookCard from "../../components/BookCard/BookCard";
// import axios from "axios";

// export default function Home() {
//   const [filter, setFilter] = useState(null);
//   const [openFilters, setOpenFilters] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState(null);

//   const [recommendedBooks, setRecommendedBooks] = useState([]);
//   const [popularBooks, setPopularBooks] = useState([]);
//   const [newBooks, setNewBooks] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   // Scroll refs
//   const recRowRef = useRef(null);
//   const popRowRef = useRef(null);
//   const newRowRef = useRef(null);

//   // === Fetch all book sections ===
//   useEffect(() => {
//   const fetchData = async () => {
//       setLoading(true);
//       try {
//         const baseUrl = "http://127.0.0.1:8000/books"; // ⚙️ Change base if needed

//         const [recRes, popRes, newRes] = await Promise.all([
//           axios.get(`${baseUrl}/recommended?page=1&page_size=10`),
//           axios.get(`${baseUrl}/popular?page=1&page_size=10`),
//           axios.get(`${baseUrl}/new?page=1&page_size=10`),
//         ]);

//         setRecommendedBooks(recRes.data || []);
//         setPopularBooks(popRes.data || []);
//         setNewBooks(newRes.data || []);
//       } catch (err) {
//         console.error("Error fetching books:", err);
//         setError("Failed to load book data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

  
  

//   // Helpers
//   const getStatus = (b) => {
//     const raw = (b.status || b.stock || "").toString().trim().toLowerCase();

//     if (raw === "available") return "Available";
//     if (raw === "stock out" || raw === "out of stock" || raw === "out")
//       return "Stock Out";
//     if (raw === "upcoming" || raw === "coming soon") return "Upcoming";

//     return "Available";
//   };

//   const statusClasses = (status) => {
//     const s = (status || "").toLowerCase();
//     if (s === "available") return "text-green-600";
//     if (s === "stock out") return "text-red-500";
//     if (s === "upcoming") return "text-amber-600";
//     return "text-gray-600";
//   };

//   const goTo = (id) => navigate(`/book/${id}`);
//   const handleRowScroll = () => {
//     if (openMenuId !== null) setOpenMenuId(null);
//   };

//   const scrollByAmount = (node, dir = 1) => {
//     if (!node?.current) return;
//     const container = node.current;
//     const step = Math.min(360, container.clientWidth * 0.8);
//     container.scrollBy({ left: step * dir, behavior: "smooth" });
//   };

//   // ====== UI: Loading / Error ======
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-600">
//         Loading book collections...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="mx-auto max-w-7xl w-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 gap-4">
//         {/* Sidebar */}
//         <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-none md:sticky md:top-20">
//           <Sidebar onSelect={setFilter} />
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 min-w-0">
//           <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
//             {/* ======== RECOMMENDED ======== */}
//             <BookSection
//               title="Recommended"
//               data={recommendedBooks}
//               refNode={recRowRef}
//               onScroll={handleRowScroll}
//               onClickBook={goTo}
//               scrollByAmount={scrollByAmount}
//             />

//             {/* ======== POPULAR ======== */}
//             <BookSection
//               title="Popular"
//               data={popularBooks}
//               refNode={popRowRef}
//               onScroll={handleRowScroll}
//               onClickBook={goTo}
//               scrollByAmount={scrollByAmount}
//             />

//             {/* ======== NEW COLLECTION ======== */}
//             <BookSection
//               title="New Book Collections"
//               data={newBooks}
//               refNode={newRowRef}
//               onScroll={handleRowScroll}
//               onClickBook={goTo}
//               scrollByAmount={scrollByAmount}
//             />
//           </div>
//         </main>
//       </div>

//       {/* Banner */}
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <FeaturedBanner />
//       </div>

//       {/* Mobile Sidebar Drawer */}
//       {openFilters && (
//         <div className="fixed inset-0 z-50 md:hidden">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
//             onClick={() => setOpenFilters(false)}
//           />
//           <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-4 overflow-y-auto">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text_base font-semibold text-gray-800">Filters</h3>
//               <button
//                 aria-label="Close filters"
//                 onClick={() => setOpenFilters(false)}
//                 className="p-2 hover:bg-gray-100 rounded"
//               >
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>
//             <Sidebar
//               onSelect={(v) => {
//                 setFilter(v);
//                 setOpenFilters(false);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ✅ Reusable Book Section component
// function BookSection({
//   title,
//   data,
//   refNode,
//   onScroll,
//   onClickBook,
//   scrollByAmount,
// }) {
//   return (
//     <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
//       <div className="px-4 py-3 bg-white flex items-center justify-between">
//         <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//           {title}
//         </h2>
//         <div className="hidden sm:flex gap-2">
//           <button
//             onClick={() => scrollByAmount(refNode, -1)}
//             className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
//             aria-label="Scroll left"
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => scrollByAmount(refNode, 1)}
//             className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
//             aria-label="Scroll right"
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       <div className="border-t border-gray-200 relative bg-white">
//         <div
//           ref={refNode}
//           onScroll={onScroll}
//           className="overflow-x-auto no-scrollbar"
//         >
//           <div className="flex gap-5 p-3 sm:p-4 snap-x snap-mandatory">
//             {data.length === 0 ? (
//               <p className="text-gray-500 text-sm">No books found.</p>
//             ) : (
//               data.map((b) => (
//                 <BookCard
//                   key={b.book_id}
//                   book={{
//                     ...b,
//                     coverImage: b.book_photo || b.image,
//                     rating: Number(b.book_rating) || 0, // ✅ ensure numeric rating
//                   }}
//                   variant="row"
//                   status="Available"
//                   onClick={() => onClickBook(b.book_id)}
//                 />

//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

