

// import React, { useState, useEffect } from "react";
// import api from "../../config/api";

// export default function BookReviews({ bookId }) {
//   const [reviews, setReviews] = useState([]);
//   const [newReview, setNewReview] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch reviews
//   useEffect(() => {
//     if (!bookId) return;

//     const fetchReviews = async () => {
//       try {
//         const response = await api.get(`/books/books/${bookId}/reviews`);
//         setReviews(response.data);
//       } catch (err) {
//         console.error("Failed to load reviews:", err.response?.data || err);
//       }
//     };

//     fetchReviews();
//   }, [bookId]);

//   // ✅ Add review
//   const handleAddReview = async () => {
//     if (!newReview.trim()) return alert("Please write a review first!");
//     if (!bookId) return alert("Book ID is missing!");
//     setLoading(true);

//     try {
//       await api.post(`/books/books/${bookId}/review`, {
//         book_id: bookId,
//         review_text: newReview,
//       });

//       const response = await api.get(`/books/books/${bookId}/reviews`);
//       setReviews(response.data);
//       setNewReview("");
//     } catch (err) {
//       console.error("Error adding review:", err.response?.data || err);
//       alert("Failed to submit review. Please check login or token.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-10">
//       <h2 className="text-2xl font-bold mb-6">Book Reviews</h2>

//       {/* ✅ Review List */}
//       {reviews.length === 0 ? (
//         <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
//       ) : (
//         <div className="space-y-6">
//           {reviews.map((r) => (
//             <div
//               key={r.review_id}
//               className="flex gap-4 p-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
//             >
//               {/* Avatar/Initial */}
//               <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-lg shrink-0">
//                 {r.user_id?.[0]?.toUpperCase() || "U"}
//               </div>

//               {/* Review content */}
//               <div className="flex-1">
//                 <p className="text-gray-800 text-sm sm:text-base">{r.review_text}</p>
//                 <span className="text-gray-400 text-xs mt-1 block">
//                   {new Date(r.created_at).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ✅ Add Review Form */}
//       <div className="mt-8">
//         <h4 className="text-lg font-semibold mb-2">Submit Your Review</h4>
//         <textarea
//           value={newReview}
//           onChange={(e) => setNewReview(e.target.value)}
//           placeholder="Write your review..."
//           className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base resize-none transition-all duration-200"
//           rows={4}
//           maxLength={500}
//         />
//         <div className="flex justify-between items-center mt-2">
//           <span className="text-gray-400 text-sm">{newReview.length}/500</span>
//           <button
//             onClick={handleAddReview}
//             disabled={loading}
//             className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "Sending..." : "Submit Review"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiFillLike,
  AiFillDislike,
} from "react-icons/ai";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import api from "../../config/api";

export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  // ✅ Fetch reviews
  useEffect(() => {
    if (!bookId) return;

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/books/books/${bookId}/reviews`);
        const reviewsWithReactions = response.data.map((r) => ({
          ...r,
          likes: r.likes || 0,
          dislikes: r.dislikes || 0,
          userReaction: null,
        }));
        setReviews(reviewsWithReactions);
      } catch (err) {
        console.error("Failed to load reviews:", err.response?.data || err);
      }
    };

    fetchReviews();
  }, [bookId]);

  // ✅ Add review
  const handleAddReview = async () => {
    if (!newReview.trim()) return alert("Please write a review first!");
    if (!bookId) return alert("Book ID is missing!");
    setLoading(true);

    try {
      await api.post(`/books/books/${bookId}/review`, {
        book_id: bookId,
        review_text: newReview,
      });

      const response = await api.get(`/books/books/${bookId}/reviews`);
      setReviews(response.data);
      setNewReview("");
      setCurrentPage(1); // Reset to first page
    } catch (err) {
      console.error("Error adding review:", err.response?.data || err);
      alert("Failed to submit review. Please check login or token.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle like/dislike (UI only)
  const handleReaction = (id, type) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.review_id !== id) return r;

        let updatedLikes = r.likes;
        let updatedDislikes = r.dislikes;
        let newReaction = r.userReaction;

        if (type === "like") {
          if (r.userReaction === "like") {
            updatedLikes--;
            newReaction = null;
          } else {
            updatedLikes++;
            if (r.userReaction === "dislike") updatedDislikes--;
            newReaction = "like";
          }
        } else if (type === "dislike") {
          if (r.userReaction === "dislike") {
            updatedDislikes--;
            newReaction = null;
          } else {
            updatedDislikes++;
            if (r.userReaction === "like") updatedLikes--;
            newReaction = "dislike";
          }
        }

        return {
          ...r,
          likes: Math.max(0, updatedLikes),
          dislikes: Math.max(0, updatedDislikes),
          userReaction: newReaction,
        };
      })
    );
  };

  // ✅ Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Reviews</h2>

      {/* ✅ Review List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <>
          <div className="space-y-6">
            {currentReviews.map((r) => (
              <div
                key={r.review_id}
                className="flex gap-4 p-5 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                {/* Avatar */}
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-lg shrink-0">
                  {r.user_id?.[0]?.toUpperCase() || "U"}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    {r.review_text}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleString()}
                    </span>

                    {/* Like / Dislike Section */}
                    <div className="flex items-center gap-4 text-gray-500">
                      <button
                        onClick={() => handleReaction(r.review_id, "like")}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        {r.userReaction === "like" ? (
                          <AiFillLike className="text-blue-600" size={18} />
                        ) : (
                          <AiOutlineLike size={18} />
                        )}
                        <span className="text-sm">{r.likes}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(r.review_id, "dislike")}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        {r.userReaction === "dislike" ? (
                          <AiFillDislike className="text-red-500" size={18} />
                        ) : (
                          <AiOutlineDislike size={18} />
                        )}
                        <span className="text-sm">{r.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdNavigateBefore size={18} /> Prev
            </button>

            <span className="text-gray-600 font-medium text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <MdNavigateNext size={18} />
            </button>
          </div>
        </>
      )}

      {/* ✅ Add Review Form */}
      <div className="mt-10">
        <h4 className="text-lg font-semibold mb-2">Submit Your Review</h4>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review..."
          className="w-full border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base resize-none transition-all duration-200"
          rows={4}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400 text-sm">{newReview.length}/500</span>
          <button
            onClick={handleAddReview}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
