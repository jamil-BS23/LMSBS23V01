

// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import BookDetails from "./pages/BookDetails/BookDetails";
import Borrowed from "./pages/Borrowed/Borrowed";
import FillUpForm from "./components/FillUpForm/FillUpForm";
import Dashboard from "./pages/Dashboad/Dashboad";
import UploadBookPage from "./components/Upload/UploadBookPage";
import AllGenres from "./pages/AllGenres/AllGenres";
import ManageBooks from "./pages/ManageBooks/ManageBooks";
import ManageCategory from "./pages/ManageCategory/ManageCategory";
import UserDashboard from "./pages/User/UserDashboard";
import MyLoansBlank from "./pages/MyLoansBlank/MyLoansBlank";
import UserSettings from "./pages/UserSettings/UserSettings";
import UserHistory from "./pages/UserHistory/UserHistory";
import AdminSettings from "./pages/AdminSettings/AdminSettings";
import ManageFeature from "./pages/ManageFeature/ManageFeature";
import DonationRequest from "./pages/DonationRequest/DonationRequest";
import AuthGate from "./pages/AuthGate/AuthGate";
import CalendarPage from "./pages/Calendar/CalendarPage";
import Login from "./pages/Auth/Login";
import { AuthProvider } from "./Providers/AuthProvider";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import Unauthorized from "./pages/Unauthorized/Unauthorized";

// ✅ Create a wrapper component to use useLocation()
function AppContent() {
  const location = useLocation();

  // ✅ Define paths where Navbar should be hidden
  const hideNavbarPaths = ["/login", "/unauthorized"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* ✅ Conditionally render Navbar */}
      {shouldShowNavbar && <Navbar />}

      <main className="flex-grow text-black">
        <Routes>
          <Route element={<Layout />}>
            {/* ✅ Public routes - accessible to all users */}
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/all-genres" element={<AllGenres />} />
            <Route path="/calendar" element={<CalendarPage />} />
            
            {/* ✅ User-only routes - accessible to authenticated users */}
            <Route path="/borrowed" element={
              <RoleBasedRoute allowedRoles={['user', 'admin']}>
                <Borrowed />
              </RoleBasedRoute>
            } />
            <Route path="/user" element={
              <RoleBasedRoute allowedRoles={['user']}>
                <UserDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/loans" element={
              <RoleBasedRoute allowedRoles={['user', 'admin']}>
                <MyLoansBlank />
              </RoleBasedRoute>
            } />
            <Route path="/settings" element={
              <RoleBasedRoute allowedRoles={['user', 'admin']}>
                <UserSettings />
              </RoleBasedRoute>
            } />
            <Route path="/history" element={
              <RoleBasedRoute allowedRoles={['user', 'admin']}>
                <UserHistory />
              </RoleBasedRoute>
            } />
            <Route path="/fill-up-form" element={
              <RoleBasedRoute allowedRoles={['user', 'admin']}>
                <FillUpForm />
              </RoleBasedRoute>
            } />

            {/* ✅ Admin-only routes - accessible only to admin users */}
            <Route path="/dashboard" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <Dashboard />
              </RoleBasedRoute>
            } />
            <Route path="/upload" element={
              <RoleBasedRoute allowedRoles={['user','admin']}>
                <UploadBookPage />
              </RoleBasedRoute>
            } />
            <Route path="/manage-books" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageBooks />
              </RoleBasedRoute>
            } />
            <Route path="/manage-category" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageCategory />
              </RoleBasedRoute>
            } />
            <Route path="/setting" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </RoleBasedRoute>
            } />
            <Route path="/manage-feature" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageFeature />
              </RoleBasedRoute>
            } />
            <Route path="/donation-request" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <DonationRequest />
              </RoleBasedRoute>
            } />
            <Route path="/authgate" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AuthGate />
              </RoleBasedRoute>
            } />
          </Route>

          {/* ✅ Standalone routes (no Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </main>
    </>
  );
}

// ✅ Main App with BrowserRouter
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// // src/App.jsx
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Layout from "./components/Layout/Layout";
// import Navbar from "./components/Navbar/Navbar";
// import Home from "./pages/Home/Home";
// import BookDetails from "./pages/BookDetails/BookDetails";
// import Borrowed from "./pages/Borrowed/Borrowed";
// import FillUpForm from "./components/FillUpForm/FillUpForm";
// import Dashboard from "./pages/Dashboad/Dashboad";
// import UploadBookPage from "./components/Upload/UploadBookPage";
// import AllGenres from "./pages/AllGenres/AllGenres";
// import ManageBooks from "./pages/ManageBooks/ManageBooks";
// import ManageCategory from "./pages/ManageCategory/ManageCategory";
// import UserDashboard from "./pages/User/UserDashboard";
// import MyLoansBlank from "./pages/MyLoansBlank/MyLoansBlank";
// import UserSettings from "./pages/UserSettings/UserSettings";
// import UserHistory from "./pages/UserHistory/UserHistory";
// import AdminSettings from "./pages/AdminSettings/AdminSettings";
// import ManageFeature from "./pages/ManageFeature/ManageFeature";
// import DonationRequest from "./pages/DonationRequest/DonationRequest";
// import AuthGate from "./pages/AuthGate/AuthGate";
// import CalendarPage from "./pages/Calendar/CalendarPage";
// import Login from "./pages/Auth/Login";
// import { AuthProvider } from "./Providers/AuthProvider"; // ✅ import

// export default function App() {
//   return (
//     <BrowserRouter>
//       {/* ✅ AuthProvider MUST be INSIDE BrowserRouter */}
//       <AuthProvider>
//         <Navbar />

//         <main className="flex-grow text-black">
//           <Routes>
//             <Route element={<Layout />}>
//               <Route path="/" element={<Home />} />
//               <Route path="/book/:id" element={<BookDetails />} />
//               <Route path="/borrowed" element={<Borrowed />} />
//               <Route path="/fill-up-form" element={<FillUpForm />} />
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/upload" element={<UploadBookPage />} />
//               <Route path="/all-genres" element={<AllGenres />} />
//               <Route path="/manage-books" element={<ManageBooks />} />
//               <Route path="/manage-category" element={<ManageCategory />} />
//               <Route path="/user" element={<UserDashboard />} />
//               <Route path="/loans" element={<MyLoansBlank />} />
//               <Route path="/settings" element={<UserSettings />} />
//               <Route path="/history" element={<UserHistory />} />
//               <Route path="/setting" element={<AdminSettings />} />
//               <Route path="/manage-feature" element={<ManageFeature />} />
//               <Route path="/donation-request" element={<DonationRequest />} />
//               <Route path="/authgate" element={<AuthGate />} />
//               <Route path="/calendar" element={<CalendarPage />} />
//             </Route>

//             {/* Login route stands alone */}
//             <Route path="/login" element={<Login />} />
//           </Routes>
//         </main>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }