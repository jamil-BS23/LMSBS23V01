


// src/providers/AuthProvider.jsx
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem("lms_auth") === "true";
    console.log("🔐 AuthProvider init - isAuthenticated:", authStatus);
    return authStatus;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lms_user");
    const userData = stored ? JSON.parse(stored) : null;
    console.log("🔐 AuthProvider init - user:", userData);
    return userData;
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



  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (user.role === "admin") navigate("/dashboard", { replace: true });
  //     else navigate("/user", { replace: true });
  //   }
  // }, []); // run only once
  

  // after successful API login
  const login = (userInfo) => {
    console.log("🔐 Login function called with userInfo:", userInfo);
    setIsAuthenticated(true);
    setUser(userInfo); // userInfo must contain role: "admin" or "user"

    console.log("🔐 Login successful - User info:", userInfo);
    console.log("🔐 User role:", userInfo.role);
    console.log("🔐 Role type:", typeof userInfo.role);
    
    // ✅ Role-based redirect
    if (userInfo.role === "admin") {
      console.log("🔐 Redirecting admin to dashboard");
      navigate("/dashboard", { replace: true });
    } else {
      console.log("🔐 Redirecting user to user dashboard");
      navigate("/user", { replace: true });
    }
  };

  // const login = (userInfo) => {
  //   setIsAuthenticated(true);
  //   setUser(userInfo); // userInfo must contain role: "admin" or "user"
  //   console.log("Role:  ", userInfo);
  //   // ✅ Role-based redirect
  //   if (userInfo.role === "admin") {
  //     navigate("/dashboard", { replace: true });
  //   } else {
  //     navigate("/user", { replace: true });
  //   }
  // };
  

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
