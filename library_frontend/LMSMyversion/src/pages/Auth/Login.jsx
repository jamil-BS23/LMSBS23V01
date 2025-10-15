
import { useState } from "react";
import { useAuth } from "../../Providers/AuthProvider";
import { authService } from "../../services/authService";
import { User, Lock } from "lucide-react";

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
      const { access_token } = await authService.login({ user_name: username, password });
      
      // ✅ Decode JWT token to extract user role
      const getUserRoleFromToken = (token) => {
        try {
          if (!token) return 'user';
          
          // Decode JWT token (payload is in the middle part)
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          return decoded.role || 'user';
        } catch (error) {
          console.error('Error decoding token:', error);
          return 'user'; // Default to user role if decoding fails
        }
      };

      const userRole = getUserRoleFromToken(access_token);
      
      console.log("🔑 JWT Token decoded role:", userRole);
      console.log("🔑 Token payload:", access_token.split('.')[1] ? JSON.parse(atob(access_token.split('.')[1])) : "Invalid token");
      
      // ✅ Pass complete user info including role
      login({ 
        name: username, 
        role: userRole,
        token: access_token 
      });
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxzpiVrE0pato_ORYPxjARD0lhz9eCrfXSlg&s"
              alt="Brain Station 23"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-cyan-500">BRAIN STATION 23</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-normal text-gray-800 mb-8">Log in</h1>

            {/* Microsoft Login Button */}
            <button
              type="button"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded flex items-center justify-center gap-3 mb-6 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#00a4ef"/>
                <rect x="1" y="11" width="9" height="9" fill="#7fba00"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span>Continue with Microsoft</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-4 py-2">
                  {error}
                </div>
              )}

              <div className="text-left">
                <a href="#" className="text-sm text-cyan-500 hover:text-cyan-600">
                  Forgotten your username or password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Log in"}
              </button>
            </form>

            <div className="mt-8 text-sm text-gray-600">
              <p>Cookies must be enabled in your browser. <a href="#" className="text-cyan-500 hover:text-cyan-600">Cookies notice</a>.</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Copyright (c) Brainstation 23 LMS - 2025. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-cyan-500">Data retention summary</a>
            <a href="#" className="hover:text-cyan-500">Get the mobile app</a>
          </div>
        </div>
      </div>

      {/* Right Section - Background Image */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lms.elearning23.com/pluginfile.php/1/theme_mb2nl/loginbgimage/1759833157/brain-station-23-picnic-2022.jpg')`
        }}
      ></div>
    </div>
  );
}


// src/pages/Login.jsx
// import { useAuth } from "../../Providers/AuthProvider";
// import { useState } from "react";

// import { useState } from "react";
// import { useAuth } from "../../Providers/AuthProvider";
// import { authService } from "../../services/authService";


// export default function Login() {
//   const { login } = useAuth();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // Backend expects { user_name, password }
//       const { access_token } = await authService.login({ user_name: username, password });
//       // Notify auth context; you can pass token or minimal user info
//       login({ name: username, token: access_token });
//     } catch (err) {
//       setError(err?.response?.data?.detail || err.message || "Login failed");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md w-80">
//         <h2 className="text-xl mb-4 text-center font-semibold text-gray-800">Login</h2>
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-full p-3 border rounded-md text-black placeholder-gray-500 mb-3"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-3 border rounded-md text-black placeholder-gray-500 mb-4"
//         />
//         {error && <p className="text-red-600 text-sm text-center mb-2">{error}</p>}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-sky-600 text-white p-2 rounded-md hover:bg-sky-700 disabled:opacity-70"
//         >
//           {loading ? "Signing in..." : "Sign In"}
//         </button>
//       </form>
//     </div>
//   );
// }



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













