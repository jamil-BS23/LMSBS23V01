// // src/components/Navbar/Navbar.jsx
// import {
//   Bell,
//   MessageSquare,
//   Search,
//   Upload,
//   UserCircle,
//   X,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AppLauncherMenu from "./AppLauncherMenu";
// import { useAuth } from "../../Providers/AuthProvider";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const { isAuthenticated, user, logout } = useAuth();

//   const [showSearch, setShowSearch] = useState(false);
//   const [query, setQuery] = useState("");
//   const [books, setBooks] = useState([]);
//   const [openNoti, setOpenNoti] = useState(false);
//   const [openMsg, setOpenMsg] = useState(false);
//   const [openUser, setOpenUser] = useState(false);
//   const [openGrid, setOpenGrid] = useState(false);

//   const searchRef = useRef(null);
//   const gridRef = useRef(null);

//   // Load books for search
//   useEffect(() => {
//     let alive = true;
//     fetch("/books.json")
//       .then((r) => r.json())
//       .then((data) => {
//         if (alive) setBooks(Array.isArray(data) ? data : []);
//       })
//       .catch(() => setBooks([]));
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // Close popups on outside click
//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (!searchRef.current) return;
//       const insideSearch = searchRef.current.contains(e.target);
//       const insideGrid = gridRef.current && gridRef.current.contains(e.target);
//       if (!insideSearch && !insideGrid) {
//         setOpenNoti(false);
//         setOpenMsg(false);
//         setOpenUser(false);
//         setOpenGrid(false);
//       }
//     };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const results = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return [];
//     const hit = (v) => typeof v === "string" && v.toLowerCase().includes(q);
//     return books
//       .filter(
//         (b) =>
//           hit(b.title) ||
//           hit(b.authors || b.author || "") ||
//           hit(b.category || "") ||
//           hit(b.summary || b.description || "")
//       )
//       .slice(0, 8);
//   }, [books, query]);

//   const goToBook = (id) => {
//     setQuery("");
//     setShowSearch(false);
//     navigate(`/book/${id}`);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (results[0]) goToBook(results[0].id);
//   };

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 bg-white">
//       <div className="flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
//         {/* Logo + grid menu */}
//         <div className="flex items-center h-full">
//           <Link to="/" className="flex items-center h-full">
//             <img
//               src="/BSlogo-removebg-preview.png"
//               alt="Logo"
//               className="h-[80] w-auto max-h-[120px] object-contain cursor-pointer px-15"
//             />
//           </Link>

//           <AppLauncherMenu
//             gridRef={gridRef}
//             openGrid={openGrid}
//             setOpenGrid={setOpenGrid}
//             setOpenNoti={setOpenNoti}
//             setOpenMsg={setOpenMsg}
//             setOpenUser={setOpenUser}
//           />
//         </div>

//         {/* Right icons */}
//         <div className="flex items-center gap-3 sm:gap-4 h-full" ref={searchRef}>
//           {/* ✅ SHOW Upload only for admin or authenticated users */}
//           {isAuthenticated && user?.role === "admin" && (
//             <Link
//               to="/upload"
//               className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm sm:text-base"
//             >
//               <Upload className="w-4 h-4" />
//               <span>Upload</span>
//             </Link>
//           )}

//           <div className="flex items-center gap-3 sm:gap-4 relative">
//             {/* Notifications */}
//             <button
//               type="button"
//               onClick={() => {
//                 setOpenNoti((v) => !v);
//                 setOpenMsg(false);
//                 setOpenUser(false);
//                 setOpenGrid(false);
//               }}
//               className="relative"
//             >
//               <Bell className="w-5 h-5 text-gray-700" />
//               <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
//             </button>

//             {/* Messages */}
//             <button
//               type="button"
//               onClick={() => {
//                 setOpenMsg((v) => !v);
//                 setOpenNoti(false);
//                 setOpenUser(false);
//                 setOpenGrid(false);
//               }}
//             >
//               <MessageSquare className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* Search */}
//             <button
//               type="button"
//               onClick={() => {
//                 setShowSearch((v) => !v);
//                 setOpenGrid(false);
//               }}
//             >
//               <Search className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* User menu */}
//             <button
//               type="button"
//               onClick={() => {
//                 setOpenUser((v) => !v);
//                 setOpenNoti(false);
//                 setOpenMsg(false);
//                 setOpenGrid(false);
//               }}
//             >
//               <UserCircle className="w-6 h-6 text-gray-700" />
//             </button>

//             {/* Dropdown menu */}
//             {openUser && (
//               <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
//                 <div className="px-4 py-3 border-b">
//                   <div className="text-sm text-gray-600">
//                     {isAuthenticated ? "Signed in as" : "Welcome"}
//                   </div>
//                   <div className="font-semibold text-gray-800">
//                     {isAuthenticated && user?.name ? user.name : "Guest"}
//                   </div>
//                 </div>

//                 <ul className="py-1 text-sm">
//                   {/* ✅ ROLE-BASED DASHBOARD BUTTON */}
//                   {isAuthenticated && user?.role === "admin" && (
//                     <li>
//                       <button
//                         className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
//                         onClick={() => {
//                           setOpenUser(false);
//                           navigate("/dashboard");
//                         }}
//                       >
//                         Admin Dashboard
//                       </button>
//                     </li>
//                   )}

//                   {isAuthenticated && user?.role === "user" && (
//                     <li>
//                       <button
//                         className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
//                         onClick={() => {
//                           setOpenUser(false);
//                           navigate("/user");
//                         }}
//                       >
//                         My Dashboard
//                       </button>
//                     </li>
//                   )}

//                   {/* ✅ Upload only for admins */}
//                   {isAuthenticated && user?.role === "admin" && (
//                     <li>
//                       <button
//                         className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
//                         onClick={() => {
//                           setOpenUser(false);
//                           navigate("/upload");
//                         }}
//                       >
//                         Upload a Book
//                       </button>
//                     </li>
//                   )}
//                 </ul>

//                 <div className="border-t">
//                   {isAuthenticated ? (
//                     <button
//                       className="w-full px-4 py-2 text-left text-sky-600 font-semibold hover:bg-gray-50"
//                       onClick={() => {
//                         setOpenUser(false);
//                         logout(); // ⬅️ Sign out via context
//                       }}
//                     >
//                       Sign Out
//                     </button>
//                   ) : (
//                     <button
//                       className="w-full px-4 py-2 text-left text-sky-600 font-semibold hover:bg-gray-50"
//                       onClick={() => {
//                         setOpenUser(false);
//                         navigate("/login"); // ⬅️ Go to login page
//                       }}
//                     >
//                       Sign In
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Search overlay */}
//       <div
//         className={`transition-[max-height] duration-300 ease-out overflow-hidden border-t border-gray-100 ${
//           showSearch ? "max-h-80" : "max-h-0"
//         }`}
//       >
//         <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
//           <form
//             onSubmit={handleSearchSubmit}
//             className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 h-11"
//           >
//             <Search className="w-5 h-5 text-gray-500" />
//             <input
//               autoFocus
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by title, author, category…"
//               className="flex-1 bg-transparent outline-none text-sm px-3"
//             />
//             {query && (
//               <button
//                 type="button"
//                 className="p-1 rounded-full hover:bg-gray-200"
//                 onClick={() => setQuery("")}
//               >
//                 <X className="w-4 h-4 text-gray-500" />
//               </button>
//             )}
//             <button
//               type="submit"
//               className="ml-2 px-4 h-8 rounded-full text-white bg-sky-500 hover:bg-sky-600 text-sm font-medium"
//             >
//               Search
//             </button>
//           </form>
//         </div>
//       </div>
//     </header>
//   );
// }





// src/components/Navbar/Navbar.jsx
import {
  Bell,
  MessageSquare,
  Search,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLauncherMenu from "./AppLauncherMenu";
import { useAuth } from "../../Providers/AuthProvider";   

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // ✅ Debug logging
  console.log("🧭 Navbar - Auth state:", { isAuthenticated, user, userRole: user?.role });    

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [openNoti, setOpenNoti] = useState(false);
  const [openMsg, setOpenMsg] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openGrid, setOpenGrid] = useState(false);

  const searchRef = useRef(null);
  const gridRef = useRef(null);

  // Load books for search
  useEffect(() => {
    let alive = true;
    fetch("/books.json")
      .then((r) => r.json())
      .then((data) => {
        if (alive) setBooks(Array.isArray(data) ? data : []);
      })
      .catch(() => setBooks([]));
    return () => {
      alive = false;
    };
  }, []);

  // Close popups on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchRef.current) return;
      const insideSearch = searchRef.current.contains(e.target);
      const insideGrid = gridRef.current && gridRef.current.contains(e.target);
      if (!insideSearch && !insideGrid) {
        setOpenNoti(false);
        setOpenMsg(false);
        setOpenUser(false);
        setOpenGrid(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hit = (v) => typeof v === "string" && v.toLowerCase().includes(q);
    return books
      .filter(
        (b) =>
          hit(b.title) ||
          hit(b.authors || b.author || "") ||
          hit(b.category || "") ||
          hit(b.summary || b.description || "")
      )
      .slice(0, 8);
  }, [books, query]);

  const goToBook = (id) => {
    setQuery("");
    setShowSearch(false);
    navigate(`/book/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (results[0]) goToBook(results[0].id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo + grid menu */}
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center h-full">
            <img
              src="/BSlogo-removebg-preview.png"
              alt="Logo"
              className="h-[80] w-auto max-h-[120px] object-contain cursor-pointer px-15"
            />
          </Link>

          <AppLauncherMenu
            gridRef={gridRef}
            openGrid={openGrid}
            setOpenGrid={setOpenGrid}
            setOpenNoti={setOpenNoti}
            setOpenMsg={setOpenMsg}
            setOpenUser={setOpenUser}
          />
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3 sm:gap-4 h-full" ref={searchRef}>
          {/* ✅ Show Upload button only for admin users */}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/upload"
              className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm sm:text-base"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>
          )}

          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => {
                setOpenNoti((v) => !v);
                setOpenMsg(false);
                setOpenUser(false);
                setOpenGrid(false);
              }}
              className="relative"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* Messages */}
            <button
              type="button"
              onClick={() => {
                setOpenMsg((v) => !v);
                setOpenNoti(false);
                setOpenUser(false);
                setOpenGrid(false);
              }}
            >
              <MessageSquare className="w-5 h-5 text-gray-700" />
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={() => {
                setShowSearch((v) => !v);
                setOpenGrid(false);
              }}
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* User menu */}
            <button
              type="button"
              onClick={() => {
                setOpenUser((v) => !v);
                setOpenNoti(false);
                setOpenMsg(false);
                setOpenGrid(false);
              }}
            >
              <UserCircle className="w-6 h-6 text-gray-700" />
            </button>

            {/* Dropdown */}
            {openUser && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <div className="text-sm text-gray-600">
                    {isAuthenticated ? "Signed in as" : "Welcome"}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {isAuthenticated && user?.name ? user.name : "Guest"}
                  </div>
                </div>
                <ul className="py-1 text-sm">
                  {/* ✅ Role-based Dashboard button */}
                  {isAuthenticated && user?.role === "admin" && (
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => {
                          setOpenUser(false);
                          navigate("/dashboard");
                        }}
                      >
                        Admin Dashboard
                      </button>
                    </li>
                  )}

                  {isAuthenticated && user?.role === "user" && (
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => {
                          setOpenUser(false);
                          navigate("/user");
                        }}
                      >
                        My Dashboard
                      </button>
                    </li>
                  )}

                  {/* ✅ Show Upload only for admins */}
                  {isAuthenticated && user?.role === "admin" && (
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => {
                          setOpenUser(false);
                          navigate("/upload");
                        }}
                      >
                        Upload a Book
                      </button>
                    </li>
                  )}

                  {/* ✅ Show user-specific links for all authenticated users */}
                  {isAuthenticated && (
                    <>
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                          onClick={() => {
                            setOpenUser(false);
                            navigate("/borrowed");
                          }}
                        >
                          My Borrowed Books
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                          onClick={() => {
                            setOpenUser(false);
                            navigate("/settings");
                          }}
                        >
                          Settings
                        </button>
                      </li>
                    </>
                  )}
                </ul>
                <div className="border-t">
                  {isAuthenticated ? (
                    <button
                      className="w-full px-4 py-2 text-left text-sky-600 font-semibold hover:bg-gray-50"
                      onClick={() => {
                        setOpenUser(false);
                        logout();              // ⬅️ Sign out via context
                      }}
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      className="w-full px-4 py-2 text-left text-sky-600 font-semibold hover:bg-gray-50"
                      onClick={() => {
                        setOpenUser(false);
                        navigate("/login");   // ⬅️ Go to login page
                      }}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      <div
        className={`transition-[max-height] duration-300 ease-out overflow-hidden border-t border-gray-100 ${
          showSearch ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 h-11"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, category…"
              className="flex-1 bg-transparent outline-none text-sm px-3"
            />
            {query && (
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => setQuery("")}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              type="submit"
              className="ml-2 px-4 h-8 rounded-full text-white bg-sky-500 hover:bg-sky-600 text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}




