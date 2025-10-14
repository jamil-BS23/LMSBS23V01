// components/Navbar/AppLauncherMenu.jsx
import { CgMenuGridR } from "react-icons/cg";
import { Link } from "react-router-dom";
import { GraduationCap, Home, BookOpen, Calendar, Settings, Upload, Users, BarChart3, Shield } from "lucide-react";
import { useAuth } from "../../Providers/AuthProvider";

export default function AppLauncherMenu({
  gridRef,
  openGrid,
  setOpenGrid,
  setOpenNoti,
  setOpenMsg,
  setOpenUser,
}) {
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="relative ml-2" ref={gridRef}>
      <button
        type="button"
        aria-label="Open app menu"
        onClick={() => {
          setOpenGrid((v) => !v);
          // close others to avoid overlap
          setOpenNoti(false);
          setOpenMsg(false);
          setOpenUser(false);
        }}
        className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <CgMenuGridR className="w-6 h-6 text-gray-600" />
      </button>

      {openGrid && (
        <div className="absolute left-0 top-10 w-64 bg-white border border-gray-200 rounded-xl shadow-lg">
          <ul className="py-2">
            {/* ✅ Public navigation items - always visible */}
            <li>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Home className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/all-genres"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <BookOpen className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">All Books</span>
              </Link>
            </li>
            <li>
              <Link
                to="/calendar"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Calendar className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">Calendar</span>
              </Link>
            </li>

            {/* ✅ User-specific navigation items */}
            {isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/borrowed"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <GraduationCap className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">My Borrowed Books</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Settings className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                </li>
              </>
            )}

            {/* ✅ Admin-only navigation items */}
            {isAuthenticated && user?.role === "admin" && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <BarChart3 className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Admin Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/upload"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Upload className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Upload Book</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manage-books"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <BookOpen className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Manage Books</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manage-category"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Users className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Manage Categories</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donation-request"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                    onClick={() => setOpenGrid(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Shield className="w-4 h-4 text-gray-700" />
                    </span>
                    <span className="text-sm font-medium">Donation Requests</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
