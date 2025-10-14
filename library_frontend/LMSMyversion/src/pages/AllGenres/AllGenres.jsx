
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

  // ✅ Fetch all books
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

  // ✅ Update filter if coming from Sidebar navigation
  useEffect(() => {
    if (location.state?.filter !== undefined) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  // Helpers to read category info safely
  const getBookCategoryId = (b) =>
    b?.book_category_id ??
    b?.category_id ??
    b?.categoryId ??
    (b?.book_category && (b.book_category.category_id ?? b.book_category.id)) ??
    null;

  const getBookCategoryTitle = (b) =>
    b?.category_title ??
    b?.categoryTitle ??
    (b?.book_category &&
      (b.book_category.category_title ?? b.book_category.title)) ??
    null;

    //console.log("book:", b);

  // ✅ Filtering by category id or title
  const filtered = useMemo(() => {
    if (!filter) return allBooks;
    if (filter.type !== "category") return allBooks;

    const fv = filter.value;
    const fvNum = Number(fv);
    const useIdCompare = !Number.isNaN(fvNum) && String(fv).trim() !== "";

    return allBooks.filter((b) => {
      const bookCatId = getBookCategoryId(b);
      const bookCatTitle = getBookCategoryTitle(b);

      if (useIdCompare) {
        return bookCatId != null && Number(bookCatId) === fvNum;
      } else {
        // compare by category title (case-insensitive)
        const left = (bookCatTitle ?? b.category ?? "").toString().toLowerCase();
        const right = (fv ?? "").toString().toLowerCase();
        return left === right;
      }
    });
  }, [filter, allBooks]);

  // ✅ Reset pagination when filter changes
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
      {/* 🔑 Pass setFilter down so Sidebar can update filter directly */}
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
                    const bookId = b.book_id ?? b.id;
                    const title = b.book_title ?? b.title ?? "Untitled";
                    const cover = b.book_photo ?? b.book_image ?? b.coverImage;
                    const availability =
                      b.book_availability ??
                      b.book_availibility ??
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


