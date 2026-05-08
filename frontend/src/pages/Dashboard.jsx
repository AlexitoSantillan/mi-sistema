import { useEffect, useState } from "react";
import { testBackend } from "../services/api";

function Dashboard() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    testBackend().then((data) => {
      setMensaje(data.mensaje);
    });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>

        <p>{mensaje}</p>

        <hr style={{ margin: "20px 0" }} />

        <h3>Resumen del Sistema</h3>

        <p>✅ Backend conectado</p>
        <p>✅ Login funcionando</p>
        <p>✅ Base de datos conectada</p>
      </div>
    </div>
  );
}

export default Dashboard;