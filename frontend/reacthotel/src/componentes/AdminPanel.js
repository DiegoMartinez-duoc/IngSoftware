import React, { useState, useEffect } from "react";
import "../estilos/Admin.css";
import grafoImg from "../img/grafo.png"

const AdminPanel = () => {
  const [reporteTipo, setReporteTipo] = useState("");
  const [reportePeriodo, setReportePeriodo] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [error, setError] = useState("");

  // -----------------------
  // Funciones para backend
  // -----------------------

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
      <div className="metricas-admin-wrapper">
          <div>
            <h3 className="texto">Generar Reporte</h3>
            <select value={reporteTipo} onChange={(e) => setReporteTipo(e.target.value)}>
              <option value="">--Seleccione tipo--</option>
              <option value="hoy">Hoy</option>
              <option value="mes">Del mes</option>
              <option value="anual">Del año</option>
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
          </div>

          {error && <p className="error">{error}</p>}

          <div className="metricas-grid">

          

            <h5 style={{fontSize:"medium", width:"200px"}} className="texto seccion-titulo">Ingresos del mes</h5>
            <img style={{width:"400px", position: "absolute", top: "100px"}} id="grafoImg1" src={grafoImg} alt="Habitación" />

            <h5 style={{fontSize:"medium", width:"300px"}} className="texto seccion-titulo">Cantidad de reservas del mes</h5>
            <img style={{width:"400px", position: "absolute", top: "100px", left:"550px"}} id="grafoImg2" src={grafoImg} alt="Habitación" />

            <h5 style={{fontSize:"medium", width:"300px"}} className="texto seccion-titulo">Cantidad de usuarios del mes</h5>
            <img style={{width:"400px", position: "absolute", top: "100px", left:"1100px"}} id="grafoImg2" src={grafoImg} alt="Habitación" />

            <h5 style={{fontSize:"medium", width:"340px"}} className="texto seccion-titulo">Cantidad de calificaciones del mes</h5>
            <img style={{width:"400px", position: "absolute", top: "100px", left:"1650px"}} id="grafoImg2" src={grafoImg} alt="Habitación" />
            

          </div>
        
          
        
      </div>
    </div>
  );
};

export default AdminPanel;
