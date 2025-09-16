


// src/providers/AuthProvider.jsx
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("lms_auth") === "true";
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  // keep localStorage synced
  useEffect(() => {
    localStorage.setItem("lms_auth", isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("lms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("lms_user");
    }
  }, [user]);

  // after successful API login
  const login = (userInfo) => {
    setIsAuthenticated(true);
    setUser(userInfo); // e.g. { name: "Jamil Ahmed" }
    navigate("/", { replace: true });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);






// // src/providers/AuthProvider.jsx
// import { createContext, useContext, useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   // Persist across refresh
//   const [isAuthenticated, setIsAuthenticated] = useState(() => {
//     return localStorage.getItem("lms_auth") === "true";
//   });

//   const navigate = useNavigate();

//   // Keep localStorage synced
//   useEffect(() => {
//     localStorage.setItem("lms_auth", isAuthenticated ? "true" : "false");
//   }, [isAuthenticated]);

//   // Call after real API login success
//   const login = () => {
//     setIsAuthenticated(true);
//     navigate("/", { replace: true }); // go straight to Home
//   };

//   // Call from Logout button
//   const logout = () => {
//     setIsAuthenticated(false);
//     // (Optional) clear tokens here if you store any
//     navigate("/welcome", { replace: true }); // show front page
//   };

//   const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => useContext(AuthContext);
