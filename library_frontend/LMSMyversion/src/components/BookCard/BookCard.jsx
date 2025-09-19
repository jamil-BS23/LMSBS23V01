
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function BookCard({ book, compact = false }) {
  const safe = (v, d = "") => (v === undefined || v === null ? d : v);

  // ----- status -----
  const getStatus = (b) => {
    if (typeof b?.inStock === "boolean") return b.inStock ? "Available" : "Stock Out";
    const s = (b?.status || "").toString().trim().toLowerCase();
    if (s.includes("out")) return "Stock Out";
    if (s.includes("upcoming") || s.includes("coming")) return "Upcoming";
    return "Available";
  };
  const statusText = getStatus(book);
  const statusColor =
    statusText === "Stock Out"
      ? "text-red-600"
      : statusText === "Upcoming"
      ? "text-amber-600"
      : "text-green-600";

  // rating (stars only, no count)
  const rating = Number(book?.rating ?? 0);

  // ----- title: break after 3 words (forces second line) -----
  const formatTitle = (t) => {
    const title = safe(t, "Untitled").toString().trim();
    const words = title.split(/\s+/);
    if (words.length <= 3) return title;
    const first = words.slice(0, 3).join(" ");
    const rest = words.slice(3).join(" ");
    return `${first}\n${rest}`;
  };

  return (
    // Narrower fixed width so rows tend to show 4 full + a half-peek
    <div className="relative w-[200px] sm:w-[200px] snap-start group select-none flex-shrink-0">
      {/* Cover image in a fixed-size box (no white background, just a light bottom shadow) */}
      <div className="mx-auto h-56 w-full flex items-center justify-center">
        <img
          src={safe(book?.coverImage, book?.image)}
          alt={safe(book?.title, "Book cover")}
          loading="lazy"
          className="
            h-full w-auto object-contain rounded-md
            drop-shadow-[0_14px_22px_rgba(0,0,0,0.06)]
            transition-transform duration-300 group-hover:scale-[1.03]
          "
        />
      </div>

      {/* Body — fixed min height to keep button in the same vertical spot */}
      <div className="px-1 pt-3 text-center flex flex-col items-center min-h-[170px]">
        {/* Title (3-word line break retained) */}
        <h3 className="text-sm font-semibold text-gray-900 whitespace-pre-line line-clamp-2">
          {formatTitle(book?.title)}
        </h3>

        {book?.author && (
          <p className="mt-0.5 text-xs text-gray-600">{book.author}</p>
        )}

        {/* Stars */}
        {!compact && (
          <div className="mt-2 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* Status */}
        {!compact && (
          <div className={`mt-2 text-xs font-medium ${statusColor}`}>
            {statusText}
          </div>
        )}

        {/* View Details button BELOW the status (centered, no overlay) */}
        {!compact && (
          <div className="mt-3">
            <Link
              to={`/book/${book.id}`}
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-md shadow-md"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}



