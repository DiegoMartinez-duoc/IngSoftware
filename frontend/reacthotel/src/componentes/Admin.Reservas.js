import React, { useState, useEffect } from "react";
import "../estilos/Admin.css";
import calendarioImg from "../img/octubre.png"

const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);


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

  useEffect(() => {
      fetchReservasConfirmadas();
    }, []);

  

  // -----------------------
  // Renderizado por pasos
  // -----------------------
  return (
    <div className="admin-container">
      <div className="admin-reserva-wrapper">

       
          <div>
            <h5 style={{fontSize:"medium"}}  className="texto seccion-titulo">Reservas</h5>
            <div className="reservas-grid">
              {reservas.map((r) => (
                <div className="reserva-card" key={r.id}>
                  <img className="reservaImg" src={`http://localhost:8000/media/${r.imagen}`} alt="Habitación" />
                  <div className="reserva-info">
                    <strong>Reservado por: {r.cliente}</strong>
                    Habitación: {r.habitacion}<br />
                    {/* Entrada: {r.entrada}<br />
                    Salida: {r.salida}<br /> */}
                    
                    <button style={{marginLeft:"0px"}} onClick={() => setHabitacionSeleccionada(r)}>Ver</button>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
    
        {error && <p className="error">{error}</p>}

        
        <h5 style={{fontSize:"medium"}}  className="texto seccion-titulo">Calendario de reservas</h5>
        <img className="calendarioImg" src={calendarioImg} alt="Habitación" />
        
        {habitacionSeleccionada && ( 
          <div style={{width:"750px", marginLeft:"300px"}} className="detalle-derecha">
          <h3>{habitacionSeleccionada.habitacion || "Título de la habitación"}</h3>
          <img
            src={
              habitacionSeleccionada.id
                ? `http://localhost:8000/media/${habitacionSeleccionada.imagen}`
                : "/img/habitacion-default.jpg"
            }
            alt={habitacionSeleccionada.habitacion || "Habitación predeterminada"}
            style={{ width: "180px", borderRadius: "10px", marginBottom: "10px" }}
          />
          <p>{"Reservada por " + habitacionSeleccionada.cliente}</p>
          <p>{"Entrada " + habitacionSeleccionada.entrada}</p>
          <p>{"Salida " + habitacionSeleccionada.salida}</p>
          <p>{"Monto " + habitacionSeleccionada.monto_total}</p>
          <p>
            {habitacionSeleccionada.descripcion ||
              "Descripción de la habitación. Aquí se mostrará información relevante sobre la habitación seleccionada, aunque no haya datos disponibles aún."}
          </p>
        </div>
        )}


      </div>
      <div className="espacio-inferior">
        <div style={{marginTop:"25px"}} className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Habitaciones con mejor calificacion</h5>
          <div style={{height:"150px" , display:"flex", marginTop:"70px", marginLeft:"-265px"}} className="reservas-stat-grid">
            {reservas.length > 0 && (
              <div className="reserva-stat-card" key={reservas[0].id}>
                <img className="reservaStatImg" src={`http://localhost:8000/media/${reservas[0].imagen}`} alt="Empleado" />
                <div className="reserva-stat-info">
                  <strong>Reservado por: {reservas[0].cliente}</strong>
                    Habitación: {reservas[0].habitacion}<br />
                    Monto: ${reservas[0].monto_total}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop:"25px"}} className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Habitaciones más reservadas del mes</h5>
          <div style={{height:"150px" , display:"flex", marginTop:"70px", marginLeft:"-280px"}} className="reservas-stat-grid">
            {reservas.length > 0 && (
              <div className="reserva-stat-card" key={reservas[0].id}>
                <img className="reservaStatImg" src={`http://localhost:8000/media/${reservas[0].imagen}`} alt="Empleado" />
                <div className="reserva-stat-info">
                  <strong>Reservado por: {reservas[0].cliente}</strong>
                    Habitación: {reservas[0].habitacion}<br />
                    Monto: ${reservas[0].monto_total}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop:"25px"}} className="tarjeta-inferior">
          <h5 style={{fontSize:"medium"}} className="texto seccion-titulo">Habitaciones menos reservadas del mes</h5>
          <div style={{height:"150px", display:"flex", marginTop:"70px", marginLeft:"-300px"}} className="reservas-stat-grid">
            {reservas.length > 0 && (
              <div className="reserva-stat-card" key={reservas[0].id}>
                <img className="reservaStatImg" src={`http://localhost:8000/media/${reservas[0].imagen}`} alt="Empleado" />
                <div className="reserva-stat-info">
                  <strong>Reservado por: {reservas[0].cliente}</strong>
                    Habitación: {reservas[0].habitacion}<br />
                    Monto: ${reservas[0].monto_total}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReservas;
