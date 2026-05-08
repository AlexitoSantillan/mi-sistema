import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Vencimientos from "./pages/Vencimientos";
import "./index.css";

function App() {
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("auth") === "true"
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(localStorage.getItem("auth") === "true");
    };

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      {isAuth && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={!isAuth ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/vencimientos"
          element={isAuth ? <Vencimientos /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;