// // src/pages/Auth/Login.jsx
// import { useState } from "react";
// import { useAuth } from "../../Providers/AuthProvider";
// import Navbar from "../../components/Navbar/Navbar";
// import Footer from "../../components/Footer/Footer";

// export default function Login() {
//   const { login } = useAuth();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // TODO: call your real API here; on success do login();
//     setTimeout(() => {
//       login(); // navigates to "/"
//     }, 600);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Navbar />
//       <main className="flex-1">
//         <div className="max-w-md mx-auto p-6">
//           <h1 className="text-2xl font-semibold mb-4">Login</h1>
//           <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl border">
//             <input
//               type="email"
//               placeholder="Email"
//               className="w-full border rounded-lg px-3 py-2"
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full border rounded-lg px-3 py-2"
//               required
//             />
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-lg px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-70"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
