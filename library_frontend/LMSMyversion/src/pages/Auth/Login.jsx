// src/pages/Login.jsx
// import { useAuth } from "../../Providers/AuthProvider";
// import { useState } from "react";

import { useState } from "react";
import { useAuth } from "../../Providers/AuthProvider";
import { authService } from "../../services/authService";


export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend expects { user_name, password }
      const { access_token } = await authService.login({ user_name: username, password });
      // Notify auth context; you can pass token or minimal user info
      login({ name: username, token: access_token });
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md w-80">
        <h2 className="text-xl mb-4 text-center font-semibold text-gray-800">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-md text-black placeholder-gray-500 mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md text-black placeholder-gray-500 mb-4"
        />
        {error && <p className="text-red-600 text-sm text-center mb-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white p-2 rounded-md hover:bg-sky-700 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}



// // src/pages/Auth/Login.jsx
// import { useState } from "react";
// import { useAuth } from "../../Providers/AuthProvider";
// import Navbar from "../../components/Navbar/Navbar";
// import Footer from "../../components/Footer/Footer";

// export default function Login() {
//   const { login } = useAuth(); // assumes login() can accept a token if needed
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const formData = new FormData(e.target);
//     const user_name = formData.get("user_name");
//     const password = formData.get("password");

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_name, password }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.detail || "Login failed");
//       }

//       const data = await res.json();
//       // store token for later requests
//       localStorage.setItem("access_token", data.access_token);

//       // trigger global auth (if your provider accepts token pass it here)
//       login(data.access_token);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Navbar />
//       <main className="flex-1">
//         <div className="max-w-md mx-auto p-6">
//           <h1 className="text-2xl font-semibold mb-4">Login</h1>

//           <form
//             onSubmit={handleSubmit}
//             className="space-y-4 bg-white p-4 rounded-xl border"
//           >
//             <input
//               name="user_name"
//               type="text"
//               placeholder="Username"
//               className="w-full p-3 border rounded-md text-black placeholder-gray-500"
//               required
//             />
//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               className="w-full p-3 border rounded-md text-black placeholder-gray-500"
//               required
//             />
//             {error && (
//               <p className="text-red-600 text-sm text-center">{error}</p>
//             )}
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













