
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ onSelect }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch category list
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

  // Central handler for filter setting
  const setFilter = (payload) => {
    if (onSelect) {
      onSelect(payload);
    } else if (payload) {
      navigate("/all-genres", { state: { filter: payload } });
    }
  };

  // ✅ pass category_id as filter.value (not the title) for reliable id-based filtering
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
    <aside className="hidden md:block w-64 bg-white p-4 border-r border-gray-200 sticky top-28 overflow-y-auto space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <Link
              to="/all-genres"
              onClick={() => {
                setActiveCategory(null);
                setFilter(null);
              }}
              className="w-full text-left text-sm text-gray-700 px-2 py-2 rounded block hover:bg-sky-100 transition-all duration-200 font-medium"
            >
              All Genre
            </Link>
          </li>

          {categories.map((cat) => {
            const checked = activeCategory === cat.category_id;
            return (
              <li key={cat.category_id}>
                <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-sky-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span
                    className={`text-sm ${
                      checked ? "text-sky-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    {cat.category_title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-2">
        <button
          onClick={() =>
            setFilter(
              activeCategory
                ? { type: "category", value: activeCategory }
                : null
            )
          }
          className="block mx-auto bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded px-5 py-2"
        >
          Filter
        </button>
      </div>
    </aside>
  );
}



// // Sidebar.jsx
// // Sidebar.jsx
// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function Sidebar({ onSelect }) {
//   const navigate = useNavigate();
//   const [categories, setCategories] = useState([]);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [toast, setToast] = useState({ open: false, text: "", to: "" });

//   // ✅ Fetch categories from public API
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_BASE_URL}/categories/books/category/all`
//         );
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setCategories(data);
//       } catch (err) {
//         console.error("Failed to load categories:", err);
//       }
//     };
//     fetchCategories();
//   }, []);

//   const setFilter = (payload) => {
//     if (onSelect) {
//       onSelect(payload);
//     } else if (payload) {
//       navigate("/all-genres", { state: { filter: payload } });
//     }
//   };

//   const toggleCategory = (cat) => {
//     if (activeCategory === cat.category_id) {
//       setActiveCategory(null);
//       setFilter(null);
//     } else {
//       setActiveCategory(cat.category_id);
//       setFilter({ type: "category", value: cat.category_title });
//     }
//   };

//   return (
//     <aside className="hidden md:block w-64 bg-white p-4 border-r border-gray-200 sticky top-28 overflow-y-auto space-y-6">
//       {/* Popup toast when a category is selected */}
//       {toast.open && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
//           <div className="relative bg-white rounded-md shadow-lg px-6 py-4 text-gray-800">
//             <button
//               aria-label="Close"
//               onClick={() => setToast({ open: false, text: "", to: "" })}
//               className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full w-6 h-6 leading-none grid place-items-center shadow"
//             >
//               ×
//             </button>
//             <div className="text-sm font-medium">{toast.text}</div>
//             {toast.to ? (
//               <div className="mt-2 text-xs">
//                 <Link
//                   to={toast.to}
//                   className="text-sky-600 hover:text-sky-700 underline"
//                 >
//                   View results
//                 </Link>
//               </div>
//             ) : null}
//           </div>
//         </div>
//       )}

//       {/* Category list */}
//       <div>
//         <h3 className="text-base font-semibold mb-3">Categories</h3>
//         <ul className="space-y-1">
//           <li>
//             <Link
//               to="/all-genres"
//               className="w-full text-left text-sm text-gray-700 px-2 py-2 rounded block hover:bg-sky-100 transition-all duration-200 font-medium"
//             >
//               All Genre
//             </Link>
//           </li>

//           {categories.map((cat) => {
//             const checked = activeCategory === cat.category_id;
//             return (
//               <li key={cat.category_id}>
//                 <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-sky-50 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={checked}
//                     onChange={() => toggleCategory(cat)}
//                     className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
//                   />
//                   <span
//                     className={`text-sm ${
//                       checked ? "text-sky-700 font-medium" : "text-gray-700"
//                     }`}
//                   >
//                     {cat.category_title}
//                   </span>
//                 </label>
//               </li>
//             );
//           })}
//         </ul>
//       </div>

//       <div className="pt-2">
//         <button className="block mx-auto bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded px-5 py-2">
//           Filter
//         </button>
//       </div>
//     </aside>
//   );
// }
