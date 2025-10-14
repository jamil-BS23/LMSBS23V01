import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book } from "lucide-react"; // optional icon for categories

export default function Sidebar({ onSelect }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/categories/books/category/all`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const setFilter = (payload) => {
    if (onSelect) {
      onSelect(payload);
    } else if (payload) {
      navigate("/all-genres", { state: { filter: payload } });
    }
  };

  const toggleCategory = (cat) => {
    if (activeCategory === cat.category_id) {
      setActiveCategory(null);
      setFilter(null);
    } else {
      setActiveCategory(cat.category_id);
      setFilter({ type: "category", value: cat.category_id });
    }
  };

  return (
    <aside className="hidden md:block w-64 bg-white p-4 border-r border-gray-200 sticky top-28 overflow-y-auto space-y-6 shadow-lg rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Categories</h3>
        <ul className="space-y-2">
          <li>
            <Link
              to="/all-genres"
              onClick={() => {
                setActiveCategory(null);
                setFilter(null);
              }}
              className="w-full flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-sky-100 hover:shadow transition-all duration-200 font-medium"
            >
              <Book size={16} className="text-sky-400" />
              All Genre
            </Link>
          </li>

          {categories.map((cat) => {
            const checked = activeCategory === cat.category_id;
            return (
              <li key={cat.category_id}>
                <label
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                    ${checked ? "bg-sky-50 shadow-inner border-l-4 border-sky-500" : "hover:bg-sky-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span
                    className={`text-sm ${checked ? "text-sky-700 font-semibold" : "text-gray-700"}`}
                  >
                    {cat.category_title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-4">
        <button
          onClick={() =>
            setFilter(
              activeCategory
                ? { type: "category", value: activeCategory }
                : null
            )
          }
          className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-semibold rounded-lg px-5 py-2 shadow-md transition-all duration-200"
        >
          Apply Filter
        </button>
      </div>
    </aside>
  );
}

