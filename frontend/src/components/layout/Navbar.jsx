function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Sistema Vencimiento Confiteria Albeyro
      </div>

      <div className="navbar-links">
        <a href="/">Dashboard</a>
        <a href="/vencimientos">Vencimientos</a>
      </div>

      <div className="navbar-right">
        <button onClick={logout}>
          Cerrar sesion
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
