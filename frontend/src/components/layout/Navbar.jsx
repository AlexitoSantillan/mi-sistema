import { Link } from "react-router-dom";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="navbar-logo">
        Sistema Vencimiento Confiteria Albeyro
      </div>

      {/* MENUS */}
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>

        <Link to="/vencimientos">
          Vencimientos
        </Link>
      </div>

      {/* DERECHA */}
      <div className="navbar-right">
        <button onClick={logout}>
          Cerrar sesión
        </button>
      </div>

    </nav>
  );
}

export default Navbar;