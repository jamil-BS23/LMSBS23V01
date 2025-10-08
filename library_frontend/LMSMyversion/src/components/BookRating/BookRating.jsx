import React, { useState } from "react";
import { Star } from "lucide-react";
import api from "../../config/api";

export default function BookRating({ bookId, currentRating }) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (value) => {
    try {
      setLoading(true);
      // ✅ Send rating as JSON payload
      await api.patch(`/books/${bookId}/rate`, { rating: value });
      setRating(value);
    } catch (err) {
      console.error("Rating failed:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Failed to rate book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-6 h-6 cursor-pointer ${
            i <= (hover || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleRate(i)}
        />
      ))}
      {loading && <span className="text-sm text-gray-500 ml-2">Saving...</span>}
    </div>
  );
}
