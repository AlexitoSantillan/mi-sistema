import { useState } from "react";
import api from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      if (res.data?.success && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        window.location.href = "/";
        return;
      }

      setError("Credenciales incorrectas");
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div>
          <h1>Confiteria Albeyro</h1>
          <p>Control de inventario y vencimientos</p>
        </div>

        <label>
          Usuario
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
          />
        </label>

        <label>
          Contrasena
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="admin"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}

export default Login;
