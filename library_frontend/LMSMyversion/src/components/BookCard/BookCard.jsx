

import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function BookCard({ book, compact = false }) {
  const safe = (v, d = "") => (v === undefined || v === null ? d : v);

  // ----- status -----
  const getStatus = (b) => {
    // Most reliable: explicit boolean fields
    if (typeof b?.availability === "boolean") return b.availability ? "Available" : "Not Available";
    if (typeof b?.book_availability === "boolean") return b.book_availability ? "Available" : "Not Available";
    if (typeof b?.book_availibility === "boolean") return b.book_availibility ? "Available" : "Not Available"; // typo guard
    if (typeof b?.available === "boolean") return b.available ? "Available" : "Not Available";
    if (typeof b?.inStock === "boolean") return b.inStock ? "Available" : "Not Available";

    // numeric count field (if present)
    if (typeof b?.book_count === "number") return b.book_count > 0 ? "Available" : "Not Available";

    // string status fallback
    const s = (b?.status || "").toString().trim().toLowerCase();
    if (s.includes("out")) return "Stock Out";
    if (s.includes("upcoming") || s.includes("coming")) return "Upcoming";

    // default
    return "Available";
  };

  const statusText = getStatus(book);
  const statusColor =
    statusText === "Stock Out"
      ? "text-red-600"
      : statusText === "Upcoming"
      ? "text-amber-600"
      : statusText === "Not Available"
      ? "text-red-600"
      : "text-green-600";

  // rating (stars only)
  const rating = Number(book?.rating ?? 0);

  // ----- title break after 3 words -----
  const formatTitle = (t) => {
    const title = safe(t, "Untitled").toString().trim();
    const words = title.split(/\s+/);
    if (words.length <= 3) return title;
    const first = words.slice(0, 3).join(" ");
    const rest = words.slice(3).join(" ");
    return `${first}\n${rest}`;
  };

  // boolean for availability for small-badge usage
  const isAvailable = statusText === "Available";

  return (
    <div className="relative w-[200px] sm:w-[200px] snap-start group select-none flex-shrink-0">
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

      <div className="px-1 pt-3 text-center flex flex-col items-center min-h-[170px]">
        <h3 className="text-sm font-semibold text-gray-900 whitespace-pre-line line-clamp-2">
          {formatTitle(book?.title || book?.book_title)}
        </h3>

        {book?.author && (
          <p className="mt-0.5 text-xs text-gray-600">{book.author}</p>
        )}

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

        {/* Status badge (keeps your design) */}
        {!compact && (
          <span
            className={`mt-2 text-xs font-medium inline-flex items-center ${statusColor}`}
          >
            <span
              className={`h-3 w-3 rounded-full mr-2 animate-ping ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
            />
            {statusText}
          </span>
        )}

        {!compact && (
          <div className="mt-3">
            <Link
              to={`/book/${book.id ?? book.book_id}`}
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




// import { Star } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function BookCard({ book, compact = false }) {
//   const safe = (v, d = "") => (v === undefined || v === null ? d : v);

//   // rating (stars only, no count)
//   const rating = Number(book?.rating ?? 0);

//   // ----- title: break after 3 words -----
//   const formatTitle = (t) => {
//     const title = safe(t, "Untitled").toString().trim();
//     const words = title.split(/\s+/);
//     if (words.length <= 3) return title;
//     const first = words.slice(0, 3).join(" ");
//     const rest = words.slice(3).join(" ");
//     return `${first}\n${rest}`;
//   };

//   return (
//     <div className="relative w-[200px] sm:w-[200px] snap-start group select-none flex-shrink-0">
//       {/* Cover image */}
//       <div className="mx-auto h-56 w-full flex items-center justify-center">
//         <img
//           src={safe(book?.coverImage, book?.image)}
//           alt={safe(book?.title, "Book cover")}
//           loading="lazy"
//           className="
//             h-full w-auto object-contain rounded-md
//             drop-shadow-[0_14px_22px_rgba(0,0,0,0.06)]
//             transition-transform duration-300 group-hover:scale-[1.03]
//           "
//         />
//       </div>

//       {/* Body */}
//       <div className="px-1 pt-3 text-center flex flex-col items-center min-h-[170px]">
//         {/* Title */}
//         <h3 className="text-sm font-semibold text-gray-900 whitespace-pre-line line-clamp-2">
//           {formatTitle(book?.title)}
//         </h3>

//         {book?.author && (
//           <p className="mt-0.5 text-xs text-gray-600">{book.author}</p>
//         )}

//         {/* Stars */}
//         {!compact && (
//           <div className="mt-2 flex items-center justify-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`w-4 h-4 ${
//                   i < Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
//                 }`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Availability Status */}
//         {!compact && (
//           <span
//             className={`mt-2 text-xs font-medium inline-flex items-center ${
//               book.availability ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             <span
//               className={`h-3 w-3 rounded-full mr-2 animate-ping ${
//                 book.availability ? "bg-green-500" : "bg-red-500"
//               }`}
//             ></span>
//             {book.availability ? "Available" : "Not Available"}
//           </span>
//         )}

//         {/* View Details button */}
//         {!compact && (
//           <div className="mt-3">
//             <Link
//               to={`/book/${book.id}`}
//               className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-md shadow-md"
//             >
//               View Details
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// import { Star } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function BookCard({ book, compact = false }) {
//   const safe = (v, d = "") => (v === undefined || v === null ? d : v);

//   // ----- status -----
  

//   // rating (stars only, no count)
//   const rating = Number(book?.rating ?? 0);

//   // ----- title: break after 3 words (forces second line) -----
//   const formatTitle = (t) => {
//     const title = safe(t, "Untitled").toString().trim();
//     const words = title.split(/\s+/);
//     if (words.length <= 3) return title;
//     const first = words.slice(0, 3).join(" ");
//     const rest = words.slice(3).join(" ");
//     return `${first}\n${rest}`;
//   };

//   return (
//     // Narrower fixed width so rows tend to show 4 full + a half-peek
//     <div className="relative w-[200px] sm:w-[200px] snap-start group select-none flex-shrink-0">
//       {/* Cover image in a fixed-size box (no white background, just a light bottom shadow) */}
//       <div className="mx-auto h-56 w-full flex items-center justify-center">
//         <img
//           src={safe(book?.coverImage, book?.image)}
//           alt={safe(book?.title, "Book cover")}
//           loading="lazy"
//           className="
//             h-full w-auto object-contain rounded-md
//             drop-shadow-[0_14px_22px_rgba(0,0,0,0.06)]
//             transition-transform duration-300 group-hover:scale-[1.03]
//           "
//         />
//       </div>

//       {/* Body — fixed min height to keep button in the same vertical spot */}
//       <div className="px-1 pt-3 text-center flex flex-col items-center min-h-[170px]">
//         {/* Title (3-word line break retained) */}
//         <h3 className="text-sm font-semibold text-gray-900 whitespace-pre-line line-clamp-2">
//           {formatTitle(book?.title)}
//         </h3>

//         {book?.author && (
//           <p className="mt-0.5 text-xs text-gray-600">{book.author}</p>
//         )}

//         {/* Stars */}
//         {!compact && (
//           <div className="mt-2 flex items-center justify-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`w-4 h-4 ${
//                   i < Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
//                 }`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Status */}
//         {/* Availability Status */}
//         {/* Status */}
//         {!compact && (
//           <span
//             className={`mt-2 text-xs font-medium inline-flex items-center ${book.availability ? "text-green-600" : "text-red-600"
//               }`}
//           >
//             <span
//               className={`h-3 w-3 rounded-full mr-2 animate-ping ${book.availability ? "bg-green-500" : "bg-red-500"
//                 }`}
//             ></span>
//             {book.availability ? "Available" : "Not Available"}
//           </span>
//         )}




//         {/* View Details button BELOW the status (centered, no overlay) */}
//         {!compact && (
//           <div className="mt-3">
//             <Link
//               to={`/book/${book.id}`}
//               className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-md shadow-md"
//             >
//               View Details
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



