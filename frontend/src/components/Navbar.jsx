import { Link } from "react-router-dom";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <Link to="/">Dashboard</Link>
      <Link to="/vencimientos">Vencimientos</Link>

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default Navbar;