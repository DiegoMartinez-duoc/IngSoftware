import React, { useState, useEffect } from "react";
import "../estilos/Admin.css";

const AdminPanel = () => {
  const [step, setStep] = useState(1);
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reporteTipo, setReporteTipo] = useState("");
  const [reportePeriodo, setReportePeriodo] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [error, setError] = useState("");

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // -----------------------
  // Funciones para backend
  // -----------------------
  const fetchReservasConfirmadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/hotel/reservas/confirmadas/");
      const data = await res.json();
      if (data.success) {
        setReservas(data.reservas);
      } else {
        setError(data.error || "Error al cargar reservas confirmadas");
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:8000/hotel/usuarios/");
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.usuarios);
      } else {
        setError(data.error || "Error al cargar usuarios");
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

  const generarReporte = async () => {
    try {
      const res = await fetch("http://localhost:8000/hotel/reportes/generar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: reporteTipo,
          periodo: reportePeriodo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReporteGenerado(data.reporte);
      } else {
        setError(data.error || "Error al generar reporte");
      }
    } catch (err) {
      setError("Error de conexión con backend");
    }
  };

  // -----------------------
  // Renderizado por pasos
  // -----------------------
  return (
    <div className="admin-container">
      <div className="gran-wrapper">
        <h2 className="texto">Panel Administrador - Paso {step}</h2>

        {step === 1 && (
          <>
            <p>Seleccione acción:</p>
            <button onClick={() => { fetchReservasConfirmadas(); nextStep(); }}>Revisar reservas confirmadas</button>
            <button onClick={() => { fetchUsuarios(); nextStep(); }}>Gestión de usuarios</button>
            <button onClick={() => nextStep()}>Generar reportes</button>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Reservas Confirmadas</h3>
            <ul>
              {reservas.map((r) => (
                <li key={r.id}>
                  {r.cliente} - {r.habitacion} - {r.entrada} → {r.salida} - ${r.monto}
                </li>
              ))}
            </ul>
            <button onClick={prevStep}>Atrás</button>
          </>
        )}

        {step === 3 && (
          <>
            <h3>Gestión de Usuarios</h3>
            <ul>
              {usuarios.map((u) => (
                <li key={u.id}>
                  {u.nombre} - {u.email} - {u.telefono} - Rol: {u.rol}
                </li>
              ))}
            </ul>
            <button onClick={prevStep}>Atrás</button>
          </>
        )}

        {step === 4 && (
          <>
            <h3>Generar Reporte</h3>
            <select value={reporteTipo} onChange={(e) => setReporteTipo(e.target.value)}>
              <option value="">--Seleccione tipo--</option>
              <option value="ventas">Ventas</option>
              <option value="ocupacion">Ocupación</option>
            </select>
            <input
              type="text"
              placeholder="Periodo (ej: 2025-09)"
              value={reportePeriodo}
              onChange={(e) => setReportePeriodo(e.target.value)}
            />
            <button onClick={generarReporte}>Generar</button>

            {reporteGenerado && (
              <div>
                <h4>Reporte generado:</h4>
                <pre>{JSON.stringify(reporteGenerado, null, 2)}</pre>
              </div>
            )}

            <button onClick={prevStep}>Atrás</button>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
